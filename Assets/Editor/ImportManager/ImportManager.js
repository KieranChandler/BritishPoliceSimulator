//#pragma strict

import System.IO;
import System.Xml;

class ImportManager extends AssetPostprocessor 
{
	static var settings : ImportManagerSettingsContainer;
	static var settingsFile : String;
	static var dataPath : String; //proper format of current project folder

	
	@MenuItem("Edit/Project Settings/Import Manager")
	static function SelectSettings() 
	{
		LoadSettings();
		Selection.activeObject = settings;
	}
	
	//searching ImportManagerSettings.asset component
	static function LoadSettings () : void
	{
		if (!!settings) return; //already loaded
		
		//creating settings object and loading from xml
		settings = new ScriptableObject.CreateInstance(ImportManagerSettingsContainer);
		
		//searching settings file
		settingsFile = SearchFileDown("Assets/", "ImportManagerSettings.xml");
		
		//loading from xml
		var xml = new XmlDocument ();
		xml.Load(settingsFile);
		
		var fields = typeof(ImportManagerSettingsContainer).GetFields();
		for (var i:int=0;i<fields.length;i++)
		{
			var node = xml.SelectSingleNode("system/" + fields[i].Name);
			if (!node) continue;
			var nodeVal : String = node.InnerText;
			
			switch (fields[i].FieldType)
			{
				case float : 
					var val:float;
					float.TryParse(nodeVal, val);
					fields[i].SetValue(settings, val);
					break;
				
				case int : fields[i].SetValue(settings, parseInt(nodeVal)); break;
				
				case boolean : 
					if (nodeVal=="True") fields[i].SetValue(settings, true);
					else fields[i].SetValue(settings, false);
					break;
					
				case String : fields[i].SetValue(settings, nodeVal); break;
					
				case typeof(String[]) :
					var subnode : XmlNode = node.FirstChild;; 
					var length=parseInt(subnode.InnerText);
					var array = new String[length];
					for (var j:int; j<length; j++)
					{
						subnode = subnode.NextSibling;
						array[j] = subnode.InnerText;
					}
					fields[i].SetValue(settings,array);
					break;
			}
			
			if (fields[i].FieldType.IsEnum) 
			{
				var enumval = System.Enum.Parse(fields[i].FieldType, nodeVal);
				fields[i].SetValue(settings,enumval);
			}
		}
	}

	
	static function SaveInXml (nodePath:String, val:String)
	{
		LoadSettings();
		var xml = new XmlDocument ();
		
		//try to set in already existing node
		xml.Load(settingsFile);
		var node = xml.SelectSingleNode("system/" + nodePath);
		
		if (!!node) node.InnerText = val;
		else //creating new node
		{
			var element = xml.CreateElement(nodePath);
			xml.DocumentElement.AppendChild(element);
			element.InnerText = val;
		}
		
		try xml.Save(settingsFile);
		catch (err) {};
	}
	
	static function SaveArrayInXml (nodePath:String, array:String[])
	{
		LoadSettings();
		var xml = new XmlDocument ();
		
		//try to set in already existing node
		xml.Load(settingsFile);
		var node = xml.SelectSingleNode("system/" + nodePath);
		
		if (!!node) xml.SelectSingleNode("system").RemoveChild(node);
		
		node = xml.CreateElement(nodePath);
		xml.DocumentElement.AppendChild(node);

		var subnode = xml.CreateElement("length");
		node.AppendChild(subnode);
		subnode.InnerText = array.length.ToString();
		
		for (var i:int=0; i<array.length; i++)
		{
			subnode = xml.CreateElement("element");
			node.AppendChild(subnode);
			subnode.InnerText = array[i];
		}

		try xml.Save(settingsFile);
		catch (err) {};
	}
	
	
	
	//does input string contains onother string (or array of strings) with wildcard symbols?
	static function ContainsWildcard(input:String, wildcard:String)
	{
		var regex:Regex = new Regex(
			"^" + Regex.Escape(wildcard).
			Replace("\\*", ".*").
			Replace("\\?", ".") + "$");
		return regex.IsMatch(input);
	}
	
