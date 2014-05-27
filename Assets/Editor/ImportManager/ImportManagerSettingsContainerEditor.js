//#pragma strict

@CustomEditor (ImportManagerSettingsContainer)
class ImportManagerSettingsContainerEditor extends Editor 
{
	static var settings : ImportManagerSettingsContainer; //same as target, but static
	static var settingsSearched : boolean = false;
	
	function OnInspectorGUI () 
	{
		var wildcardTooltip : String = "\nWildcard asterics (*) and question (?) characters could be used in names. " + 
			"For example '*_Collider' means any object with postfix _Collider at the end."; 
		
		var prefabCreateTooltip : String = "\n\n Do Not Create: prefab is not created." +
			"\n In Same Folder: Prefab created in same folder with a model file." + 
			"\n In Prefabs Subfolder: Prefab created in same folder with a model file, but in a special prefabs subfolder." +
			"\n In Upper Folder: Prefab created in parent folder, a level higher than model file." +
			"\n In Upper Prefabs Folder: Prefab created in parent folder in special prefabs subfolder.";
		
		var materialFolderTooltip : String = "\n\n Do Not Create: material is not created." +
			"\n Model Folder: Material created in same folder with a model file." + 
			"\n Model Material Sub Folder: Material created in same folder with a model file, but in a special materials subfolder." +
			"\n Model Upper Material Folder: Material created in model parent folder, in a special materials subfolder." +
			"\n Texture Folder: Material created in same folder with a texture file." + 
			"\n Texture Material Sub Folder: Material created in same folder with a texture file, but in a special materials subfolder." +
			"\n Texture Upper Material Folder: Material created in texture parent folder, in a special materials subfolder." +
			"\nWarning: in last 3 cases: if texture not found material will not be created.";
		
		EditorStyles.foldout.fontStyle = FontStyle.Bold;
		
		/*
		target.fileAndDirectoryFoldout = EditorGUILayout.Foldout (target.fileAndDirectoryFoldout, "File and Folder Processing");
		if (target.fileAndDirectoryFoldout)
		{
			DisplayStringArray ("Ignore Folders:", target.ignoreFolders);
			target.ignoreFiles = DisplayStringArray ("Ignore Files:", target.ignoreFiles);
			target.normalMaps = DisplayStringArray ("Treat Textures as Normal Maps:", target.normalMaps);
			target.guiTextures = DisplayStringArray ("Treat Textures as GUI Textures:", target.guiTextures);
		}
		*/
		
		target.modelImportPatternFoldout = DisplayMiniFoldout("modelImportPatternFoldout", target.modelImportPatternFoldout);
		target.modelImportPatternEnable = DisplayPart("modelImportPatternEnable", "Model Import Rules", target.modelImportPatternEnable);
		if (target.modelImportPatternFoldout)
		{
			target.ignoreNames = DisplayStringArray (
				"ignoreNames",
				"Ignore Objects with these names:", 
				"Objects and meshes inside model file with these names will be removed." + wildcardTooltip, 
				target.ignoreNames);
			EditorGUILayout.Space();
			
			target.parentScriptComponents = DisplayStringArray (
				"parentScriptComponents",
				"Add Components to Parent:", 
				"All components in a list will be added to imported asset. Scripts will be added to the asset parent transform.", 
				target.parentScriptComponents);
			EditorGUILayout.Space();
			
			DisplayScriptsTable();
			EditorGUILayout.Space();
			
			target.colliderNames = DisplayStringArray (
				"colliderNames", 
				"Treat Objects with these names as Collider:",
				"Meshes with these names will be used as a Mesh Colliders. If object with the same name (but without collider postfix) " + 
				"is mesh parent or has common parent - mesh is assigned as object's Mesh Collider component mesh." + wildcardTooltip, 
				target.colliderNames);
			target.generateColliders = EditorGUILayout.EnumPopup ("\tOther Objects Collider", target.generateColliders);
			EditorGUILayout.Space();
			
			target.lodShadows = DiplayWideBoolean (
				"lodShadows", 
				"Disable LOD shadows and set LOD to Static", 
				"Af model has LODs - automaticly sets them to 'static' and disabling lod shadows for draw call economy.", 
				target.lodShadows);
			
			target.lodShadowLevel = Display ("lodShadowLevel", "From LOD Num:", 
				"All LODs from this level and further will be set to static and will have no shadows.", target.lodShadowLevel);
			EditorGUILayout.Space();
		}
		
		
		target.createPrefabFoldout = DisplayMiniFoldout("createPrefabFoldout", target.createPrefabFoldout);
		target.createPrefabEnable = DisplayPart("createPrefabEnable", "Automatic Prefab", target.createPrefabEnable);
		if (target.createPrefabFoldout)
		{
			//target.refreshPrefab = EditorGUILayout.Toggle (GUIContent("\tRefresh Prefab", 
			//	"Automaticly creates or refreshes prefabs to imported model. Every model will have a corresponding prefab to place in scene."), target.refreshPrefab);
			target.searchPrefabUp = DiplayWideBoolean ("searchPrefabUp","Search Prefab Up", 
				"Start to search prefab in a model folder and searching it up, until Assets folder is reached.", target.searchPrefabUp);
			target.searchIncludePrefabFolder = DiplayWideBoolean ("searchIncludePrefabFolder", "Include Prefab Folders in Search",
				"If search sees special prefabs folder on each search dir level - searching inside it.", target.searchIncludePrefabFolder);
			target.searchPrefabProjectwide = DiplayWideBoolean ("searchPrefabProjectwide", "If not found - Search Projectwide",
				"Search file in all folders inside Assets.", target.searchPrefabProjectwide);
			target.createPrefab = Display ("createPrefab", "Create if Not Found", "Defines a folder where prefab should be created:" + prefabCreateTooltip, target.createPrefab);
			target.prefabFolderName = Display ("prefabFolderName", "Prefabs Folder Name", "The name of a special prefabs folder.", target.prefabFolderName);
			target.replacePrefabOptions = Display ("replacePrefabOptions", "Replace Options", target.replacePrefabOptions);
			EditorGUILayout.Space();
		}
		
		target.materialSearchPatternFoldout = DisplayMiniFoldout("materialSearchPatternFoldout", target.materialSearchPatternFoldout);
		target.materialSearchPatternEnable = DisplayPart("materialSearchPatternEnable", "Material Search Pattern", target.materialSearchPatternEnable);
		if (target.materialSearchPatternFoldout)
		{

			//EditorGUILayout.Space();
			target.searchMaterialModel = DiplayWideBoolean ("searchMaterialModel", "Search Material in Model Folder and Upper",
				"Start to search material in a model folder and searching it up, until Assets folder is reached.", target.searchMaterialModel);
			target.searchMaterialTexture = DiplayWideBoolean ("searchMaterialTexture", "Search Material in Texture Folder and Upper",
				"Start to search material in a texture folder and searching it up, until Assets folder is reached.", target.searchMaterialTexture);
			target.searchMaterialMatfolders = DiplayWideBoolean ("searchMaterialMatfolders", "Include 'Materials' Folders in Search",
				"If search sees special material folder on each search dir level - searching inside it.", target.searchMaterialMatfolders);
			target.searchMaterialProjectwide = DiplayWideBoolean ("searchMaterialProjectwide", "If not found - Search Project-Wide",
				"Search file in all folders inside Assets.", target.searchMaterialProjectwide);
			
			EditorGUILayout.Space();
			EditorGUILayout.LabelField("\tIf Material not found (after all):");
			target.createMaterial = Display ("createMaterial", "Create Material In", "Defines a folder where material should be created:" + materialFolderTooltip, target.createMaterial);
			target.matfoldersName = Display ("matfoldersName", "Materials Folder Name", "The name of a special materials folder.", target.matfoldersName);
			
			//target.overwriteMaterial = Display ("\tOverwrite Material", target.overwriteMaterial);
		}
		
		target.defaultImportSettingsFoldout = Display("defaultImportSettingsFoldout", "Default Import Settings", "", target.defaultImportSettingsFoldout, true);
		if (target.defaultImportSettingsFoldout)
		{
			target.defaultModelsFoldout = DisplayDefaultImportFoldout("defaultModelsFoldout", "Models Import", target.defaultModelsFoldout);
			if (target.defaultModelsFoldout)
			{
				target.defaultModelsEnable = DiplayWideBoolean ("defaultModelsEnable", "Enabled", "", target.defaultModelsEnable, 30);
				EditorGUILayout.Space();
				
				GUILayout.Label("\t\tMeshes", "BoldLabel");
				target.globalScale = Display ("globalScale", "\tScale Factor", target.globalScale);
				target.meshCompression = Display ("meshCompression", "\tMesh Compression", target.meshCompression);
				target.isReadable = Display ("isReadable", "\tRead/Write Enabled", target.isReadable);
				target.optimizeMesh = Display ("optimizeMesh", "\tOptimize Mesh", target.optimizeMesh);
				//target.addCollider = Display ("addCollider", "\tGenerate Colliders", target.addCollider);
				//actually, all colliders are set to true, but later they will be deleted with postprocessmodel
				target.generateColliders = Display ("generateColliders", "\tGenerate Colliders", target.generateColliders);
				target.swapUVChannels = Display ("swapUVChannels", "\tSwap UVs", target.swapUVChannels);
				target.generateSecondaryUV = Display ("generateSecondaryUV", "\tGenerate Lightmap UVs", target.generateSecondaryUV);
				
				GUILayout.Label("\t\tNormals & Tangents", "BoldLabel");
				target.normalImportMode = Display ("normalImportMode", "\tNormals", target.normalImportMode);
				target.tangentImportMode = Display ("tangentImportMode", "\tTangents", target.tangentImportMode);
				target.normalSmoothingAngle = Display ("normalSmoothingAngle", "\tSmoothing Angle", target.normalSmoothingAngle);
				target.splitTangentsAcrossSeams = Display ("splitTangentsAcrossSeams", "\tSplit Tangents", target.splitTangentsAcrossSeams);
				
				GUILayout.Label("\t\tMaterials", "BoldLabel");
				EditorGUILayout.LabelField ("\tDefault material finding/generation method is");
				EditorGUILayout.LabelField ("\tused when Material Search Pattern is turned off");
				target.importMaterials = Display ("importMaterials", "\tImport Materials", target.importMaterials);
				target.materialName = Display ("materialName", "\tMaterial Naming", target.materialName);
				target.materialSearch = Display ("materialSearch", "\tMaterial Search", target.materialSearch);
	
				GUILayout.Label("\t\tAnimations", "BoldLabel");
				target.generateAnimations = Display ("generateAnimations", "\tGenerate Animations", target.generateAnimations);
				target.animationType = Display ("animationType", "\tAnimation Type", target.animationType);
				target.animationCompression = Display ("animationCompression", "\tCompression", target.animationCompression);
				target.animationRotationError = Display ("animationRotationError", "\tRotation Error", target.animationRotationError);
				target.animationPositionError = Display ("animationPositionError", "\tPosition Error", target.animationPositionError);
				target.animationScaleError = Display ("animationScaleError", "\tScale Error", target.animationScaleError);
				target.animationWrapMode = Display ("animationWrapMode", "\tWrap Mode", target.animationWrapMode);	
			}
			
			target.defaultTexturesFoldout = DisplayDefaultImportFoldout("defaultTexturesFoldout", "Textures Import", target.defaultTexturesFoldout);

			if (target.defaultTexturesFoldout)
			{
				var newEnable : boolean = DiplayWideBoolean ("defaultTexturesEnable", "Enabled", "", target.defaultTexturesEnable, 30);
				
				if (newEnable && !target.defaultTexturesEnable) //if turned on
					EditorUtility.DisplayDialog("Warning!",
					"Enabling default import settings for textures will reset import settings for files already imported. Please make sure that you have a backup copy of meta files or entire project.",
					"Continue");
				target.defaultTexturesEnable = newEnable;
				
				EditorGUILayout.Space();
				
				GUILayout.Label("\t\tTextures", "BoldLabel");
				target.textureType = Display ("textureType", "\tTexture Type", target.textureType);
				target.npotScale = Display ("npotScale", "\tNPOT Scale", target.npotScale);
				
				//target.compressionQuality = Display ("\tCompression Quality", target.compressionQuality); //WTF is texture compression quality?			
				
				target.maxTextureSize = Display ("maxTextureSize", "\tMax Size", target.maxTextureSize);
				target.textureFormat = Display ("textureFormat", "\tFormat", target.textureFormat);
				target.generateCubemap = Display ("generateCubemap", "\tGenerateCubemap", target.generateCubemap);
				target.textureIsReadable = Display ("textureIsReadable", "\tIsReadable", target.textureIsReadable);
				target.linearTexture = Display ("linearTexture", "\tLinear Texture", target.linearTexture);
				target.grayscaleToAlpha = Display ("grayscaleToAlpha", "\tGrayscale To Alpha", target.grayscaleToAlpha);
				
				target.normalmap = Display ("normalmap", "\tNormalmap", target.normalmap);
				if (target.normalmap) target.convertToNormalmap = Display ("convertToNormalmap", "\tConvert To Normalmap", target.convertToNormalmap);
				if (target.normalmap && target.convertToNormalmap) target.heightmapScale = Display ("convertToNormalmap", "\tHightmap Scale", target.heightmapScale);
				if (target.normalmap) target.normalmapFilter = Display ("normalmapFilter", "\tNormalmap Filter", target.normalmapFilter);
				
				target.lightmap = Display ("lightmap", "\tLightmap", target.lightmap);
				
				target.wrapMode = Display ("wrapMode", "\tWrap Mode", target.wrapMode);
				target.filterMode = Display ("filterMode", "\tFilter Mode", target.filterMode);
				target.anisoLevel = Display ("anisoLevel", "\tAniso Level", target.anisoLevel);
				
				GUILayout.Label("\t\tTexture Mipmaps", "BoldLabel");
				target.mipmapEnabled = Display ("mipmapEnabled", "\tMipmap Enabled", target.mipmapEnabled);
				target.generateMipsInLinearSpace = Display ("generateMipsInLinearSpace", "\tIn Linear Space", target.generateMipsInLinearSpace);
				target.borderMipmap = Display ("borderMipmap", "\tBorder Mipmap", target.borderMipmap);
				target.mipmapFilter = Display ("mipmapFilter", "\tMipmap Filter", target.mipmapFilter);
				target.fadeout = Display ("fadeout", "\tFadeout", target.fadeout);
				target.mipmapFadeDistanceStart = Display ("mipmapFadeDistanceStart", "\tFade Start", target.mipmapFadeDistanceStart);
				target.mipmapFadeDistanceEnd = Display ("mipmapFadeDistanceEnd", "\tFade End", target.mipmapFadeDistanceEnd);
				target.mipMapBias = Display ("mipMapBias", "\tMipmap Bias", target.mipMapBias);
			}
			
			target.defaultAudioFoldout = DisplayDefaultImportFoldout("defaultAudioFoldout", "Audio Import", target.defaultAudioFoldout);
			if (target.defaultAudioFoldout)
			{
				var newEnable2 : boolean = DiplayWideBoolean ("defaultAudioEnable", "Enabled", "", target.defaultAudioEnable, 30);
				
				if (newEnable2 && !target.defaultAudioEnable) //if turned on
					EditorUtility.DisplayDialog("Warning!",
					"Enabling default import settings for sounds will reset import settings for uncompressed audio files already imported. Please make sure that you have a backup copy of meta files or entire project.",
					"Continue");
				target.defaultAudioEnable = newEnable2;
				
				EditorGUILayout.Space();
				
				target.format = Display ("format", "\tAudio Format", target.format);
				target.threeD = Display ("threeD", "\t3D Sound", target.threeD);
				target.forceToMono = Display ("forceToMono", "\tForce to mono", target.forceToMono);
				target.loadType = Display ("loadType", "\tLoad Type", target.loadType);
				target.hardware = Display ("hardware", "\tHardware decoding", target.hardware);
				target.loopable = Display ("loopable", "\tGapless looping", target.loopable);
				target.compressionBitrate = Display ("compressionBitrate", "\tCompression(kbps)", target.compressionBitrate);
			}


		}

		
		//target.rawValuesFoldout = EditorGUILayout.Foldout (target.rawValuesFoldout, "Raw Values");
		//if (target.rawValuesFoldout) DrawDefaultInspector();
		
		//target.SetDirty();
	}
	
