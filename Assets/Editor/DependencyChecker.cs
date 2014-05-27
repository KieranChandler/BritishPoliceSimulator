// Dependency Checker
// based off the "Resource Checker" free utility in the Unity Asset store https://www.assetstore.unity3d.com/#/content/3224
// extended and heavily modified.

using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

public class Util
{
	public static bool ctrlPressed = false;
	
	public static int ThumbnailWidth = 50;
	public static int ThumbnailHeight = 50;
	
	public static void SelectObject( Object selectedObject )
	{
		if ( Util.ctrlPressed )
		{
			List<Object> currentSelection = new List<Object>(Selection.objects);
			
			// Allow toggle selection
			if (currentSelection.Contains(selectedObject)) 
				currentSelection.Remove(selectedObject);
			else currentSelection.Add(selectedObject);
			
			Selection.objects=currentSelection.ToArray();
		}
		else Selection.activeObject=selectedObject;
	}
	
	public static void SelectObjects(List<Object> selectedObjects )
	{
		if ( Util.ctrlPressed )
		{
			List<Object> currentSelection = new List<Object>(Selection.objects);
			currentSelection.AddRange(selectedObjects);
			Selection.objects=currentSelection.ToArray();
		}
		else 
			Selection.objects=selectedObjects.ToArray();
	}
	
	public static void SelectObjects(List<GameObject> selectedObjects )
	{
		if ( Util.ctrlPressed )
		{
			List<Object> currentSelection = new List<Object>(Selection.objects);
			
			foreach ( GameObject obj in selectedObjects )
			{
				currentSelection.Add( obj );
			}
			
			Selection.objects=currentSelection.ToArray();
		}
		else 
			Selection.objects=selectedObjects.ToArray();
	}
}

public class TextureDetails
{
	public bool isCubeMap;
	public int memSizeBytes;
	public Texture texture;
	public TextureFormat format;
	public int mipMapCount;
	
	public List<Object> FoundInMaterials=new List<Object>();
	public List<Object> FoundInRenderers=new List<Object>();
	public List<Object> FoundInLights=new List<Object>();
	public List<GameObject> FoundInGameObjects = new List<GameObject>();
		
	public TextureDetails( Texture tex )
	{
		texture = tex;
		isCubeMap = tex is Cubemap;				
		memSizeBytes = TextureDetails.CalculateTextureSizeBytes( tex );
		format = TextureFormat.RGBA32;
		mipMapCount = 1;
		if ( texture is Texture2D )
		{
			format = ( texture as Texture2D ).format;
			mipMapCount = ( texture as Texture2D ).mipmapCount;
		}
		if (texture is Cubemap)
		{
			format = ( texture as Cubemap ).format;
		}
	}
	
