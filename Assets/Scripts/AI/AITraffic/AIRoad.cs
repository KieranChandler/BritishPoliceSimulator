using UnityEngine;
//using UnityEditor;
using System.Collections;

[AddComponentMenu("AI/Traffic System/AI Road")]
public class AIRoad : MonoBehaviour
{
	public float length;
	public float laneDistance;
	public float laneWidth;

	public int laneCount;
	public AILane[] lanes;

	public void Awake()
	{
        //lanes = new AILane[laneCount];
        //for(int i = 0; i < laneCount; i++)
        //{
        //    lanes[i] = transform.GetChild(i).GetComponent<AILane>();
        //}

        lanes = GetComponentsInChildren<AILane>();
	}
	public void Update()
	{
//        for (int i = 0; i < lanes.Length; i++)
//        {
//            if(i == 0)
//                lanes[0].transform.localPosition = new Vector3(-laneDistance, 0, 0);
//            if (i == 1)
//            {
//                lanes[1].transform.localPosition = new Vector3(laneDistance, 0, 0);
//                lanes[1].transform.localRotation = Quaternion.Euler(0, 180, 0);
//            }
//        }
	}
	private void OnDrawGizmos()
	{
		Gizmos.color = Color.blue;
		Gizmos.DrawSphere(transform.position, 2.5f);
	}
}