	function DiplayWideBoolean (control:String, name:String, input:boolean) : boolean { return DiplayWideBoolean(control,name,"",input,20); }
	function DiplayWideBoolean (control:String, name:String, tooltip:String, input:boolean) : boolean { return DiplayWideBoolean(control,name,tooltip,input,20); }
	function DiplayWideBoolean (control:String, name:String, tooltip:String, input:boolean, offset:int) : boolean
	{
		var result : boolean;
		
		rect = GUILayoutUtility.GetRect (15, 15, "TextField");
		rect.x += offset;
		result = EditorGUI.Toggle (rect, input);
		rect.x += 15;
		EditorGUI.LabelField (rect, GUIContent(name, tooltip));
		
		if (input != result) ImportManager.SaveInXml(control, result.ToString());
		
		return result;
	}
	
	function DisplayStringArray (control:String, name:String, array:String[]) : String[] { return DisplayStringArray(control, name, "", array); }
	function DisplayStringArray (control:String, name:String, tooltip:String, array:String[]) : String[]
	{
		var newArray : String[] = array;
		var change : boolean;
		var newVal : String;

		rect = GUILayoutUtility.GetRect (150, 20 + array.length*17, "TextField");
		
		var fieldRect : Rect = new Rect (rect.x+30,rect.y+16,rect.width-94,16);
		var buttonRect = new Rect(rect.width-60,rect.y+16,20,16);
		for (var i:int=0; i<array.length; i++)
		{
			newVal = EditorGUI.TextField (fieldRect, array[i]);
			if (newVal != array[i]) { array[i] = newVal; change = true; }
			if (GUI.Button (buttonRect, "-"))
			{
				change = true;
				newArray = new String[array.length-1];
				for (var j=0; j<newArray.length; j++) 
				{
					if (j<i) newArray[j] = array[j];
					else newArray[j] = array[j+1];
				}
			}
			fieldRect.y += 17;
			buttonRect.y += 17;
		}
		
		buttonRect.x += 22; buttonRect.y -= 17;
		if (GUI.Button (buttonRect, "+"))
		{
			change = true;
			newArray = new String[array.length+1];
			for (i=0; i<array.length; i++) newArray[i] = array[i];
		}
		
		EditorGUI.LabelField (rect, GUIContent("\t" + name, tooltip));
		/*
		//looking if there was change
		var change : boolean = false;
		if (array.length != newArray.length) change = true;
		else for (i=0; i<array.length; i++)
			if (String.Equals(array[i],newArray[i])) {Debug.Log(array[i] + " " + newArray[i]);change = true;}
		*/
		
		if (change) ImportManager.SaveArrayInXml (control, newArray);
		
		return newArray;
	}
	