	static function ContainsWildcard(input:String, wildcards:String[])
	{
		for (var i:int=0;i<wildcards.length;i++)
			if (ContainsWildcard(input, wildcards[i])) return true;
		return false;
	}


	//gats a name of an object withot wildcard string (or array of strings)
	static function GetBaseObjectName (fullname:String, wildcard:String)
	{
		var wildcardWithoutSymbols : String = wildcard.Replace("*","");
		wildcardWithoutSymbols = wildcardWithoutSymbols.Replace("?","");
		
		if (!fullname.Contains(wildcardWithoutSymbols)) return null;
		else return fullname.Replace(wildcardWithoutSymbols,"");
	}
	
	static function GetBaseObjectName (fullname:String, wildcards:String[])
	{
		var result : String;
		for (var i:int=0;i<wildcards.length;i++)
		{
			result = GetBaseObjectName (fullname, wildcards[i]);
			if (!!result) return result;
		}
	}

	
	
	//setting defaults
	function OnPreprocessModel() 
	{
		LoadSettings();
		
		if (assetImporter.transformPaths.length==0 && assetImporter.globalScale==0) //if it is a new object
		{
			if (!settings.defaultModelsEnable) return;
			
			assetImporter.importMaterials = settings.importMaterials;
			assetImporter.materialName = settings.materialName;
			assetImporter.materialSearch = settings.materialSearch;
			assetImporter.globalScale = settings.globalScale;
			//assetImporter.addCollider = true; //and postprocessing colliders in onpostprocessmodel //settings.addCollider;
			assetImporter.normalSmoothingAngle = settings.normalSmoothingAngle;
			assetImporter.splitTangentsAcrossSeams = settings.splitTangentsAcrossSeams;
			assetImporter.swapUVChannels = settings.swapUVChannels;
			assetImporter.generateSecondaryUV = settings.generateSecondaryUV;
			assetImporter.generateAnimations = settings.generateAnimations;
			assetImporter.isReadable = settings.isReadable;
			assetImporter.optimizeMesh = settings.optimizeMesh;
			assetImporter.normalImportMode = settings.normalImportMode;
			assetImporter.tangentImportMode = settings.tangentImportMode;
			assetImporter.meshCompression = settings.meshCompression;
			assetImporter.animationCompression = settings.animationCompression;
			assetImporter.animationRotationError = settings.animationRotationError;
			assetImporter.animationPositionError = settings.animationPositionError;
			assetImporter.animationScaleError = settings.animationScaleError;
			assetImporter.animationWrapMode = settings.animationWrapMode;
			assetImporter.animationType = settings.animationType;
		}
		
		assetImporter.addCollider = true; //and postprocessing colliders in onpostprocessmodel //settings.addCollider;
		
		//turning off material generation if advanced material pattern enabled
		if (settings.materialSearchPatternEnable) assetImporter.importMaterials = false;
	}
	
	function OnPreprocessTexture() 
	{
		if (assetImporter.filterMode == -1) //if it is a new object.
		{
			LoadSettings();

			if (!settings) return;
			if (!settings.defaultTexturesEnable) return;
			
			assetImporter.textureFormat = settings.textureFormat;
			assetImporter.maxTextureSize  = settings.maxTextureSize;
			assetImporter.compressionQuality = settings.compressionQuality;
			assetImporter.grayscaleToAlpha = settings.grayscaleToAlpha;
			assetImporter.generateCubemap = settings.generateCubemap;
			assetImporter.npotScale = settings.npotScale;
			assetImporter.isReadable = settings.textureIsReadable;
			assetImporter.mipmapEnabled = settings.mipmapEnabled;
			assetImporter.borderMipmap = settings.borderMipmap;
			assetImporter.linearTexture = settings.linearTexture;
			assetImporter.mipmapFilter = settings.mipmapFilter;
			assetImporter.fadeout = settings.fadeout;
			assetImporter.mipmapFadeDistanceStart = settings.mipmapFadeDistanceStart;
			assetImporter.mipmapFadeDistanceEnd = settings.mipmapFadeDistanceEnd;
			assetImporter.generateMipsInLinearSpace = settings.generateMipsInLinearSpace;
			assetImporter.convertToNormalmap = settings.convertToNormalmap;
			assetImporter.normalmap = settings.normalmap;
			assetImporter.normalmapFilter = settings.normalmapFilter;
			assetImporter.heightmapScale = settings.heightmapScale;
			assetImporter.lightmap = settings.lightmap;
			assetImporter.anisoLevel = settings.anisoLevel;
			assetImporter.filterMode = settings.filterMode;
			assetImporter.wrapMode = settings.wrapMode;
			assetImporter.mipMapBias = settings.mipMapBias;
			assetImporter.textureType = settings.textureType;
		}
	}
	
