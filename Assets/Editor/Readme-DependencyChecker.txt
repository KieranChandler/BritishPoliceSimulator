Unity Dependency Checker
Send feature requests and bug reports to jswigart@gmail.com

Dependency checker is based on the Resource Checker script and is heavily modified and extended to support a wider range of resource types and display options. 

It can show you a list of resources such as textures, materials, shaders, meshes, audio clips, and scripts, along with information about those resources, and which game objects reference them, allowing you to better visualize referenced resources that could otherwise be difficult to locate. This information is useful to visualize where the bulk of your asset memory is coming from and what asset dependencies are being reference by the scene, which can be useful for optimizing textures, removing references to unneeded or temporary assets, etc.

Just put the DependencyChecker.cs script into the "Editor" folder within "Assets" in your project, and you should be able to open the window by looking at "Window/Dependency Checker"

You must click the "Refresh Dependencies" button to update the GUI with the current state of resource dependencies. The script does not update it automatically for performance reasons.

There are multiple pages of resource types to inspect, with columns of useful information or functionality

Textures
--------
- Texture preview
- Texture name - click to select asset
- Materials - how many materials reference the texture, click to select material assets
- Game Objects - how many game objects reference this texture, click to select them
- Lights - how many lights reference this texture(such as using it as a cookie), click to select lights
- Info - shows texture resolution, mip levels and texture size

Materials
---------
- Material preview
- Material name, click to select asset
- Game Objects - how many game objects reference this material, click to select them

Meshes
------
- Mesh preview
- Mesh name, click to select asset
- Game Objects - how many game objects reference this mesh, click to select them
- Info - number of vertices and triangles

Shaders
-------
- Shader preview
- Shader name, click to select asset
- Materials - how many materials reference this shader, click to select them
- Game Objects - how many game objects reference this shader, click to select them

AudioClip
---------
- Clip waveform preview
- Clip name, click to select asset
- Game Objects - how many game objects reference this clip, click to select them
- Info - clip length, channels, frequency

Scripts
-------
- Script preview
- Script name, click to select asset
- Game Objects - how many game objects reference this script, click to select them
- Info - number of bytes in script file