	function DisplayScriptsTable ()
	{
			var change : boolean = false;
			var newVal : String;
			
			rect = GUILayoutUtility.GetRect (150, 37 + target.scriptNames.length*17, "TextField");
			
			EditorGUI.LabelField (rect, GUIContent("\tAdd Components to corresponding Objects", ""));
		
			var keyRect : Rect = new Rect (rect.x+30,rect.y+16,rect.width*.5-40,16);
			var valueRect : Rect = new Rect (rect.x+rect.width*.5-10,rect.y+16,rect.width*.5-54,16);
			var buttonRect = new Rect(rect.width-60,rect.y+16,20,16);
			
			EditorGUI.LabelField (keyRect, "Object Name:"); keyRect.y += 17;
			EditorGUI.LabelField (valueRect, "Component:"); valueRect.y += 17;
			buttonRect.y += 17;
			
			for (var i:int=0; i<target.scriptNames.length; i++)
			{
				newVal = EditorGUI.TextField (keyRect, target.scriptNames[i]);
				if (newVal != target.scriptNames[i]) { target.scriptNames[i] = newVal; change = true; }

				newVal = EditorGUI.TextField (valueRect, target.scriptComponents[i]);
				if (newVal != target.scriptComponents[i]) { target.scriptComponents[i] = newVal; change = true; }

				if (GUI.Button (buttonRect, "-"))
				{
					change = true;
					var newScriptNames : String[] = new String[target.scriptNames.length-1];
					var  newScriptComponents : String[] = new String[target.scriptNames.length-1];
					for (var j=0; j<newScriptNames.length; j++) 
					{
						if (j<i) { newScriptNames[j] = target.scriptNames[j];
							newScriptComponents[j] = target.scriptComponents[j]; }
						else { newScriptNames[j] = target.scriptNames[j+1];
							newScriptComponents[j] = target.scriptComponents[j+1]; }
					}
					target.scriptNames = newScriptNames;
					target.scriptComponents = newScriptComponents;
				}
				keyRect.y += 17;
				valueRect.y += 17;
				buttonRect.y += 17;
			}
		
		buttonRect.x += 22; buttonRect.y -= 17;
		if (GUI.Button (buttonRect, "+"))
		{
			change = true;
			newScriptNames = new String[target.scriptNames.length+1];
			newScriptComponents = new String[target.scriptComponents.length+1];
			
			for (i=0; i<target.scriptNames.length; i++) { newScriptNames[i] = target.scriptNames[i];
				newScriptNames[i] = target.scriptComponents[i]; }
			
			target.scriptNames = newScriptNames;
			target.scriptComponents = newScriptComponents; 
		}
		
		if (change) 
		{
			ImportManager.SaveArrayInXml ("scriptNames", target.scriptNames);
			ImportManager.SaveArrayInXml ("scriptComponents", target.scriptComponents);
		}
	}
	
