using UnityEngine;
//using UnityEditor;
using System.Collections;
using System.Collections.Generic;

[AddComponentMenu("AI/Traffic System/AI Lane")]
public class AILane : MonoBehaviour
{
	public AIRoad road;
	public List<AINode> nodes;
	public AINode startNode;
	public AINode endNode;

	public void Awake()
	{
	}
	public void Update()
	{
		//startNode.transform.localPosition = new Vector3(0, 0, -road.length);
		//endNode.transform.localPosition = new Vector3(0, 0, road.length);
	}
	private void OnDrawGizmos()
	{
		if(startNode.isStartNode != true)
			startNode.isStartNode = true;

		if(startNode == null || endNode == null)
		{
			nodes = new List<AINode>(transform.childCount);

			for(int i = 0; i < nodes.Count; i++)
			{
				nodes[i] = transform.GetChild(i).GetComponent<AINode>();
			}

			startNode = nodes[0];
			endNode = nodes[nodes.Count];
		}

        if (!(road = transform.parent.GetComponent<AIRoad>()))
            Debug.LogError("AILane: " + transform.parent + " / " + gameObject.name + " Cant find an AIRoad component attached to the parent");

		Gizmos.color = Color.green;
		for(int i = 0; i < nodes.Count -1; i++)
		{
			Gizmos.DrawLine(nodes[i].transform.position, nodes[i + 1].transform.position);
		}
	}
}