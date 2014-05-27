		/*
		//renaming file
		if (!importer.assetPath.Contains("~~TempPostrpocessoFile"))
		{
			var assetFile : FileInfo = FileInfo( LocalToAbsolute(importer.assetPath) );
			var newFilePath : String = 
				assetFile.Directory + 
				"\\" + 
				Path.GetFileNameWithoutExtension(importer.assetPath) +
				"~~TempPostrpocessoFile" +
				Path.GetExtension(importer.assetPath);
			assetFile.MoveTo(newFilePath);
			//AssetDatabase.Refresh();
		}
		//restoring renamed files
		else
		{
			assetFile = FileInfo( LocalToAbsolute(importer.assetPath) );
			newFilePath = assetFile.FullName.Replace("~~TempPostrpocessoFile","");
			assetFile.MoveTo(newFilePath);
			//AssetDatabase.Refresh();
		}
		*/
		
		//var assetFile : System.IO.FileInfo = System.IO.FileInfo(LocalToAbsolute(importer.assetPath));
		
		//assetFile.Attributes = System.IO.FileAttributes.Hidden;
		
		//AssetDatabase.Refresh();
		/*
		//looking for a temporary directory to hide file
		var tempdir : System.IO.DirectoryInfo;
		var tempdirs : System.IO.DirectoryInfo[] = assetFile.Directory.GetDirectories("~");
		if (tempdirs.length > 0) tempdir = tempdirs[0];
		
		//hiding file
		var newFilePath : String = assetFile.FullName + ".temp";
		//assetFile.MoveTo(newFilePath);
		
		previousFile = newFilePath;
		
		
		
		var importerType : System.Type = assetImporter.GetType();
		var pathField : System.Reflection.FieldInfo[] = importerType.GetFields();
		var assetPathProperty : System.Reflection.PropertyInfo = importerType.GetProperty("assetPath", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
		
		Debug.Log(assetPathProperty);
		
		var valueObj : System.Object = "test";
		var importerObj : System.Object = assetImporter;
		var tempObjs : Object[] = new Object[0];
		
		assetPathProperty.SetValue(importerObj, valueObj, null); 
		
		//importerType.GetField("assetPath", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
    	
    	//typeof(ModelImporter).GetProperty("assetPath").SetValue(importerObj,valueObj, null);
    	
   // 	assetImporter.GetType().InvokeMember(
   // 		"assetPath", 
    //		System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.SetProperty,
   // 		System.Type.DefaultBinder, 
    //		assetImporter, 
   // 		"MyName");
   
   		//var fi = assetPathProperty.GetBackingField ();
   		//Debug.Log(fi);
   		//fi.SetValue(assetImporter,"test");
    	
    	Debug.Log(assetPathProperty.GetValue(importerObj, null));//importer.assetPath);
*/