	function OnPreprocessAudio() 
	{
		var assetImporterFormat : AudioImporterFormat = assetImporter.format;
		var assetImporterLoadType : AudioImporterLoadType = assetImporter.loadType;
		
		if (assetImporterFormat == AudioImporterFormat.Native && assetImporterLoadType == AudioImporterLoadType.CompressedInMemory) //if it is a new object.
		{
			LoadSettings();

			if (!settings.defaultAudioEnable) return;

			assetImporter.format = settings.format;
			assetImporter.compressionBitrate = settings.compressionBitrate;
			assetImporter.threeD = settings.threeD;
			assetImporter.forceToMono = settings.forceToMono;
			assetImporter.hardware = settings.hardware;
			assetImporter.loadType = settings.loadType;
			assetImporter.loopable = settings.loopable;
		}
	}

        
	function OnPostprocessModel (gameObject:GameObject)
	{
		LoadSettings();   
		
		//processing model
		if (settings.modelImportPatternEnable)
		{
			var transform = gameObject.transform;
			
			//setting scripts to parent obj
			for (var i:int=0;i<settings.parentScriptComponents.length;i++)
				transform.gameObject.AddComponent(settings.parentScriptComponents[i]);
			
			PostprocessModel (transform);
		}
	}
	
	function PostprocessModel (transform:Transform)
	{
        var filter : MeshFilter = transform.GetComponent(MeshFilter);
        var collider : MeshCollider = transform.GetComponent(MeshCollider);
        
       
        //removing ignored
        if (transform != null && ContainsWildcard(transform.name, settings.ignoreNames))
        {
            //removing mesh
            if (!!filter)
            {
                var mesh : Mesh = filter.sharedMesh;
                if (!!mesh) GameObject.DestroyImmediate(mesh, true);
            }

            //removing transform
            GameObject.DestroyImmediate(transform.gameObject, true);
        }
        
        
        //setting object collision
        if (transform != null && ContainsWildcard(transform.name, settings.colliderNames))
        {
            //finding collider mesh itself
            if (!!filter)
            {
                var colliderMesh : Mesh = filter.sharedMesh; //note that filter mesh becomes collider mesh
                if (!!colliderMesh)
                {

                    //finding transform to assign this collision
                    var baseTfmName : String = GetBaseObjectName(transform.name, settings.colliderNames);
                    var baseTfm : Transform;
                    if (transform.parent.name == baseTfmName) baseTfm = transform.parent;
                    if (!baseTfm)
                   		for (var neig:Transform in transform.parent)
                        	if (neig.name == baseTfmName)
                            	baseTfm = neig;


                    //adding collider component to main mesh
                    if (!!baseTfm)
                    {
                        var baseCollider : MeshCollider = baseTfm.gameObject.GetComponent(MeshCollider);
                        if (!baseCollider) baseCollider = baseTfm.gameObject.AddComponent(MeshCollider);

                        baseCollider.sharedMesh = colliderMesh;

                        GameObject.DestroyImmediate(transform.gameObject, true);
                    }


                    //making collision-only mesh
                    else
                    {
                        if (!collider) collider = transform.gameObject.AddComponent(MeshCollider);

                        collider.sharedMesh = colliderMesh;

                        GameObject.DestroyImmediate(filter, true);
                        GameObject.DestroyImmediate(transform.GetComponent(MeshRenderer), true);
                    }
                }
            }
        }
        
        //removing collision if no collider assigned
        else if (settings.generateColliders == ImportManagerGenerateColliders.noCollider)
        {
            if (!!filter && !!collider && filter.sharedMesh == collider.sharedMesh)
                GameObject.DestroyImmediate(collider, true);
        }

        //setting scripts
        if (!!transform)
        {
            for (var i:int=0;i<settings.scriptNames.length;i++)
            {
	            if (ContainsWildcard(transform.name, settings.scriptNames[i]))
	            	transform.gameObject.AddComponent(settings.scriptComponents[i]);
            }
        }
        
        //turning off shadows and setting static for lods
        if (!!transform && transform.name.Contains("_LOD") && settings.lodShadows)
        {
        	var lodSignNum : int = transform.name.IndexOf("_LOD") + 4;
        	var lodNum : int;
        	if (!!int.TryParse(transform.name[lodSignNum].ToString(),lodNum))
        	{
        		if (lodNum >= settings.lodShadowLevel) 
        		{
        			if (!!transform.renderer) transform.renderer.castShadows = false;
        			transform.gameObject.isStatic = true;
        		}
        	}
        }

        //recurse
        if (!!transform)
            for (i = transform.childCount - 1; i >= 0; i--)
                PostprocessModel(transform.GetChild(i));
    }
	
