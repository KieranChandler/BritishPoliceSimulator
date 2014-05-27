using UnityEngine;
using System.Collections;

[AddComponentMenu("AI/Traffic Spawner")]
public class TrafficSpawner : MonoBehaviour
{
    public AIRoad[] roads;

    public GameObject[] spawnableVehicles;

    public float spawnInterval;
    //public float randomness;
    public int maxVehicles;


    public int spawnedVehiclesCount;
    public float lastSpawnTime;

    private void Awake()
    {
        lastSpawnTime = Time.time;
        spawnedVehiclesCount = 0;

        roads = GetComponentsInChildren<AIRoad>();
    }
    private void Update()
    {
        if (spawnedVehiclesCount < maxVehicles)
        {
            if(Time.time - lastSpawnTime >= spawnInterval)
            {
                AIRoad road = roads[Random.Range(0, roads.Length - 1)];
                AILane lane = road.lanes[Random.Range(0, road.lanes.Length - 1)];
                AINode node = lane.nodes[Random.Range(0, lane.nodes.Count - 1)];

                if(node.isEndNode)
                {
                    int prevNodeIndex = node.lane.nodes.IndexOf(node) - 1;
                    AINode prevNode = node.lane.nodes[prevNodeIndex];
                    node = prevNode;
                }



                GameObject aiObject = (GameObject)Instantiate(spawnableVehicles[0], node.transform.position + (transform.up * 3), node.transform.rotation);
                AIDriver ai = aiObject.GetComponent<AIDriver>();

                int nextNodeIndex = node.lane.nodes.IndexOf(node) + 1;
                AINode nextNode = node.lane.nodes[nextNodeIndex];
                ai.currentNode = nextNode;



                lastSpawnTime = Time.time;
                spawnedVehiclesCount++;
            }
        }
    }
}