	function DisplayMiniFoldout (control:String, input:boolean)
	{
		var result : boolean;
		
		rect = GUILayoutUtility.GetRect (15, 15, "TextField");
		rect.width = 15;
		result =  EditorGUI.Foldout (rect, input, "");
			
		if (input != result) ImportManager.SaveInXml(control, result.ToString());
		
		return result;
	}
	
	function DisplayPart (control:String, label:String, input:boolean)
	{
		var result : boolean;
		
		rect = GUILayoutUtility.GetLastRect ();
		rect.x += 13; rect.y -= 1;
		result = EditorGUI.Toggle (rect, input);
		
		rect.x += 13; rect.y += 1;
		GUI.Label(rect, label, "BoldLabel");
		
		if (input != result) ImportManager.SaveInXml(control, result.ToString());
		
		return result;
	}
	
	function DisplayDefaultImportFoldout (control:String, name:String, input:boolean) : boolean
	{
		var result : boolean;
		
		rect = GUILayoutUtility.GetRect (15, 15, "TextField");
		rect.x += 15;
		result = EditorGUI.Foldout (rect, input, name);
		
		if (input != result) ImportManager.SaveInXml(control, result.ToString());
		
		return result;
	}
	
	function Display (control:String, name:String, input:Object) { return Display (control, name, "", input, false); }
	function Display (control:String, name:String, tooltip:String, input:Object) { return Display (control, name, tooltip, input, false); }
	function Display (control:String, name:String, input:Object, isFoldout:boolean) { return Display (control, name, "", input, false); }
	function Display (control:String, name:String, tooltip:String, input:Object, isFoldout:boolean)
	{
		var guicontent : GUIContent = GUIContent("\t"+name, tooltip);
		var result;
		switch (typeof(input))
		{
			case int : result = EditorGUILayout.IntField (guicontent, input); break;
			case float : result = EditorGUILayout.FloatField (guicontent, input); break;
			case String : result = EditorGUILayout.TextField (guicontent, input); break;
			case boolean : 
				if (isFoldout) result = EditorGUILayout.Foldout (input, name);
				else result = EditorGUILayout.Toggle (guicontent, input); 
				break;
			
			//case enum : see below;
		}

		if (typeof(input).IsEnum) result = EditorGUILayout.EnumPopup (guicontent, input);
		
		//Debug.Log(typeof(result) + " " + typeof(input));
		
		if (input != result) ImportManager.SaveInXml(control, result.ToString());
		return result;
	}

}