/*
This camera smoothes out rotation around the y-axis and height.
Horizontal Distance to the target is always fixed.

There are many different ways to smooth the rotation but doing it this way gives you a lot of control over how the camera behaves.

For every of those smoothed values we calculate the wanted value and the current value.
Then we smooth it using the Lerp function.
Then we apply the smoothed values to the transform's position.
*/

#pragma strict

// The target we are following
var target : Transform;
// The distance in the x-z plane to the target
var distance = 10.0;
// the height we want the camera to be above the target
var height = 5.0;
// Look above the target (height * this ratio)
var targetHeightRatio = 0.5;
// How fast we reach the target values
var heightDamping = 2.0;
var rotationDamping = 3.0;

var followVelocity = true;
var velocityDamping = 5.0;

private var lastPos = Vector3.zero;
private var currentVelocity = Vector3.zero;
private var wantedRotationAngle = 0.0;

@HideInInspector
var reset = true;		// Make true from scripting for resetting the direction settings


function LateUpdate () {
	// Early out if we don't have a target
	if (!target) return;
	
	if (reset)
		{
		lastPos = target.position;
		wantedRotationAngle = target.eulerAngles.y;
		currentVelocity = target.forward * 2.0;
		reset = false;
		}
	
	var updatedVelocity = (target.position - lastPos) / Time.deltaTime;
	updatedVelocity.y = 0.0;
	
	
	if (updatedVelocity.magnitude > 1.0)
		{
		currentVelocity = Vector3.Lerp(currentVelocity, updatedVelocity, velocityDamping * Time.deltaTime);
		wantedRotationAngle = Mathf.Atan2(currentVelocity.x, currentVelocity.z) * Mathf.Rad2Deg;
		}
	lastPos = target.position;
	
	if (!followVelocity)
		wantedRotationAngle = target.transform.eulerAngles.y;


	/*
	var velocity = (target.position - lastPos) / Time.deltaTime;
	velocity.y = 0.0;
	
//	AQUI: Hacer un Damp con velocity para evitar brusquedades (updatedVelocity, currentVelocity, velocityDamping)

	var wantedRotationAngle = target.eulerAngles.y;
	if (velocity.magnitude > 1.0)
		wantedRotationAngle = Mathf.Atan2(velocity.x, velocity.z) * Mathf.Rad2Deg;
	lastPos = target.position;
*/

	// Calculate the current rotation angles
	//var wantedRotationAngle = target.eulerAngles.y;
	var wantedHeight = target.position.y + height;

	var currentRotationAngle = transform.eulerAngles.y;
	var currentHeight = transform.position.y;

	// Damp the rotation around the y-axis
	currentRotationAngle = Mathf.LerpAngle (currentRotationAngle, wantedRotationAngle, rotationDamping * Time.deltaTime);

	// Damp the height
	currentHeight = Mathf.Lerp (currentHeight, wantedHeight, heightDamping * Time.deltaTime);

	// Convert the angle into a rotation
	var currentRotation = Quaternion.Euler (0, currentRotationAngle, 0);

	// Set the position of the camera on the x-z plane to:
	// distance meters behind the target
	transform.position = target.position;
	transform.position -= currentRotation * Vector3.forward * distance;

	// Set the height of the camera
	transform.position.y = currentHeight;

	if (target.rigidbody)
		{
		// We use centerOfMass instead of worldCenterOfMass because the first one is interpolated.
		
		var CoM = Vector3.Scale(target.rigidbody.centerOfMass, Vector3(1.0/target.transform.localScale.x, 1.0/target.transform.localScale.y, 1.0/target.transform.localScale.z));
		CoM = target.transform.TransformPoint(CoM);
		
		transform.LookAt (CoM + Vector3.up*height*targetHeightRatio);
		}
	else
		transform.LookAt (target.position + Vector3.up*height*targetHeightRatio);
	
}













