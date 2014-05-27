using UnityEngine;
using System.Collections;

[AddComponentMenu("AI/Traffic System/AI Node")]
public class AINode : MonoBehaviour
{
	public AILane lane;
    public bool isStartNode;
    public bool isEndNode;
	public AIJunction endNodeJunction;

	public Vector3 direction;

	private void OnDrawGizmos()
	{
        if (isStartNode)
            Gizmos.color = Color.red;
        else if (isEndNode)
            Gizmos.color = Color.yellow;
        else
            Gizmos.color = Color.green;

		Gizmos.DrawSphere(transform.position, 1.0f);



        if((lane == null) || (lane.gameObject.name == transform.parent.gameObject.name))
        {
            lane = transform.parent.GetComponent<AILane>();
        }



//		AINode nextNode;
//		for(int i = 0; i < lane.nodes.Count; i++)
//			transform.LookAt(nextNode.transform.position);
	}
}