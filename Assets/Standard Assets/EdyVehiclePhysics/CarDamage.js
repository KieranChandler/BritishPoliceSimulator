//========================================================================================================================
// Edy Vehicle Physics - (c) Angel Garcia "Edy" - Oviedo, Spain
// http://www.edy.es/dev/vehicle-physics
// 
// Terms & Conditions:
//  - Use for unlimited time, any number of projects, royalty-free.
//  - Keep the copyright notices on top of the source files.
//  - Resale or redistribute as anything except a final product to the end user (asset / library / engine / middleware / etc.) is not allowed.
//  - Put me (Angel Garcia "Edy") in your game's credits as author of the vehicle physics.
//
// Bug reports, improvements to the code, suggestions on further developments, etc are always welcome.
// Unity forum user: Edy
//========================================================================================================================
//
// CarDamage
//
// Manages the mesh deformation on impacts, as well as deform nodes and colliders.
// Requires CarVisuals (collision contacts are managed there).
//
//========================================================================================================================

#pragma strict

var minForce = 1.0;
var multiplier = 0.1;
var deformRadius = 1.0;
var deformNoise = 0.1;
var deformNodeRadius = 0.5;
var maxDeform = 0.5;
var maxNodeRotationStep = 10.0;
var maxNodeRotation = 14.0;
var bounceSpeed = 0.1;
var bounceThreshold = 0.002;
var autoBounce = false;
var showRepairingLabel = true;

var DeformMeshes : MeshFilter[];
var DeformNodes : Transform[];
var DeformColliders : MeshCollider[];


private var m_CarVisuals : CarVisuals;


class VertexData extends System.Object 
	{
	var permaVerts : Vector3[];
	}
	
private var m_meshData : VertexData[];
private var m_colliderData : VertexData[];
	
private var m_permaNodes : Vector3[];
private var m_permaNodeAngles : Quaternion[];

private var m_doBounce = false;


function OnEnable ()
	{
	m_CarVisuals = GetComponent(CarVisuals) as CarVisuals;
	}
	

function Start ()
	{
	// Almacenar los vértices originales de los meshes a deformar
	
	m_meshData = new VertexData[DeformMeshes.length];
	
	for (var i=0; i<DeformMeshes.length; i++)
		{
		m_meshData[i] = new VertexData();
		m_meshData[i].permaVerts = DeformMeshes[i].mesh.vertices;
		}
		
	// Almacenar los vértices originales de los colliders a deformar

	m_colliderData = new VertexData[DeformColliders.length];
	
	for (i=0; i<DeformColliders.length; i++)
		{
		m_colliderData[i] = new VertexData();
		m_colliderData[i].permaVerts = DeformColliders[i].sharedMesh.vertices;
		}	
		
	// Almacenar posición y orientación originales de los nodos a deformar
	
	m_permaNodes = new Vector3[DeformNodes.length];
	m_permaNodeAngles = new Quaternion[DeformNodes.length];	
	
	for (i=0; i<DeformNodes.length; i++)
		{
		m_permaNodes[i] = DeformNodes[i].localPosition;
		m_permaNodeAngles[i] = DeformNodes[i].localRotation;
		}
	}


private function DeformMesh(mesh : Mesh, originalMesh : Vector3[], localTransform : Transform, contactPoint : Vector3, contactForce : Vector3)
	{
	var vertices = mesh.vertices;
	var sqrRadius = deformRadius*deformRadius;
	var sqrMaxDeform = maxDeform*maxDeform;
	
	var localContactPoint = localTransform.InverseTransformPoint(contactPoint);
	var localContactForce = localTransform.InverseTransformDirection(contactForce);
	
	for (var i=0; i<vertices.length; i++)
		{
		var dist = (localContactPoint-vertices[i]).sqrMagnitude;
			
		if (dist < sqrRadius)
			{
			vertices[i] += (localContactForce * (deformRadius - Mathf.Sqrt(dist)) / deformRadius) + Random.onUnitSphere * deformNoise;
				
			var deform = vertices[i]-originalMesh[i];
			
			if (deform.sqrMagnitude > sqrMaxDeform)
				vertices[i] = originalMesh[i] + deform.normalized * maxDeform;
			}
		}
		
	mesh.vertices = vertices;
	mesh.RecalculateNormals();
	mesh.RecalculateBounds();
	}
	

