using UnityEngine;
using System.Collections;
using System.Collections.Generic;
struct JunctionRoad
{
	AINode startNode;
	AINode endNode;
};

[ContextMenu("AI/Traffic System/AI Junction")]
public class AIJunction : MonoBehaviour
{
    public float radius;
	public List<AINode> joiningNodes = new List<AINode>();

	JunctionRoad[] junctionRoads;
    List<AINode> startNodes = new List<AINode>();
    List<AINode> endNodes = new List<AINode>();

	private void Awake()
	{
        for(int i = 0; i < joiningNodes.Count; i++)
        {
            if (joiningNodes[i].isStartNode)
                startNodes.Add(joiningNodes[i]);
            else if (joiningNodes[i].isEndNode)
                endNodes.Add(joiningNodes[i]);
            else
                joiningNodes.RemoveAt(i);
        }
	}

	private void OnDrawGizmos()
	{
		Gizmos.color = Color.blue;
        Gizmos.DrawWireSphere(transform.position, radius);

		PopulateJunctionRoads();

        Gizmos.color = Color.cyan;
        for (int i = 0; i < joiningNodes.Count; i++)
            Gizmos.DrawLine(transform.position, joiningNodes[i].transform.position);
	}

	public void PopulateJunctionRoads()
	{
		for(int i = 0; i < joiningNodes.Count; i++)
		{
            if (joiningNodes[i].isEndNode)
                joiningNodes[i].endNodeJunction = this;
		}
	}
	public AINode MakeIntersection(AINode fromNode)
	{
		AINode toNode = joiningNodes[0];
		AIRoad fromRoad = fromNode.lane.road;



        // Select a random node connected to this junction
        int i = Random.Range(0, startNodes.Count);



        if(startNodes[i].lane.road != fromRoad)
        {
            toNode = startNodes[i];
        } else
        {
            if (i < startNodes.Count - 1)
                toNode = startNodes[i + 1];
            else
                toNode = startNodes[i - 1];
        }

        //if(joiningNodes[i].isStartNode)
        //{
        //    if(joiningNodes[i].lane.road != fromRoad)
        //        toNode = joiningNodes[i];
        //    else
        //    {
        //        if (joiningNodes[i - 1].lane.road != fromRoad)
        //            toNode = joiningNodes[i - 1];
        //        else
        //            toNode = joiningNodes[i + 1];
        //    }
        //}
        //else
        //{
        //    if (joiningNodes[i + 1].isStartNode && joiningNodes[i + 1].lane.road != fromRoad)
        //        toNode = joiningNodes[i + 1];
        //    else if(joiningNodes[i - 1].isStartNode && joiningNodes[i - 1].lane.road != fromRoad)
        //        toNode = joiningNodes[i - 1];
        //}

		return toNode;
	}
}