using UnityEngine;
using UnityEditor;
using System.Collections;
#pragma warning disable 0219

public class NodeEditor : EditorWindow
{
		[MenuItem("Window/Node Editor")]
		static void Init ()
		{
				//RoadEditor window = EditorWindow.GetWindow<RoadEditor>();
		}

		private void OnGUI ()
		{
				GUILayout.Label ("Welcome to the road editor");
		}

		private void OnDrawGizmos ()
		{
		}
}