private function DeformNode(T : Transform, originalLocalPos : Vector3, originalLocalRot : Quaternion, contactPoint : Vector3, contactVector : Vector3)
	{
	var dist = (contactPoint-T.position).sqrMagnitude;
	
	// Deformar posición
	
	if (dist < deformRadius*deformRadius)
		{
		var deformForce = (deformRadius - Mathf.Sqrt(dist)) / deformRadius;		
		T.position += contactVector * deformForce + Random.onUnitSphere * deformNoise;
		
		var deform = T.localPosition - originalLocalPos;
		
		if (deform.sqrMagnitude > maxDeform*maxDeform)
			T.localPosition = originalLocalPos + deform.normalized * maxDeform;
		}
	
	// Deformar rotación
		
	if (dist < deformNodeRadius*deformNodeRadius)
		{
		var angles = AnglesToVector(T.localEulerAngles);
		
		var angleLimit = Vector3(maxNodeRotation, maxNodeRotation, maxNodeRotation);		
		var angleMax = angles + angleLimit;
		var angleMin = angles - angleLimit;
		
		angles += deformForce * Random.onUnitSphere * maxNodeRotationStep;
				
		T.localEulerAngles = Vector3(Mathf.Clamp(angles.x, angleMin.x, angleMax.x), Mathf.Clamp(angles.y, angleMin.y, angleMax.y), Mathf.Clamp(angles.z, angleMin.z, angleMax.z));
		}
	}


// Devuelve TRUE si todos los vértices han alcanzado ya su posición original, FALSE si queda alguno por llegar.
	
private function BounceMesh(mesh : Mesh, originalMesh : Vector3[], maxSpeed : float, sqrThreshold : float) : boolean
	{
	var result = true;	
	var vertices = mesh.vertices;
	
	for (var i=0;i<vertices.length; i++) 
		{
		vertices[i] = Vector3.MoveTowards(vertices[i], originalMesh[i], maxSpeed);
		
		if ((originalMesh[i] - vertices[i]).sqrMagnitude >= sqrThreshold)
			result = false;
		}
		
	mesh.vertices = vertices;
	mesh.RecalculateNormals();
	mesh.RecalculateBounds();
	
	return result;
	}
	

// Devuelve TRUE si todos los nodos han alcanzado ya su posición y orientación originales, FALSE si queda alguno por llegar.
	
private function BounceNode(T : Transform, originalLocalPosition : Vector3, originalLocalRotation : Quaternion, maxSpeed : float, sqrThreshold : float) : boolean
	{
	T.localPosition = Vector3.MoveTowards(T.localPosition, originalLocalPosition, maxSpeed);
	T.localRotation = Quaternion.RotateTowards(T.localRotation, originalLocalRotation, maxSpeed*50.0);
	
	return (originalLocalPosition - T.localPosition).sqrMagnitude < sqrThreshold &&
			Quaternion.Angle(originalLocalRotation, T.localRotation) < sqrThreshold;
	}
	
	
private function RestoreNode(T : Transform, originalLocalPos : Vector3, originalLocalAngles : Quaternion)
	{
	T.localPosition = originalLocalPos;
	T.localRotation = originalLocalAngles;
	}
	

private function AnglesToVector(Angles : Vector3) : Vector3
	{
	if (Angles.x > 180) Angles.x = -360+Angles.x;
	if (Angles.y > 180) Angles.y = -360+Angles.y;
	if (Angles.z > 180) Angles.z = -360+Angles.z;
	return Angles;
	}
	
	
private function RestoreColliders()
	{
	if (DeformColliders.length > 0)
		{
		var CoM = rigidbody.centerOfMass;
		
		for (var i=0; i<DeformColliders.length; i++)
			{
			// Necesario un mesh intermedio con los datos actuales.
			
			var mesh : Mesh = new Mesh();
			mesh.vertices = m_colliderData[i].permaVerts;
			mesh.triangles = DeformColliders[i].sharedMesh.triangles;
			
			mesh.RecalculateNormals();
			mesh.RecalculateBounds();
			
			DeformColliders[i].sharedMesh = mesh;
			}
		
		rigidbody.centerOfMass = CoM;				
		}
	}


