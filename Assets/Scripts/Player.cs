using UnityEngine;
using System.Collections;
#pragma warning disable 0618
[RequireComponent(typeof(CharacterController))]
[AddComponentMenu("Player/Player")]
public class Player : MonoBehaviour
{
	public bool isMoving;
	public bool isSprinting;
	public bool isInVehicle;

	public float walkSpeed;
	public float sprintMultiplier;
	public float rotateSpeed;
	public float speedSmoothing;

	private CameraManager camManager;
	private CharacterController cController;
	private Animator animator;
	private Vehicle currentVehicle; // Only access this when isInVehicle is true

	private float moveSpeed;
	private Vector3 moveDirection;
	private float horizontal;
	private float vertical;
    private float sprinting;
	private float sprintingV;
	private float speedV;

	private void Awake()
	{
		camManager = Camera.mainCamera.GetComponent<CameraManager>();
		cController = GetComponent<CharacterController>();
		animator = GetComponent<Animator>();

		camManager.player = this;
	}
	private void Update()
	{
		RaycastHit rayHit = new RaycastHit();
		if(Input.GetButtonDown("Action"))
		{
			if(!isInVehicle)
			{
				if(Physics.Raycast((transform.position + transform.up) + transform.forward * 0.26f, transform.forward, out rayHit, 20.0f))
				{
					if(rayHit.collider.gameObject.tag == "Vehicle")
					{
						GetInVehicle(rayHit.collider.transform.root.gameObject.GetComponent<Vehicle>());
					}
				}
			} else
				ExitVehicle();
		}

		//if (Input)

		UpdateAnimation();
	}
	private void FixedUpdate()
	{
		Vector3 cameraForward = camManager.forwardObject.forward.normalized;
		cameraForward.y = 0;

		horizontal = Input.GetAxis("Strafe");
		vertical = Input.GetAxis("Walk");

		Vector3 targetDir = horizontal * camManager.transform.right + vertical * cameraForward;

		if(targetDir != Vector3.zero)
		{
            transform.rotation = Quaternion.Lerp(transform.rotation, Quaternion.LookRotation(targetDir), Time.deltaTime);
		}

		float targetSpeed = Mathf.Min(targetDir.magnitude, 1.0f);

		if(Input.GetButton("Sprint"))
		{
			isSprinting = true;
			targetSpeed = walkSpeed * sprintMultiplier;
		} else
		{
            isSprinting = false;
			targetSpeed = walkSpeed;
		}

		moveSpeed = Mathf.Lerp(moveSpeed, targetSpeed, speedSmoothing * Time.deltaTime);


		if((horizontal > 0.1f || horizontal < -0.1f) || (vertical > 0.1f || vertical < -0.1f))
		{
			cController.Move(transform.forward * moveSpeed);
		}
	}

	private void UpdateAnimation()
	{
		if(vertical > 0.1f)
			sprinting = Mathf.SmoothDamp(sprinting, isSprinting ? 1 : 0.11f, ref sprintingV, speedSmoothing * Time.deltaTime);
		else
			sprinting = Mathf.SmoothDamp(sprinting, 0, ref sprintingV, speedSmoothing * Time.deltaTime);

		animator.SetFloat("Speed", sprinting);

		animator.SetFloat("Direction", horizontal * 0.5f);
	}
	public void GetInVehicle(Vehicle vehicle)
	{
		vehicle.enabled = true;

		if(vehicle.lightbar)
			vehicle.lightbar.TogglePanel();

		camManager.GetInVehicle(vehicle.transform);

		MonoBehaviour[] components = GetComponents<MonoBehaviour>();
		for(int i = 0; i < components.Length; i++)
		{
			if(components[i] != this)
				components[i].enabled = false;
		}

		for(int i = 0; i < transform.GetChildCount(); i++)
		{
			transform.GetChild(i).gameObject.SetActive(false);
		}

		currentVehicle = vehicle;
		currentVehicle.isPlayerOccupied = true;
		isInVehicle = true;
	}
	public void ExitVehicle()
	{
		if(isInVehicle)
			currentVehicle.isPlayerOccupied = false;

		if(currentVehicle.lightbar)
			currentVehicle.lightbar.TogglePanel();

		transform.position = currentVehicle.transform.position - (currentVehicle.transform.right * 2);

		camManager.target = transform;

		for(int i = 0; i < transform.GetChildCount(); i++)
		{
			transform.GetChild(i).gameObject.SetActive(true);
		}

		MonoBehaviour[] components = GetComponents<MonoBehaviour>();
		for(int i = 0; i < components.Length; i++)
		{
			if(components[i] != this)
				components[i].enabled = true;
		}

		isInVehicle = false;
	}
}