	function OnAssignMaterialModel (material : Material, renderer : Renderer) : Material 
	{
		if (material.name.length == 0) return; //if no material assigned in 3d editor
		
		LoadSettings();
		
		if (!settings.materialSearchPatternEnable) return;
		
		var materialFile : String;
		
		var materialName : String = material.name + ".mat";	
		var materialsFolderName : String;
		if (settings.searchMaterialMatfolders && settings.matfoldersName.length != 0) materialsFolderName = settings.matfoldersName;

		//searching 'model folder and up'
		if (settings.searchMaterialModel)
			materialFile = SearchFileUp( Path.GetDirectoryName(assetImporter.assetPath), materialName, materialsFolderName);

		//searching 'texture folder and up'
		if (!materialFile && settings.searchMaterialTexture)
		{
			var texture : Texture = material.GetTexture("_MainTex");
			if (!!texture)
				materialFile = SearchFileUp( Path.GetDirectoryName(AssetDatabase.GetAssetPath(texture)), materialName, materialsFolderName);
		}
		
		//seraching material project-wide
		if (!materialFile && settings.searchMaterialProjectwide)
			materialFile = SearchFileDown("Assets/", materialName);
		
		//if material found - returnin it
		if (!!materialFile) return AssetDatabase.LoadAssetAtPath(materialFile, Material);
		
		//creating matrial if not found
		if (!materialFile && settings.createMaterial != ImportManagerCreateMaterialFolder.doNotCreate)
		{
			//finding material folder
			var modelDir : String = Path.GetDirectoryName(assetImporter.assetPath);
			texture = material.GetTexture("_MainTex");
			if (!texture && 
				(ImportManagerCreateMaterialFolder.textureFolder ||
				ImportManagerCreateMaterialFolder.textureMaterialSubFolder ||
				ImportManagerCreateMaterialFolder.textureUpperMaterialFolder)) return;
			var textureDir : String = Path.GetDirectoryName(AssetDatabase.GetAssetPath(texture));
			
			switch (settings.createMaterial)
			{
				case ImportManagerCreateMaterialFolder.modelFolder: materialFile = modelDir; break;
				case ImportManagerCreateMaterialFolder.modelMaterialSubFolder: 
					if (settings.matfoldersName.length != 0) materialFile = modelDir + "/" + settings.matfoldersName; 
					else materialFile = modelDir;
					break;
				case ImportManagerCreateMaterialFolder.modelUpperMaterialFolder: 
					if (settings.matfoldersName.length != 0) materialFile = GetParentFolder(modelDir) + "/" + settings.matfoldersName; 
					else materialFile = GetParentFolder(modelDir);
					break;

				case ImportManagerCreateMaterialFolder.textureFolder: materialFile = textureDir; break;
				case ImportManagerCreateMaterialFolder.textureMaterialSubFolder: 
					if (settings.matfoldersName.length != 0) materialFile = textureDir + "/" + settings.matfoldersName; 
					else materialFile = textureDir;
					break;
				case ImportManagerCreateMaterialFolder.textureUpperMaterialFolder: 
					if (settings.matfoldersName.length != 0) materialFile = GetParentFolder(textureDir) + "/" + settings.matfoldersName; 
					else materialFile = GetParentFolder(textureDir);
					break;
			}
			
			if (!materialFile) { Debug.LogWarning("Could not get Materials folder for " + material.name + ". Material was not created"); return; }
			
			CreateDir(materialFile);
			materialFile += "/"+materialName;

			var newMat : Material = AssetDatabase.LoadAssetAtPath(materialFile, Material);
			
			//if file exists - clearing it
			if (!!newMat) 
			{ 
				newMat.CopyPropertiesFromMaterial(new Material (Shader.Find("Diffuse")));
				newMat.shader = Shader.Find("Diffuse");
				texture = material.GetTexture("_MainTex");
				if (!!texture) newMat.SetTexture("_MainTex", texture);
			}
			
			//creating material
			if (!newMat) 
			{
				AssetDatabase.CreateAsset(material, materialFile);
				newMat = material;
			}
			
			return newMat;
		}
	}
	
