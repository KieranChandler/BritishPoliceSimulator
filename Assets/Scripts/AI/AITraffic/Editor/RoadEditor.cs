using UnityEngine;
using UnityEditor;
using System.Collections;
using System.Collections.Generic;

//[CustomEditor(typeof(AIRoad))]
class RoadEditor : Editor
{
	bool lanesFoldout = true;
	bool[] laneFoldouts;
	bool[] laneNodeFoldouts;

	public override void OnInspectorGUI()
	{
		AIRoad thisRoad = (AIRoad)target;

		if(GUILayout.Button("Update Lane Foldouts"))
		{
			laneFoldouts = new bool[thisRoad.lanes.Length];
			laneNodeFoldouts = new bool[thisRoad.lanes.Length];
		}

		lanesFoldout = EditorGUILayout.Foldout(lanesFoldout, "Lanes");
		if(lanesFoldout)
		{
			EditorGUI.indentLevel++;
			for(int lane = 0; lane < thisRoad.lanes.Length; lane++)
			{
				laneFoldouts[lane] = EditorGUILayout.Foldout(laneFoldouts[lane], "Lane " + lane.ToString());
				if(laneFoldouts[lane])
				{
					EditorGUI.indentLevel++;

					thisRoad.lanes[lane] = (AILane)EditorGUILayout.ObjectField("Lane Object", thisRoad.lanes[lane], typeof(AILane), true);
					laneNodeFoldouts[lane] = EditorGUILayout.Foldout(laneNodeFoldouts[lane], "Lane " + lane.ToString());
					if(laneNodeFoldouts[lane])
					{
						EditorGUI.indentLevel++;
						for(int node = 0; node < thisRoad.lanes[lane].nodes.Count; node++)
						{
							thisRoad.lanes[lane].nodes[node] = (AINode)EditorGUILayout.ObjectField("Node Object", thisRoad.lanes[lane].nodes[node], typeof(AINode), true);
						}
						EditorGUI.indentLevel--;
					}

					EditorGUI.indentLevel--;
				}
			}
			EditorGUI.indentLevel--;
		}
	}
}


























//using UnityEngine;
//using UnityEditor;
//using System.Collections;
//#pragma warning disable 0219
//public class RoadEditor : EditorWindow
//{
//    public GameObject rootObject;
//    public AIRoad[] roads;
//    public AILane[] lanes;
//    public AINode[] nodes;
//
//    [MenuItem("Window/Road Editor")]
//    static void Init()
//    {
//        RoadEditor window = EditorWindow.GetWindow<RoadEditor>();
//    }
//
//    private void Start()
//    {
//        rootObject = GameObject.FindWithTag("AITrafficRoot");
//    }
//    private void OnGUI()
//    {
//        GUILayout.Label("Welcome to the road editor");
//
//        GUILayout.Space(5);
//
//        if (GUILayout.Button("Reload Roads"))
//        {
//            rootObject = GameObject.FindWithTag("AITrafficRoot");
//            roads = new AIRoad[rootObject.transform.childCount];
//            for (int i = 0; i < rootObject.transform.childCount; i++)
//            {
//                roads[i] = rootObject.transform.GetChild(i).GetComponent<AIRoad>();
//                roads[i].Awake();
//            }
//        }
//
//        if (GUILayout.Button("Update Roads"))
//        {
//            for (int i = 0; i < roads.Length; i++)
//            {
//                roads[i].Update();
//                for (int j = 0; j < roads[i].lanes.Length; j++)
//                {
//                    roads[i].lanes[j].Update();
//                }
//            }
//        }
//    }
//    private void OnDrawGizmos()
//    {
//
//    }
//}
