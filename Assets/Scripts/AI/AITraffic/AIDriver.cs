using UnityEngine;
using System.Collections;

[AddComponentMenu("AI/AI Driver")]
public class AIDriver : MonoBehaviour
{
    public CarWheel flWheel;
    public CarWheel frWheel;
    public CarWheel rlWheel;
    public CarWheel rrWheel;

	public float desiredSpeed;
	public float rotateSpeed;
    public float frontBumperOffset;
	public float reactionDistance;

	public AINode currentNode;

	public CarControl carControl;

	private void Awake()
	{
        carControl = GetComponent<CarControl>();
        flWheel = carControl.WheelFL;
        frWheel = carControl.WheelFR;
        rlWheel = carControl.WheelRL;
        rrWheel = carControl.WheelRR;

		JoinNodeNetwork();
	}
	private void FixedUpdate()
	{
        // Only drive if we have a node to drive towards
		if(currentNode)
		{
            // Drive if we are not going too fast
			if(rigidbody.velocity.magnitude < desiredSpeed)
			{
                rlWheel.motorInput = 1.0f;
                rrWheel.motorInput = 1.0f;
			}



            // Calculate how much to steer and apply it to the car
            Vector3 targetPoint = new Vector3(currentNode.transform.position.x, transform.position.y, currentNode.transform.position.z);
            Vector3 steerVector = transform.InverseTransformPoint(targetPoint);
			float newSteer = rotateSpeed * (steerVector.x / steerVector.magnitude);
			newSteer = Mathf.Clamp(newSteer, -1, 1);

            //carControl.steerInput = Mathf.Lerp(carControl.steerInput, newSteer, Time.deltaTime);
            carControl.steerInput = newSteer;



            // If we are close to the target node, find the next one
			if(Vector3.Distance(transform.position, currentNode.transform.position) < 2)
			{
				if(currentNode.endNodeJunction)
				{
					currentNode = currentNode.endNodeJunction.MakeIntersection(currentNode);
				} else
					currentNode = currentNode.lane.nodes[int.Parse(currentNode.gameObject.name)];
			}
		}



        RaycastHit rayHit = new RaycastHit();
        Vector3 rayPos1 = transform.position + (-transform.right * 0.75f) + transform.up + (transform.forward * frontBumperOffset);
        Vector3 rayPos2 = transform.position + transform.up + (transform.forward * frontBumperOffset);
        Vector3 rayPos3 = transform.position + (transform.right * 0.75f) + transform.up + (transform.forward * frontBumperOffset);

        Debug.DrawLine(rayPos2, currentNode.transform.position, Color.red);

        Debug.DrawLine(rayPos1, rayPos1 + (transform.forward * reactionDistance));
        Debug.DrawLine(rayPos2, rayPos2 + (transform.forward * reactionDistance));
        Debug.DrawLine(rayPos3, rayPos3 + (transform.forward * reactionDistance));
        if (Physics.Raycast(rayPos1, transform.forward, out rayHit, reactionDistance) ||
            Physics.Raycast(rayPos2, transform.forward, out rayHit, reactionDistance) ||
            Physics.Raycast(rayPos3, transform.forward, out rayHit, reactionDistance))
        {
            float hitDistance = Vector3.Distance(rayPos2, rayHit.point);

            //print(Mathf.Clamp(reactionDistance - hitDistance, 0, 1));
            flWheel.brakeInput = Mathf.Clamp01(reactionDistance - hitDistance);
            frWheel.brakeInput = Mathf.Clamp01(reactionDistance - hitDistance);
            rlWheel.brakeInput = Mathf.Clamp01(reactionDistance - hitDistance);
            rrWheel.brakeInput = Mathf.Clamp01(reactionDistance - hitDistance);
        }
        else
        {
            flWheel.brakeInput = 0;
            frWheel.brakeInput = 0;
            rlWheel.brakeInput = 0;
            rrWheel.brakeInput = 0;
        }
	}
    private void OnGUI()
    {

    }
    //private void OnTriggerStay()
    //{
    //    Debug.Log("trigger stay");
    //    flWheel.brakeInput = 1.0f;
    //    frWheel.brakeInput = 1.0f;
    //    rlWheel.brakeInput = 1.0f;
    //    rrWheel.brakeInput = 1.0f;

    //    rlWheel.motorInput = 0.0f;
    //    rrWheel.motorInput = 0.0f;
    //}

	private void JoinNodeNetwork()
	{
		if(!currentNode)
		{
            Debug.Log("No current node! attempting to find one");
			AINode[] sceneNodes = GameObject.FindObjectsOfType<AINode>();
			float closestDistance = 0;
			int closestIndex = 0;
			for(int i = 0; i < sceneNodes.Length; i++)
			{
				if(i == 0)
				{
					closestDistance = Vector3.Distance(transform.position, sceneNodes[i].transform.position);
					closestIndex = i;
				} else
				{
					if(sceneNodes[i].isStartNode)
					{
						if(closestDistance > Vector3.Distance(transform.position, sceneNodes[i].transform.position))
						{
							closestDistance = Vector3.Distance(transform.position, sceneNodes[i].transform.position);
							closestIndex = i;
						}
					}
				}
			}
			
			currentNode = sceneNodes[closestIndex];
		}
	}
}