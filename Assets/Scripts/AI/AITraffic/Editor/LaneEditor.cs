using UnityEngine;
using UnityEditor;
using System.Collections;
using System.Collections.Generic;

#pragma warning disable 0219

[CustomEditor(typeof(AILane))]
class LaneEditor : Editor
{
    private bool nodesFoldout;

	public override void OnInspectorGUI()
	{
        // Store the target component
		AILane thisLane = (AILane)target;



        // Parent road property
        thisLane.road = (AIRoad)EditorGUILayout.ObjectField("Parent Road", thisLane.road, typeof(AIRoad), false);


        
        // If "Refind Nodes" button pressed, search for and add nodes to the lane
        if(GUILayout.Button("Refind Nodes"))
        {
            thisLane.nodes.Clear();
            for (int i = thisLane.transform.childCount - 1; i > -1; i--)
            {
                thisLane.nodes.Add(thisLane.transform.GetChild(i).GetComponent<AINode>());
            }

            thisLane.startNode = thisLane.nodes[0];
            thisLane.endNode = thisLane.nodes[thisLane.transform.childCount - 1];
        }

        if (nodesFoldout = EditorGUILayout.Foldout(nodesFoldout, "Nodes"))
        {
            EditorGUI.indentLevel++;

            for (int i = 0; i < thisLane.nodes.Count; i++)
            {
                thisLane.nodes[i] = (AINode)EditorGUILayout.ObjectField("Node " + i.ToString(), thisLane.nodes[i], typeof(AINode), false);
            }

            EditorGUI.indentLevel--;
        }
	}
}