	public void OnGui()
	{
		if ( texture != null )
		{
			Texture thumb = texture;
					
			GUILayout.BeginHorizontal();
			GUILayout.Box(thumb, GUILayout.Width( Util.ThumbnailWidth ), GUILayout.Height( Util.ThumbnailHeight ));
			
			if(GUILayout.Button( new GUIContent( texture.name, texture.name ), GUILayout.Width(150), GUILayout.Height(50) ) )
				Util.SelectObject( texture );
			
			Texture2D iconMaterials = AssetPreview.GetMiniTypeThumbnail( typeof( Material ) );
			if ( GUILayout.Button( new GUIContent( FoundInMaterials.Count.ToString(), iconMaterials, "Materials" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInMaterials );
			
			Texture2D iconGameObj = AssetPreview.GetMiniTypeThumbnail( typeof( GameObject ) );
			if ( GUILayout.Button( new GUIContent( FoundInGameObjects.Count.ToString(), iconGameObj, "Game Objects" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInGameObjects );				
			
			Texture2D iconLight = AssetPreview.GetMiniTypeThumbnail( typeof( Light ) );
			if ( GUILayout.Button( new GUIContent( FoundInLights.Count.ToString(), iconLight, "Lights" ), GUILayout.Width(50), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInLights );
			
			string labelTxt = string.Format( "{0}x{1}{2}\n{3} MIP Levels\n{4} - {5}",
				texture.width,
				texture.height,
				isCubeMap ? " (x6 cube)" : "",
				mipMapCount,
				EditorUtility.FormatBytes( memSizeBytes ),
				format );
			
			GUILayout.Box( labelTxt, GUILayout.Width(120) );
								
			GUILayout.EndHorizontal();	
		}
	}
	
	private static int CalculateTextureSizeBytes(Texture tTexture)
	{
		int tWidth=tTexture.width;
		int tHeight=tTexture.height;
		if (tTexture is Texture2D)
		{
			Texture2D tTex2D=tTexture as Texture2D;
		 	int bitsPerPixel=GetBitsPerPixel(tTex2D.format);
			int mipMapCount=tTex2D.mipmapCount;
			int mipLevel=1;
			int tSize=0;
			while (mipLevel<=mipMapCount)
			{
				tSize+=tWidth*tHeight*bitsPerPixel/8;
				tWidth=tWidth/2;
				tHeight=tHeight/2;
				mipLevel++;
			}
			return tSize;
		}
		
		if (tTexture is Cubemap)
		{
			Cubemap tCubemap=tTexture as Cubemap;
		 	int bitsPerPixel=GetBitsPerPixel(tCubemap.format);
			return tWidth*tHeight*6*bitsPerPixel/8;
		}
		return 0;
	}
	private static int GetBitsPerPixel(TextureFormat format)
	{
		switch (format)
		{
			case TextureFormat.Alpha8: //	 Alpha-only texture format.
				return 8;
			case TextureFormat.ARGB4444: //	 A 16 bits/pixel texture format. Texture stores color with an alpha channel.
				return 16;
			case TextureFormat.RGB24:	// A color texture format.
				return 24;
			case TextureFormat.RGBA32:	//Color with an alpha channel texture format.
				return 32;
			case TextureFormat.ARGB32:	//Color with an alpha channel texture format.
				return 32;
			case TextureFormat.RGB565:	//	 A 16 bit color texture format.
				return 16;
			case TextureFormat.DXT1:	// Compressed color texture format.
				return 4;
			case TextureFormat.DXT5:	// Compressed color with alpha channel texture format.
				return 8;
			/*
			case TextureFormat.WiiI4:	// Wii texture format.
			case TextureFormat.WiiI8:	// Wii texture format. Intensity 8 bit.
			case TextureFormat.WiiIA4:	// Wii texture format. Intensity + Alpha 8 bit (4 + 4).
			case TextureFormat.WiiIA8:	// Wii texture format. Intensity + Alpha 16 bit (8 + 8).
			case TextureFormat.WiiRGB565:	// Wii texture format. RGB 16 bit (565).
			case TextureFormat.WiiRGB5A3:	// Wii texture format. RGBA 16 bit (4443).
			case TextureFormat.WiiRGBA8:	// Wii texture format. RGBA 32 bit (8888).
			case TextureFormat.WiiCMPR:	//	 Compressed Wii texture format. 4 bits/texel, ~RGB8A1 (Outline alpha is not currently supported).
				return 0;  //Not supported yet
			*/
			case TextureFormat.PVRTC_RGB2://	 PowerVR (iOS) 2 bits/pixel compressed color texture format.
				return 2;
			case TextureFormat.PVRTC_RGBA2://	 PowerVR (iOS) 2 bits/pixel compressed with alpha channel texture format
				return 2;
			case TextureFormat.PVRTC_RGB4://	 PowerVR (iOS) 4 bits/pixel compressed color texture format.
				return 4;
			case TextureFormat.PVRTC_RGBA4://	 PowerVR (iOS) 4 bits/pixel compressed with alpha channel texture format
				return 4;
			case TextureFormat.ETC_RGB4://	 ETC (GLES2.0) 4 bits/pixel compressed RGB texture format.
				return 4;
			case TextureFormat.ATC_RGB4://	 ATC (ATITC) 4 bits/pixel compressed RGB texture format.
				return 4;
			case TextureFormat.ATC_RGBA8://	 ATC (ATITC) 8 bits/pixel compressed RGB texture format.
				return 8;
			case TextureFormat.BGRA32://	 Format returned by iPhone camera
				return 32;
			case TextureFormat.ATF_RGB_DXT1://	 Flash-specific RGB DXT1 compressed color texture format.
			case TextureFormat.ATF_RGBA_JPG://	 Flash-specific RGBA JPG-compressed color texture format.
			case TextureFormat.ATF_RGB_JPG://	 Flash-specific RGB JPG-compressed color texture format.
				return 0; //Not supported yet
		}
		return 0;
	}
};

public class MaterialDetails
{
	public Material material;
	
	public List<GameObject> FoundInGameObjects = new List<GameObject>();
	
	public MaterialDetails( Material mat )
	{		
		material = mat;
	}
	
	public void OnGui()
	{
		if ( material != null )
		{
			GUILayout.BeginHorizontal();
			
			Texture thumb = material.mainTexture;
			if ( thumb == null )
				thumb = AssetPreview.GetMiniTypeThumbnail( typeof( Material ) );
			
			GUILayout.Box( thumb, GUILayout.Width( Util.ThumbnailWidth ), GUILayout.Height( Util.ThumbnailHeight ) );
			
			if ( GUILayout.Button( new GUIContent( material.name, material.name ), GUILayout.Width(150), GUILayout.Height(50) ) )
				Util.SelectObject( material );
			
			Texture2D iconGameObj = AssetPreview.GetMiniTypeThumbnail( typeof( GameObject ) );
			if ( GUILayout.Button( new GUIContent( FoundInGameObjects.Count.ToString(), iconGameObj, "Game Objects" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInGameObjects );
							
			GUILayout.EndHorizontal();	
		}
	}
};

public class MeshDetails
{	
	public Mesh mesh;

	public List<GameObject> FoundInGameObjects = new List<GameObject>();

	public MeshDetails( Mesh m )
	{		
		mesh = m;
	}
	
	public void OnGui()
	{
		if ( mesh != null )
		{
			GUILayout.BeginHorizontal ();
			
			Texture2D thumb = AssetPreview.GetAssetPreview( mesh );
			if ( thumb == null )
				thumb = AssetPreview.GetMiniTypeThumbnail( typeof( Mesh ) );
			
			GUILayout.Box(thumb, GUILayout.Width( Util.ThumbnailWidth ), GUILayout.Height( Util.ThumbnailHeight ));
			
			if ( GUILayout.Button( new GUIContent( mesh.name, mesh.name ), GUILayout.Width(150), GUILayout.Height(50) ) )
				Util.SelectObject( mesh );
										
			Texture2D iconGameObj = AssetPreview.GetMiniTypeThumbnail( typeof( GameObject ) );
			if ( GUILayout.Button( new GUIContent( FoundInGameObjects.Count.ToString(), iconGameObj, "Game Objects" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInGameObjects );
			
			GUILayout.Box( mesh.vertexCount.ToString() + " vertices\n" + mesh.triangles.Length + " triangles\n", GUILayout.Width(100), GUILayout.Height(50) );
			
			GUILayout.EndHorizontal();	
		}
	}
};

public class ShaderDetails
{
	public Shader shader;
	
	public List<GameObject> FoundInGameObjects = new List<GameObject>();
	public List<Object> FoundInMaterials = new List<Object>();
	
	public ShaderDetails( Shader s )
	{		
		shader = s;
	}
	
	public void OnGui()
	{
		if ( shader != null )
		{
			GUILayout.BeginHorizontal ();
			
			Texture2D thumb = AssetPreview.GetMiniThumbnail( shader );
			if ( thumb == null )
				thumb = AssetPreview.GetMiniTypeThumbnail( typeof( Shader ) );
			
			GUILayout.Box(thumb, GUILayout.Width( Util.ThumbnailWidth ),GUILayout.Height( Util.ThumbnailHeight ));
			
			if ( GUILayout.Button( new GUIContent( shader.name, shader.name ), GUILayout.Width(150), GUILayout.Height(50) ) )
				Util.SelectObject( shader );
							
			Texture2D iconMaterials = AssetPreview.GetMiniTypeThumbnail( typeof( Material ) );
			if ( GUILayout.Button( new GUIContent( FoundInMaterials.Count.ToString(), iconMaterials, "Materials" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInMaterials );
			
			Texture2D iconGameObj = AssetPreview.GetMiniTypeThumbnail( typeof( GameObject ) );
			if ( GUILayout.Button( new GUIContent( FoundInGameObjects.Count.ToString(), iconGameObj, "Game Objects" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInGameObjects );
			
			GUILayout.EndHorizontal();	
		}
	}
};

public class SoundDetails
{
	public AudioClip clip;
	
	public List<GameObject> FoundInGameObjects = new List<GameObject>();
	
	public SoundDetails( AudioClip c )
	{		
		clip = c;
	}
	
	public void OnGui()
	{
		if ( clip != null )
		{		
			GUILayout.BeginHorizontal ();
			
			Texture2D thumb = AssetPreview.GetAssetPreview( clip );
			GUILayout.Box(thumb, GUILayout.Width( Util.ThumbnailWidth ),GUILayout.Height( Util.ThumbnailHeight ));
			
			if ( GUILayout.Button( new GUIContent( clip.name, clip.name ), GUILayout.Width(150), GUILayout.Height(50) ) )
				Util.SelectObject( clip );
			
			Texture2D iconGameObj = AssetPreview.GetMiniTypeThumbnail( typeof( GameObject ) );
			if ( GUILayout.Button( new GUIContent( FoundInGameObjects.Count.ToString(), iconGameObj, "Game Objects" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInGameObjects );
			
			GUILayout.Box( clip.length + " length\n" + clip.channels + " channels\n" + "frequency " + clip.frequency, GUILayout.Width(150), GUILayout.Height(50) );
						
			GUILayout.EndHorizontal();	
		}
	}
};

public class ScriptDetails
{
	public MonoScript script;
	
	public List<GameObject> FoundInGameObjects = new List<GameObject>();
	
	public ScriptDetails( MonoScript s )
	{		
		script = s;
	}
	
	public void OnGui()
	{
		if ( script != null )
		{
			GUILayout.BeginHorizontal ();
			
			Texture2D thumb = AssetPreview.GetAssetPreview( script );
			if ( thumb == null )
				thumb = AssetPreview.GetMiniTypeThumbnail( typeof( MonoScript ) );
			
			GUILayout.Box(thumb, GUILayout.Width( Util.ThumbnailWidth ),GUILayout.Height( Util.ThumbnailHeight ));
			
			if ( GUILayout.Button( new GUIContent( script.name, script.name ), GUILayout.Width(150), GUILayout.Height(50) ) )
				Util.SelectObject( script );

			Texture2D iconGameObj = AssetPreview.GetMiniTypeThumbnail( typeof( GameObject ) );
			if ( GUILayout.Button( new GUIContent( FoundInGameObjects.Count.ToString(), iconGameObj, "Game Objects" ), GUILayout.Width(60), GUILayout.Height(50) ) )
				Util.SelectObjects( FoundInGameObjects );
			
			GUILayout.Box( script.bytes.Length + " bytes\n", GUILayout.Width(150), GUILayout.Height(50) );
				
			GUILayout.EndHorizontal();	
		}
	}
};

public class DependencyChecker : EditorWindow 
{	
	enum InspectType 
	{
		Textures, Materials, Meshes, Shaders, Sounds, Scripts
	};
	
	InspectType ActiveInspectType = InspectType.Textures;
		
	List<TextureDetails> ActiveTextures = new List<TextureDetails>();
	List<MaterialDetails> ActiveMaterials = new List<MaterialDetails>();
	List<MeshDetails> ActiveMeshDetails = new List<MeshDetails>();
	List<ShaderDetails> ActiveShaderDetails = new List<ShaderDetails>();	
	List<SoundDetails> ActiveSoundDetails = new List<SoundDetails>();
	List<ScriptDetails> ActiveScriptDetails = new List<ScriptDetails>();
	
	Vector2 textureListScrollPos=new Vector2(0,0);
	Vector2 materialListScrollPos=new Vector2(0,0);
	Vector2 meshListScrollPos=new Vector2(0,0);
	Vector2 shaderListScrollPos=new Vector2(0,0);
	Vector2 soundListScrollPos=new Vector2(0,0);
	Vector2 scriptListScrollPos=new Vector2(0,0);
	
	int TotalTextureMemory = 0;
	int TotalMeshVertices = 0;
		
	static int MinWidth = 300;
    
    [MenuItem ("Window/Dependency Checker")]
    static void Init ()
	{  
        DependencyChecker window = (DependencyChecker)EditorWindow.GetWindow( typeof( DependencyChecker ) );
		window.CheckResources();
		window.minSize = new Vector2( MinWidth, 300 );
    }
    
    void OnGUI ()
	{		
		if ( GUILayout.Button( "Refresh Dependencies" ) ) 
			CheckResources();
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		GUILayout.Box( 
			"Summary\n" +
			"Materials " + ActiveMaterials.Count + "\n" +
			"Textures " + ActiveTextures.Count + " - " + EditorUtility.FormatBytes(TotalTextureMemory) + "\n" +
			"Meshes " + ActiveMeshDetails.Count + "\n" +
			"Shaders " + ActiveShaderDetails.Count + "\n" +
			"Sounds " + ActiveSoundDetails.Count + "\n" +
			"Scripts " + ActiveScriptDetails.Count );
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
				
		Texture2D iconTexture = AssetPreview.GetMiniTypeThumbnail( typeof( Texture2D ) );
		Texture2D iconMaterial = AssetPreview.GetMiniTypeThumbnail( typeof( Material ) );
		Texture2D iconMesh = AssetPreview.GetMiniTypeThumbnail( typeof( Mesh ) );
		Texture2D iconShader = AssetPreview.GetMiniTypeThumbnail( typeof( Shader ) );
		Texture2D iconSound = AssetPreview.GetMiniTypeThumbnail( typeof( AudioClip ) );
		Texture2D iconScript = AssetPreview.GetMiniTypeThumbnail( typeof( MonoScript ) );
		
		GUIContent [] guiObjs = 
		{
			new GUIContent( iconTexture, "Active Textures" ), 
			new GUIContent( iconMaterial, "Active Materials" ), 
			new GUIContent( iconMesh, "Active Meshes" ), 
			new GUIContent( iconShader, "Active Shaders" ), 
			new GUIContent( iconSound, "Active Sounds" ),
			new GUIContent( iconScript, "Active Scripts" ),
		};
		
		GUILayoutOption [] options = 
		{
			GUILayout.Width( 300 ),
			GUILayout.Height( 50 ),
		};
		
		GUILayout.BeginHorizontal();
		GUILayout.FlexibleSpace();
		ActiveInspectType=(InspectType)GUILayout.Toolbar((int)ActiveInspectType,guiObjs,options);
		GUILayout.FlexibleSpace();
		GUILayout.EndHorizontal();
				
		Util.ctrlPressed = Event.current.control || Event.current.command;
		
		switch (ActiveInspectType)
		{
		case InspectType.Textures:
			ListTextures();
			break;
		case InspectType.Materials:
			ListMaterials();
			break;
		case InspectType.Meshes:
			ListMeshes();
			break;
		case InspectType.Shaders:
			ListShaders();
			break;
		case InspectType.Sounds:
			ListSounds();
			break;
		case InspectType.Scripts:
			ListScripts();
			break;
		}
	}
		
	void ListTextures()
	{
		textureListScrollPos = EditorGUILayout.BeginScrollView(textureListScrollPos);
		
		if ( ActiveTextures.Count > 0 )
		{
			GUILayout.BeginHorizontal();
			if ( GUILayout.Button( "Select All GameObjects" ) )
			{
				List<Object> AllTextures = new List<Object>();
				foreach (TextureDetails tDetails in ActiveTextures) 
					AllTextures.Add(tDetails.texture);
				
				Util.SelectObjects( AllTextures );
			}
			GUILayout.EndHorizontal();
		}
		
		foreach (TextureDetails details in ActiveTextures)
		{
			details.OnGui();
		}
		EditorGUILayout.EndScrollView();
    }
	
	void ListMaterials()
	{
		materialListScrollPos = EditorGUILayout.BeginScrollView(materialListScrollPos);		
		foreach ( MaterialDetails details in ActiveMaterials )
		{			
			details.OnGui();
		}
		EditorGUILayout.EndScrollView();		
    }
	
	void ListMeshes()
	{
		meshListScrollPos = EditorGUILayout.BeginScrollView(meshListScrollPos);
		
		foreach ( MeshDetails details in ActiveMeshDetails )
		{			
			details.OnGui();
		}
		EditorGUILayout.EndScrollView();		
    }
		
	void ListShaders()
	{
		shaderListScrollPos = EditorGUILayout.BeginScrollView(shaderListScrollPos);
		
		foreach ( ShaderDetails details in ActiveShaderDetails )
		{
			details.OnGui();
		}
		EditorGUILayout.EndScrollView();		
    }
			
	void ListSounds()
	{		
		soundListScrollPos = EditorGUILayout.BeginScrollView(soundListScrollPos);		
		foreach ( SoundDetails details in ActiveSoundDetails )
		{
			details.OnGui();
		}
		EditorGUILayout.EndScrollView();		
    }
	
	void ListScripts()
	{
		scriptListScrollPos = EditorGUILayout.BeginScrollView(scriptListScrollPos);		
		foreach ( ScriptDetails details in ActiveScriptDetails )
		{
			details.OnGui();
		}
		EditorGUILayout.EndScrollView();		
    }

	TextureDetails FindTextureDetails(Texture tTexture)
	{
		foreach (TextureDetails details in ActiveTextures)
		{
			if (details.texture==tTexture) 
				return details;
		}
		return null;
		
	}
	
	MaterialDetails FindMaterialDetails(Material tMaterial)
	{
		foreach (MaterialDetails details in ActiveMaterials)
		{
			if (details.material==tMaterial) 
				return details;
		}
		return null;
		
	}
	
	MeshDetails FindMeshDetails(Mesh tMesh)
	{
		foreach (MeshDetails details in ActiveMeshDetails)
		{
			if (details.mesh==tMesh) 
				return details;
		}
		return null;
		
	}
		
	ShaderDetails FindShaderDetails(Shader shader )
	{
		foreach (ShaderDetails details in ActiveShaderDetails)
		{
			if (details.shader == shader) 
				return details;
		}
		return null;		
	}
			
	SoundDetails FindSoundDetails( AudioClip clip )
	{
		foreach (SoundDetails details in ActiveSoundDetails)
		{
			if (details.clip == clip) 
				return details;
		}
		return null;		
	}
				
	ScriptDetails FindScriptDetails( MonoScript script )
	{
		foreach (ScriptDetails details in ActiveScriptDetails)
		{
			if (details.script == script) 
				return details;
		}
		return null;		
	}

	TextureDetails TryAddActiveTextures( Texture tex )
	{
		if ( tex != null )
		{
			TextureDetails details = FindTextureDetails( tex );
			if (details==null)
			{
				details = new TextureDetails( tex );
				ActiveTextures.Add( details );
			}
			return details;
		}
		return null;
	}
	
	MaterialDetails TryAddActiveMaterial( Material mat )
	{
		if ( mat != null )
		{
			MaterialDetails details = FindMaterialDetails( mat );
			if ( details == null )
			{
				details = new MaterialDetails( mat );
				ActiveMaterials.Add( details );
			}
			return details;
		}
		return null;
	}
	
	MeshDetails TryAddActiveMesh( Mesh m )
	{
		if ( m != null )
		{
			MeshDetails details = FindMeshDetails( m );
			if ( details == null )
			{
				details = new MeshDetails( m );
				ActiveMeshDetails.Add( details );
			}
			return details;
		}
		return null;
	}
	
	ShaderDetails TryAddActiveShader( Shader s )
	{
		if ( s != null )
		{
			ShaderDetails details = FindShaderDetails( s );
			if ( details == null )
			{
				details = new ShaderDetails( s );
				ActiveShaderDetails.Add( details );
			}
			return details;
		}
		return null;
	}
		
	SoundDetails TryAddAudioClip( AudioClip s )
	{
		if ( s != null )
		{
			SoundDetails details = FindSoundDetails( s );
			if ( details == null )
			{
				details = new SoundDetails( s );
				ActiveSoundDetails.Add( details );
			}
			return details;
		}
		return null;
	}
			
	ScriptDetails TryAddScript( MonoScript s )
	{
		if ( s != null )
		{
			ScriptDetails details = FindScriptDetails( s );
			if ( details == null )
			{
				details = new ScriptDetails( s );
				ActiveScriptDetails.Add( details );
			}
			return details;
		}
		return null;
	}
	
	void CheckResources()
	{
		//Debug.Log("CheckResources");
		
		ActiveTextures.Clear();
		ActiveMaterials.Clear();
		ActiveMeshDetails.Clear();
		ActiveShaderDetails.Clear();
		ActiveSoundDetails.Clear();
		
		foreach ( LightmapData lightmap in LightmapSettings.lightmaps )
		{
			TryAddActiveTextures( lightmap.lightmapNear );
			TryAddActiveTextures( lightmap.lightmapFar );
		}
		
		Renderer[] renderers = (Renderer[]) FindObjectsOfType(typeof(Renderer));
		foreach (Renderer renderer in renderers)
		{
			//Debug.Log("Renderer is "+renderer.name);
			foreach (Material material in renderer.sharedMaterials)
			{
				MaterialDetails tMaterialDetails = TryAddActiveMaterial( material );
				if ( tMaterialDetails != null )
					tMaterialDetails.FoundInGameObjects.Add( renderer.gameObject );
				
				ShaderDetails tShaderDetails = TryAddActiveShader( material.shader );
				if ( tShaderDetails != null )
				{
					if ( !tShaderDetails.FoundInGameObjects.Contains( renderer.gameObject ) )
						tShaderDetails.FoundInGameObjects.Add( renderer.gameObject );
				}
			}
			
			// add the lightmap reference to the renderer
			if ( renderer.lightmapIndex >= 0 && renderer.lightmapIndex < LightmapSettings.lightmaps.Length )
			{
				LightmapData lightmap = LightmapSettings.lightmaps[ renderer.lightmapIndex ];
				TextureDetails lmNear = FindTextureDetails( lightmap.lightmapNear );
				if ( lmNear != null && !lmNear.FoundInRenderers.Contains( renderer ) )
					lmNear.FoundInRenderers.Add( renderer );
				
				TextureDetails lmFar = FindTextureDetails( lightmap.lightmapFar );
				if ( lmFar != null && !lmFar.FoundInRenderers.Contains( renderer ) )
					lmFar.FoundInRenderers.Add( renderer );
			}
		}
		
		foreach (MaterialDetails tMaterialDetails in ActiveMaterials)
		{
			Material tMaterial = tMaterialDetails.material;
			foreach (Object obj in EditorUtility.CollectDependencies(new UnityEngine.Object[] {tMaterial}))
		    {
				if (obj is Texture)
				{
					Texture tTexture = obj as Texture;
					TextureDetails tTextureDetails = TryAddActiveTextures( tTexture );
					tTextureDetails.FoundInMaterials.Add(tMaterial);
				}
				if ( obj is Shader )
				{
					Shader shader = obj as Shader;
					ShaderDetails shaderDetails = TryAddActiveShader( shader );
					if ( !shaderDetails.FoundInMaterials.Contains( tMaterial ) )
						shaderDetails.FoundInMaterials.Add( tMaterial );
				}
			}
		}
				
		MeshFilter[] meshFilters = (MeshFilter[]) FindObjectsOfType(typeof(MeshFilter));		
		foreach (MeshFilter tMeshFilter in meshFilters)
		{
			Mesh tMesh = tMeshFilter.sharedMesh;
			if ( tMesh != null )
			{
				MeshDetails details = TryAddActiveMesh( tMesh );
				if ( !details.FoundInGameObjects.Contains( tMeshFilter.gameObject ) )
					details.FoundInGameObjects.Add( tMeshFilter.gameObject );
			}
		}
	
		Light[] lights = (Light[])FindObjectsOfType(typeof(Light));
		foreach (Light light in lights)
		{
			if ( light.cookie )
			{
				TextureDetails details = TryAddActiveTextures( light.cookie );
				if ( !details.FoundInLights.Contains( light ) )
					details.FoundInLights.Add( light );
			}
		}
		
		GameObject[] gameObjs = (GameObject[]) FindObjectsOfType(typeof(GameObject));
		foreach( GameObject obj in gameObjs )
		{
			foreach (Object o in EditorUtility.CollectDependencies(new UnityEngine.Object[] {obj}))
		    {
				if (o is AudioClip)
				{
					AudioClip clip = o as AudioClip;
					SoundDetails details = TryAddAudioClip( clip );
					if ( !details.FoundInGameObjects.Contains( obj ) )
						details.FoundInGameObjects.Add( obj );
				}
				if ( o is MonoScript )
				{
					MonoScript script = o as MonoScript;
					ScriptDetails details = TryAddScript( script );
					if ( !details.FoundInGameObjects.Contains( obj ) )
						details.FoundInGameObjects.Add( obj );
				}
			}
		}

		TotalTextureMemory=0;
		foreach (TextureDetails tTextureDetails in ActiveTextures) TotalTextureMemory+=tTextureDetails.memSizeBytes;
		
		TotalMeshVertices=0;
		foreach (MeshDetails tMeshDetails in ActiveMeshDetails) TotalMeshVertices+=tMeshDetails.mesh.vertexCount;
		
		// Sort by size, descending
		ActiveTextures.Sort(delegate(TextureDetails details1, TextureDetails details2) {return details2.memSizeBytes-details1.memSizeBytes;});
		ActiveMeshDetails.Sort(delegate(MeshDetails details1, MeshDetails details2) {return details2.mesh.vertexCount-details1.mesh.vertexCount;});		
	}	
}