	static function OnPostprocessAllAssets
		(importedAssets : String[],
		deletedAssets : String[],
		movedAssets : String[],
		movedFromAssetPaths : String[])
	{
		LoadSettings(); 
		
		//creating prefab
		for (var i:int=0;i<importedAssets.length; i++)
			if (settings.createPrefabEnable && IsModel(importedAssets[i])) CreatePrefab (importedAssets[i]);
	}
	
	static function IsModel (path:String)
	{
		var lPath : String = path.ToLower();
		return lPath.EndsWith(".fbx") || lPath.EndsWith(".mb") || lPath.EndsWith(".ma") || lPath.EndsWith(".max") || lPath.EndsWith(".jas") || lPath.EndsWith(".c4d") || 
			lPath.EndsWith(".blend") || lPath.EndsWith(".lxo") || lPath.EndsWith(".lwo") || lPath.EndsWith(".lws") || lPath.EndsWith(".dae") || 
			lPath.EndsWith(".skp") || lPath.EndsWith(".3ds") || lPath.EndsWith(".obj") || lPath.EndsWith(".dxf") || lPath.EndsWith(".wings"); 
	}
	
	static function CreatePrefab (modelPath:String)
	{
			var prefabPath : String; 
			
			//var modelPath : String = assetImporter.assetPath;
			var prefabFileName : String = Path.GetFileNameWithoutExtension(modelPath) + ".prefab";

			//searching up
			if (settings.searchPrefabUp) 
			{
				var specialFolder : String;
				if (settings.searchIncludePrefabFolder && settings.prefabFolderName.length != 0) specialFolder = settings.prefabFolderName;
				prefabPath = SearchFileUp (Path.GetDirectoryName(modelPath), prefabFileName, specialFolder);
			}
			
			//searchig projectwide
			if (!prefabPath && settings.searchPrefabProjectwide)
				prefabPath = SearchFileDown("Assets/", prefabFileName);
			
			
			//adding prefab if not found
			var prefab : GameObject;
			if (!prefabPath && settings.createPrefab != ImportManagerCreatePrefab.doNotCreate)
			{
				var modelDir : String = Path.GetDirectoryName(modelPath);
				switch (settings.createPrefab)
				{
					case ImportManagerCreatePrefab.inSameFolder : prefabPath = modelDir; break;
					case ImportManagerCreatePrefab.inPrefabsSubfolder : 
						if (settings.prefabFolderName.length != 0) prefabPath = modelDir + "/" + settings.prefabFolderName;
						else prefabPath = modelDir;
						break;
					case ImportManagerCreatePrefab.inUpperFolder : prefabPath = GetParentFolder(modelDir); break;
					case ImportManagerCreatePrefab.inUpperPrefabsFolder : 
						if (settings.prefabFolderName.length != 0) prefabPath = GetParentFolder(modelDir) + "/" + settings.prefabFolderName; 
						else prefabPath = GetParentFolder(modelDir);
						break;
				}
				CreateDir(prefabPath);
				prefabPath += "/"+prefabFileName;
				prefab = PrefabUtility.CreatePrefab(prefabPath, AssetDatabase.LoadAssetAtPath(modelPath, GameObject));
			}
			
			//replcing prefab if it was found
			if (!!prefabPath)
			{
				var oldprefab : GameObject = AssetDatabase.LoadAssetAtPath(prefabPath, GameObject);
				if (!!oldprefab) prefab = PrefabUtility.ReplacePrefab(AssetDatabase.LoadAssetAtPath(modelPath, GameObject), oldprefab, settings.replacePrefabOptions);
				else //removing old file and creating new
				{
					AssetDatabase.DeleteAsset(prefabPath);
					prefab = PrefabUtility.CreatePrefab(prefabPath, AssetDatabase.LoadAssetAtPath(modelPath, GameObject));
				}
			}
	}
	
	
	//File operations

