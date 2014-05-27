using UnityEngine;
using System.Collections;
#pragma warning disable 0649
[AddComponentMenu("Player/Camera Manager")]
public class CameraManager : MonoBehaviour
{
    public Transform fpsCamPos;
    public Transform fpsLookAtLeft;
    public Transform fpsLookAtRight;
    public Camera tpsCam;
    public Player player;

    public Transform target;
    public float rotationSpeed;
    public Vector2 mousing;
    public Vector2 mousingSpeed;

    public float currentTPSDistance;
    public float currentTPSHeight;
    public float tpsDistance1;
    public float tpsHeight1;
    public float tpsDistance2;
    public float tpsHeight2;

    public int cycleIndex;// 0-FPS, 1-TPS Close, 2-TPS Far

	private float lookAtLeftV;
	private float lookAtRightV;
    private Vector3 lookAtPos;

	[HideInInspector]public Transform forwardObject;

    private void Awake()
    {
        cycleIndex = 1;

		forwardObject = new GameObject("forward").transform;
		forwardObject.parent = transform;
		forwardObject.localPosition = Vector3.zero;
		forwardObject.localRotation = Quaternion.identity;
    }
    private void Update()
    {
		forwardObject.localEulerAngles = new Vector3(0, forwardObject.localEulerAngles.y, forwardObject.localEulerAngles.z);

		mousing.x += Input.GetAxis("Mouse X") * mousingSpeed.x * Time.deltaTime;
		mousing.y += Input.GetAxis("Mouse Y") * mousingSpeed.y * Time.deltaTime;

        if (!player.isInVehicle)
        {
            if (Input.GetButton("Strafe") || Input.GetButton("Walk"))
                mousing = Vector2.zero;
        }


        if (Input.GetKeyDown(KeyCode.V))
        {
            if (cycleIndex < 2)
                cycleIndex++;
            else
                cycleIndex = 0;

            if (cycleIndex == 0 && !player.isInVehicle)
                cycleIndex = 1;
        }


		if (cycleIndex == 0)//FPS
		{
			if (!player.isInVehicle)
				cycleIndex = 1;
			else
			{
				transform.position = fpsCamPos.position;

				if (Input.GetAxis("Mouse X") < -0.1f)
				{
					Quaternion rotation = Quaternion.LookRotation(fpsLookAtLeft.position - transform.position);
					transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * (rotationSpeed * 10));
				}
				else if (Input.GetAxis("Mouse X") > 0.1f)
				{
					Quaternion rotation = Quaternion.LookRotation(fpsLookAtRight.position - transform.position);
					transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * (rotationSpeed * 10));
				}
				else
					transform.rotation = Quaternion.Slerp(transform.rotation, fpsCamPos.rotation, Time.deltaTime * (rotationSpeed * 10));
			}
		}
		else
		{
			if (cycleIndex == 1)//TPS Close
			{
				currentTPSDistance = tpsDistance1;
				currentTPSHeight = tpsHeight1;
			}
			else if (cycleIndex == 2)//TPS Far
			{
				currentTPSDistance = tpsDistance2;
				currentTPSHeight = tpsHeight2;
			}

			Quaternion currentRot;
			float currentRotAngle = transform.eulerAngles.y;
			float currentHeight = transform.position.y;
			float wantedRotAngle;
			float wantedHeight = target.position.y + 1.5f + currentTPSHeight + mousing.y;

			if (!player.isInVehicle)
			{
				//if (player.GetComponent<CharacterController>().velocity.magnitude < 0.1f && player.GetComponent<CharacterController>().velocity.magnitude > -0.1f)
                if(!player.isMoving)
				{
					if(Input.GetButton("Strafe") || Input.GetButton("Walk"))
						mousing = Vector2.zero;
					wantedRotAngle = target.eulerAngles.y + mousing.x;
				}
				else
					wantedRotAngle = target.eulerAngles.y + mousing.x;
			} else
				wantedRotAngle = target.eulerAngles.y + mousing.x;

			currentRotAngle = Mathf.LerpAngle(currentRotAngle, wantedRotAngle, rotationSpeed * Time.deltaTime);

			currentHeight = Mathf.Lerp(currentHeight, wantedHeight, rotationSpeed * Time.deltaTime);
			currentHeight = Mathf.Lerp(currentHeight, wantedHeight, rotationSpeed * Time.deltaTime);

			currentRot = Quaternion.Euler(0, currentRotAngle, 0);

			transform.position = target.position;
			transform.position -= currentRot * Vector3.forward * currentTPSDistance;

			transform.position = new Vector3(transform.position.x, currentHeight, transform.position.z);

			transform.LookAt(target.position + (Vector3.up * 1.5f));

			forwardObject.localEulerAngles = new Vector3(0, forwardObject.localEulerAngles.y, forwardObject.localEulerAngles.z);
		}
    }
    public void GetInVehicle(Transform vehicle)
    {
        target = vehicle;
        fpsCamPos = vehicle.FindChild("CameraPos");
        fpsLookAtLeft = vehicle.FindChild("LookAt_Left");
		fpsLookAtLeft.position = new Vector3(fpsLookAtLeft.position.x, fpsCamPos.position.y, fpsLookAtLeft.position.z);
        fpsLookAtRight = vehicle.FindChild("LookAt_Right");
		fpsLookAtRight.position = new Vector3(fpsLookAtRight.position.x, fpsCamPos.position.y, fpsLookAtRight.position.z);
    }
}