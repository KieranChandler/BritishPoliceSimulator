#pragma strict

enum ImportManagerCreateMaterialFolder {doNotCreate, modelFolder, modelMaterialSubFolder, modelUpperMaterialFolder, textureFolder, textureMaterialSubFolder, textureUpperMaterialFolder};
enum ImportManagerGenerateColliders {noCollider, useObjectMesh};
enum ImportManagerCreatePrefab {doNotCreate, inSameFolder, inPrefabsSubfolder, inUpperFolder, inUpperPrefabsFolder};

class ImportManagerSettingsContainer extends ScriptableObject
{
	var file : String;
	var test : String;

//Foldouts
	var fileAndDirectoryFoldout : boolean = false;
	var modelImportPatternFoldout : boolean = true;
	var createPrefabFoldout : boolean = true;
	var materialSearchPatternFoldout : boolean = true;
	var defaultImportSettingsFoldout : boolean = false;
	var defaultModelsFoldout : boolean = false;
	var defaultTexturesFoldout : boolean = false;
	var defaultAudioFoldout : boolean = false;
	var rawValuesFoldout : boolean = false;

//Enables 
	var fileAndDirectoryEnable : boolean = false;
	var modelImportPatternEnable : boolean = false;
	var createPrefabEnable : boolean = false;
	var materialSearchPatternEnable : boolean = false;
	var defaultImportSettingsEnable : boolean = false;
	var defaultModelsEnable : boolean = false;
	var defaultTexturesEnable : boolean = false;
	var defaultAudioEnable : boolean = false;

//File and directory processing
	var ignoreFolders : String[];
	var ignoreFiles : String[];
	var normalMaps : String[];
	var guiTextures : String[];
	
//Models processing
	var lodShadows : boolean = false;
	var lodShadowLevel : int = 2;
	var generateColliders : ImportManagerGenerateColliders;
	var colliderNames : String[] = ["*_Collider*", "*_Collision*"];
	var ignoreNames : String[] = ["*_Ignore*"];
	var scriptNames : String[] = new String[0];
	var scriptComponents : String[] = new String[0];
	var parentScriptComponents : String[] = new String[0];
	
	var refreshPrefab : boolean;
	var searchPrefabUp : boolean = true;
	var searchIncludePrefabFolder : boolean = true;
	var searchPrefabProjectwide : boolean = false;
	var prefabFolderName : String = "Prefabs";
	var createPrefab : ImportManagerCreatePrefab = ImportManagerCreatePrefab.inUpperFolder;
	var replacePrefabOptions : ReplacePrefabOptions;
	
//Materials Assigment Pattern
	var searchMaterialModel : boolean = true;
	var searchMaterialTexture : boolean = false;
	var searchMaterialMatfolders : boolean = true;
	var searchMaterialProjectwide : boolean = false;
	var createMaterial : ImportManagerCreateMaterialFolder = ImportManagerCreateMaterialFolder.modelUpperMaterialFolder;
	var overwriteMaterial : boolean;
	var matfoldersName : String = "Materials";

//Default import settings
	var importMaterials : boolean = true;
	var materialName : ModelImporterMaterialName = ModelImporterMaterialName.BasedOnTextureName; 
	var materialSearch : ModelImporterMaterialSearch; 
	var globalScale : float = 0.01; 
	var isUseFileUnitsSupported : boolean;
	var useFileUnits : boolean; 
	var addCollider : boolean = true;
	var normalSmoothingAngle : float = 60f;
	var splitTangentsAcrossSeams : boolean;
	var swapUVChannels : boolean;
	var generateSecondaryUV : boolean;
	var secondaryUVAngleDistortion : float;
	var secondaryUVAreaDistortion : float;
	var secondaryUVHardAngle : float;
	var secondaryUVPackMargin : float;
	var generateAnimations : UnityEditor.ModelImporterGenerateAnimations;
	//var transformPaths	 Generates the list of all imported Transforms. 
	//var referencedClips	 Generates the list of all imported Animations. 
	var isReadable : boolean = true;
	var optimizeMesh : boolean = true;
	var normalImportMode	: ModelImporterTangentSpaceMode = ModelImporterTangentSpaceMode.Import; 
	var tangentImportMode : ModelImporterTangentSpaceMode = ModelImporterTangentSpaceMode.Calculate;
	var bakeIK : boolean;
	var isBakeIKSupported : boolean;
	var isTangentImportSupported : boolean;
	var meshCompression : ModelImporterMeshCompression = ModelImporterMeshCompression.Off;
	var animationCompression : ModelImporterAnimationCompression;
	var animationRotationError : float; 
	var animationPositionError : float;
	var animationScaleError : float;
	var animationWrapMode : WrapMode;
	var animationType : ModelImporterAnimationType;
	
	var textureFormat : TextureImporterFormat; 
	var maxTextureSize : int = 4096; 
	var compressionQuality : TextureCompressionQuality;
	var grayscaleToAlpha : boolean = false;
	var generateCubemap : TextureImporterGenerateCubemap;
	var npotScale : TextureImporterNPOTScale;
	var textureIsReadable : boolean;
	var mipmapEnabled : boolean = true;
	var borderMipmap : boolean;
	var linearTexture : boolean;
	var mipmapFilter : TextureImporterMipFilter;
	var fadeout : boolean;
	var mipmapFadeDistanceStart	: int;
	var mipmapFadeDistanceEnd : int;
	var generateMipsInLinearSpace : boolean;
	var convertToNormalmap : boolean;
	var normalmap : boolean;
	var normalmapFilter : TextureImporterNormalFilter; 
	var heightmapScale : float;
	var lightmap : boolean;
	var anisoLevel : int;
	var filterMode : FilterMode;
	var wrapMode : TextureWrapMode;
	var mipMapBias : float;
	var textureType : TextureImporterType;
	
	var format : AudioImporterFormat;
	var compressionBitrate : int; 
	var threeD : boolean;
	var forceToMono : boolean;
	var hardware : boolean; 
	var loadType : AudioImporterLoadType;
	var loopable : boolean;
}