	static function LocalToAbsolute (path:String) : String
		{ return Application.dataPath.Remove(Application.dataPath.length-6) + path; }

	static function AbsoluteToLocal (path:String) : String //only string operations, no files or dirs
	{ 
		if (!dataPath) dataPath = DirectoryInfo(Application.dataPath).FullName;
		return path.Replace(dataPath,"Assets"); 
	}
	
	static function GetParentFolder (startPath:String)
	{
		return AbsoluteToLocal( DirectoryInfo(LocalToAbsolute(startPath)).Parent.FullName );
	}
	
	static function CreateDir (localPath:String)
	{
		var dir:DirectoryInfo = DirectoryInfo(LocalToAbsolute(localPath));
		if (!dir.Exists) dir.Create();
	}
		
	static function SearchFileUp (startPath:String, fileName:String, specificFolderName:String) : String //in local path
	{
		var result : FileInfo = SearchFileUp(
			DirectoryInfo(LocalToAbsolute(startPath)),
			fileName, specificFolderName);
		if (!!result) return AbsoluteToLocal(result.FullName);
	}
	
	static function SearchFileUp (startDirectory:DirectoryInfo, fileName:String, specificFolderName:String) : FileInfo //in absolute path
	{
		if (!dataPath) dataPath = DirectoryInfo(Application.dataPath).FullName;
		if (!startDirectory.FullName.Contains(dataPath)) return null;
		
		var files : FileInfo[] = startDirectory.GetFiles(fileName);
		if (files.length > 0) return files[0];
		
		if (!!specificFolderName)
		{
			var specificFolders : DirectoryInfo[] = startDirectory.GetDirectories(specificFolderName);

			if (specificFolders.length > 0)
			{
				files = specificFolders[0].GetFiles(fileName);
				if (files.length > 0) return files[0];
			}
		}

		//if still not returned - continue to search up
		return SearchFileUp (startDirectory.Parent, fileName, specificFolderName);
	}
	
	static function SearchFileDown (startPath:String, fileName:String) : String //in local path
	{
		var result : FileInfo = SearchFileDown(
			DirectoryInfo(LocalToAbsolute(startPath)),
			fileName);
		if (!!result) return AbsoluteToLocal(result.FullName);
	}
	
	static function SearchFileDown (startDirectory:DirectoryInfo, fileName:String) : FileInfo //in absolute path
	{
		if (startDirectory.Attributes == FileAttributes.Hidden) return;
		var files : FileInfo[] = startDirectory.GetFiles(fileName);
		if (files.length > 0) return files[0];
		
		var subdirs : DirectoryInfo[] = startDirectory.GetDirectories();
		var foundFile : FileInfo;
		for (var i:int=0; i<subdirs.length; i++)
		{
			foundFile = SearchFileDown (subdirs[i], fileName); 
			if (!!foundFile) return foundFile;
		}
	}
	

}