function OnCollisionEnter (collision : Collision)
	{
	if (autoBounce) m_doBounce = true;
	}
	
	
//--------------------------------------------------------------

function DoBounce ()
	{
	m_doBounce = true;
	}


function OnGUI ()
	{
	if (showRepairingLabel && m_doBounce)
		GUI.Label (Rect (16, Screen.height-40, 200, 60), "REPAIRING");
	}


//--------------------------------------------------------------
function Update () 
	{
	var i : int;
	
	var contactForce = Vector3.zero;
	
	// Comprobar si hay una deformación disponible bien por impacto o por arrastre
	
	if (m_CarVisuals.localImpactVelocity.sqrMagnitude > minForce*minForce)
		contactForce = transform.TransformDirection(m_CarVisuals.localImpactVelocity) * multiplier * 0.2;
	else
	if (m_CarVisuals.localDragVelocityDiscrete.sqrMagnitude > minForce*minForce)
		contactForce = transform.TransformDirection(m_CarVisuals.localDragVelocityDiscrete) * multiplier * 0.01;
		
	// Si la hay, aplicarla
	
	if (contactForce.sqrMagnitude > 0.0)
		{
		var contactPoint = transform.TransformPoint(m_CarVisuals.localImpactPosition);
		
		// Deformar los meshes
		
		for (i=0; i<DeformMeshes.length; i++)
			DeformMesh(DeformMeshes[i].mesh, m_meshData[i].permaVerts, DeformMeshes[i].transform, contactPoint, contactForce);
		
		// Deformar los colliders

		if (DeformColliders.length > 0)
			{
			var CoM = rigidbody.centerOfMass;
			
			for (i=0; i<DeformColliders.length; i++)
				{
				// Necesario un mesh intermedio, no sirve mandar sharedMesh a deformar
				
				var mesh : Mesh = new Mesh();
				mesh.vertices = DeformColliders[i].sharedMesh.vertices;
				mesh.triangles = DeformColliders[i].sharedMesh.triangles;
				
				DeformMesh(mesh, m_colliderData[i].permaVerts, DeformColliders[i].transform, contactPoint, contactForce);
				DeformColliders[i].sharedMesh = mesh;
				}
				
			rigidbody.centerOfMass = CoM;
			}

		// Deformar los nodos. Cada uno se modifica una vez por cada colisión, usando el punto de contacto que primero lo modifique.

		contactForce *= 0.5;
		
		for (i=0; i<DeformNodes.length; i++)
			DeformNode(DeformNodes[i], m_permaNodes[i], m_permaNodeAngles[i], contactPoint, contactForce);
		}

	
	if (m_doBounce)
		{
		var speed = bounceSpeed * Time.deltaTime;
		var sqrBounceLimit = bounceThreshold * bounceThreshold;
		var completed = true;
	
		// Mover los meshes hacia su posición original
		
		for (i=0; i<DeformMeshes.length; i++)
			completed = BounceMesh(DeformMeshes[i].mesh, m_meshData[i].permaVerts, speed, sqrBounceLimit) && completed;		// completed DEBE IR DETRAS, para que se evalue primero la funcion.
			
		// Mover los nodos hacia su posición y orientación originales
		
		for (i=0; i<DeformNodes.length; i++)
			completed = BounceNode(DeformNodes[i], m_permaNodes[i], m_permaNodeAngles[i], speed, sqrBounceLimit) && completed;	// completed DEBE IR DETRAS, para que se evalue primero la funcion.
			
		// Al finalizar la restauración progresiva los nodos se llevan a sus posiciones y orientaciones exactas (evitar errores de aproximación)
		// Los colliders también se restauran de una vez.
		
		if (completed)
			{
			m_doBounce = false;
			
			// Restaurar estado exacto de los nodos
			
			for (i=0; i<DeformNodes.length; i++)
				RestoreNode(DeformNodes[i], m_permaNodes[i], m_permaNodeAngles[i]);			
			
			// Restaurar estado exacto de los colliders
			
			RestoreColliders();
			}
		}
	}
	

	
	
	
	
	
	
	
	
	
	
	
	