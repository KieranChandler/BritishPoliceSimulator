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
// CarVisuals
//
// Provides visual effects for the wheels including rotation, steering, suspension, skidmarks and smoke.
//
//========================================================================================================================

#pragma strict

var PivotFL : Transform;
var PivotFR : Transform;
var PivotRL : Transform;
var PivotRR : Transform;
var MeshFL : Transform;
var MeshFR : Transform;
var MeshRL : Transform;
var MeshRR : Transform;
var SteeringWheel : Transform;
var ignoredColliders : Collider[];	// Colliders que deben ser ignorados al calcular la posición de las ruedas. Son los colliders que toquen a los WheelColliders. Es necesario para evitar que las ruedas "salten" si se usa interpolación en el rigidbody.

var forwardSkidmarksBegin = 1.5;	 
var forwardSkidmarksRange = 1.0;
var sidewaysSkidmarksBegin = 1.5;
var sidewaysSkidmarksRange = 1.0;
var skidmarksWidth = 0.275;			// Ancho de las marcas de la rueda
var skidmarksOffset = 0.0;			// Ajuste de posición de las marcas de la rueda. >0 más separadas, <0 más juntas. Necesario ajustar en tiempo de diseño (no cambian runtime).
var alwaysDrawSkidmarks = false;	// Forces the skidmarks to be drawn with movement regardless skid values. Useful for some kind of terrains.

var forwardSmokeBegin = 5.0;	
var forwardSmokeRange = 3.0;
var sidewaysSmokeBegin = 4.0;
var sidewaysSmokeRange = 3.0;
var smokeStartTime = 2.0;			// Segundos que es necesario pasar quemando rueda antes de que empiece a salir humo progresivamente.
var smokePeakTime = 8.0;			// Tiempo en el que el humo sale a toda la intensidad.
var smokeMaxTime = 10.0;			// Tiempo maximo que se tiene en cuenta antes de empezar a decrementar tiempo.

var wheelGroundedBias = 0.02;		// Distancia de penetración de la rueda en el suelo (simula la deformación por el peso)
var steeringWheelMax = 520;			// Grados de giro del volante, en cada sentido.

var impactThreeshold = 0.6;			// 0.0 - 1.0. The DotNormal of the impact is calculated. Less than this value means drag, more means impact.
var impactInterval = 0.2;			// Time interval between processing impacts for visual or sound effects.
var impactIntervalRandom = 0.4;		// Random percentaje for the impact interval, avoiding regularities.
var impactMinSpeed = 2.0;			// Minimum relative velocity at which conctacts may be consideered impacts.

var disableRaycast = false;			// Avoids to use Raycast to calculate the wheel's visual contact point. Results on inaccurate but very fast positioning.
var disableWheelVisuals = false;	// Disable visual calculations for the wheels (smoke and skidmarks). This affects the sound as well! Useful for vehicles stopped or outside the visual range.

// Variables expuestas para uso por otros scripts

@HideInInspector					// Velocidades de giro de cada rueda
var spinRateFL = 0.0;
@HideInInspector
var spinRateFR = 0.0;
@HideInInspector
var spinRateRL = 0.0;
@HideInInspector
var spinRateRR = 0.0;

@HideInInspector					// Ratios de derrape en cada rueda
var skidValueFL = 0.0;
@HideInInspector
var skidValueFR = 0.0;
@HideInInspector
var skidValueRL = 0.0;
@HideInInspector
var skidValueRR = 0.0;

@HideInInspector					// Esfuerzo soportado por la suspension. >0 = esfuerzo de compresión. <0 = esfuerzo de expansión. 0 = estable.
var suspensionStressFL = 0.0;
@HideInInspector
var suspensionStressFR = 0.0;
@HideInInspector
var suspensionStressRL = 0.0;
@HideInInspector
var suspensionStressRR = 0.0;

@HideInInspector
var localImpactPosition = Vector3.zero;			// ALL POSITIONS AND VELOCITIES ARE LOCAL
@HideInInspector
var localImpactVelocity = Vector3.zero;
@HideInInspector
var localImpactSoftSurface = false;

@HideInInspector
var localDragPosition = Vector3.zero;			// Drag values exposed continuously
@HideInInspector
var localDragVelocity = Vector3.zero;
@HideInInspector
var localDragSoftSurface = false;

@HideInInspector				
var localDragPositionDiscrete = Vector3.zero;	// These are exposed at the same interval as impacts (impactInterval)
@HideInInspector
var localDragVelocityDiscrete = Vector3.zero;



// Clases y objetos internos

class WheelVisualData
	{
	var colliderOffset : float = 0.0;
	var skidmarkOffset : float = 0.0;
	
	var wheelVelocity : Vector3 = Vector3.zero;
	var groundSpeed : Vector3 = Vector3.zero;
	var angularVelocity : float = 0.0;
	
	var lastSuspensionForce : float = 0.0;
	var suspensionStress : float = 0.0;
	
	var lastSkidmark : int = -1;
	var skidmarkTime : float = 0.0;	
	
	var skidSmokeTime : float = Time.time;
	var skidSmokePos : Vector3 = Vector3.zero;
	var skidSmokeIntensity : float = 0.0;
	
	var skidValue: float = 0.0;
	}


private var m_Car : CarControl;

private var m_skidmarks : Skidmarks;
private var m_skidSmoke : ParticleEmitter;
private var m_wheelData : WheelVisualData[];


function Start ()
	{
	m_Car = GetComponent(CarControl) as CarControl;
	
	m_skidmarks = FindObjectOfType(Skidmarks) as Skidmarks;
	if (m_skidmarks)
		m_skidSmoke = m_skidmarks.GetComponentInChildren(ParticleEmitter) as ParticleEmitter;
		
	m_wheelData = new WheelVisualData[4];
	for (var i=0; i<4; i++)
		m_wheelData[i] = new WheelVisualData();
		
	m_wheelData[0].colliderOffset = transform.InverseTransformDirection(PivotFL.position - m_Car.WheelFL.transform.position).x;
	m_wheelData[1].colliderOffset = transform.InverseTransformDirection(PivotFR.position - m_Car.WheelFR.transform.position).x;
	m_wheelData[2].colliderOffset = transform.InverseTransformDirection(PivotRL.position - m_Car.WheelRL.transform.position).x;
	m_wheelData[3].colliderOffset = transform.InverseTransformDirection(PivotRR.position - m_Car.WheelRR.transform.position).x;

	m_wheelData[0].skidmarkOffset = m_wheelData[0].colliderOffset - skidmarksOffset;
	m_wheelData[1].skidmarkOffset = m_wheelData[1].colliderOffset + skidmarksOffset;
	m_wheelData[2].skidmarkOffset = m_wheelData[2].colliderOffset - skidmarksOffset;
	m_wheelData[3].skidmarkOffset = m_wheelData[3].colliderOffset + skidmarksOffset;	
	}
	
	
function Update () 
	{
	// Efectos visuales (giro de ruedas, derrape, humo)

	DoWheelVisuals(m_Car.WheelFL, MeshFL, PivotFL, m_wheelData[0]);
	DoWheelVisuals(m_Car.WheelFR, MeshFR, PivotFR, m_wheelData[1]);
	DoWheelVisuals(m_Car.WheelRL, MeshRL, PivotRL, m_wheelData[2]);
	DoWheelVisuals(m_Car.WheelRR, MeshRR, PivotRR, m_wheelData[3]);
	
	// Parámetros publicados (usados por CarSound).
	
	spinRateFL = m_wheelData[0].angularVelocity;
	spinRateFR = m_wheelData[1].angularVelocity;
	spinRateRL = m_wheelData[2].angularVelocity;
	spinRateRR = m_wheelData[3].angularVelocity;	
	
	skidValueFL = m_wheelData[0].skidValue;
	skidValueFR = m_wheelData[1].skidValue;
	skidValueRL = m_wheelData[2].skidValue;
	skidValueRR = m_wheelData[3].skidValue;
	
	suspensionStressFL = m_wheelData[0].suspensionStress;
	suspensionStressFR = m_wheelData[1].suspensionStress;
	suspensionStressRL = m_wheelData[2].suspensionStress;
	suspensionStressRR = m_wheelData[3].suspensionStress;
	
	// Proceso de impactos - pasan a las propiedades publicadas
	
	ProcessImpacts();
	ProcessDrags(Vector3.zero, Vector3.zero, false);
	
	// Ajuste del mesh de las ruedas según el ángulo de giro y la compresión de la suspensión para todas las ruedas.
	// El Raycast se desactiva en los colliders que tocan a WheelCollider para evitar incidir con ellos cuando la interpolación está activada en el rigidbody.
	
	var steerL = m_Car.getSteerL(); 
	var steerR = m_Car.getSteerR();
	
	for (var coll in ignoredColliders)
		coll.gameObject.layer = 2;
		
	DoWheelPosition(m_Car.WheelFL, PivotFL, steerL, m_wheelData[0]);
	DoWheelPosition(m_Car.WheelFR, PivotFR, steerR, m_wheelData[1]);
	DoWheelPosition(m_Car.WheelRL, PivotRL, 0, m_wheelData[2]);
	DoWheelPosition(m_Car.WheelRR, PivotRR, 0, m_wheelData[3]);
	
	for (var coll in ignoredColliders)
		coll.gameObject.layer = 0;
		
	// Ajustar el volante, si hay
	
	if (SteeringWheel)
		{
		var currentAngle = m_Car.steerInput >= 0.0? steerR : steerL;
		SteeringWheel.localEulerAngles.z = -steeringWheelMax * currentAngle/m_Car.steerMax;
		}	
	}


private static function IsHardSurface(col : Collider) : boolean
	{
	return !col.sharedMaterial || col.attachedRigidbody != null;
	}
	
private static function IsStaticSurface(col : Collider) : boolean
	{
	return !col.attachedRigidbody;
	}
	

function DoWheelVisuals(Wheel : CarWheel, Graphic : Transform, Pivot : Transform, wheelData : WheelVisualData)
	{
	var WheelCol : WheelCollider;
	var Hit : WheelHit;
	var deltaT : float;
	var Skid : float;
	var wheelSpeed : float;
	
	var forwardSkidValue : float;
	var sidewaysSkidValue : float;
	
	WheelCol = Wheel.getWheelCollider();

	if (!disableWheelVisuals && WheelCol.GetGroundHit(Hit))
		{
		// Almacenar fuerza en el punto de contacto
		
		wheelData.suspensionStress = Hit.force - wheelData.lastSuspensionForce;
		wheelData.lastSuspensionForce = Hit.force;
		
		// Calcular la velocidad en el punto de contacto.
		// Si el contacto es con otro objeto movil (rigidbody) se calcula la velocidad relativa a ese objeto.
		
		wheelData.wheelVelocity = rigidbody.GetPointVelocity(Hit.point);
		if (Hit.collider.attachedRigidbody)
			wheelData.wheelVelocity -= Hit.collider.attachedRigidbody.GetPointVelocity(Hit.point);

		// Traducir la velocidad a la dirección de la rueda. Quedará la velocidad longitudinal en z y la lateral en x.
		
		wheelData.groundSpeed = Pivot.transform.InverseTransformDirection(wheelData.wheelVelocity);
		wheelData.groundSpeed.y = 0.0;

		// Obtener los límites de fricción y ajustar los parámetros si es necesario
			
		var frictionPeak = Wheel.getForwardPeakSlip();
		var frictionMax = Wheel.getForwardMaxSlip();
		
		var MotorSlip = Wheel.motorInput;
		var BrakeSlip = Wheel.brakeInput;
		
		// Giro de marcha de las ruedas.

		var TorqueSlip = Mathf.Abs(MotorSlip) - Mathf.Max(BrakeSlip); //, HandbrakeInput * frictionMax);
				
		if (TorqueSlip >= 0)	// Acelerando
			{
			Skid = TorqueSlip -	frictionPeak;
			if (Skid > 0)
				{
				wheelSpeed = Mathf.Abs(wheelData.groundSpeed.z) + Skid;
				
				if (MotorSlip < 0)	// Acelerando marcha atrás
					wheelSpeed = -wheelSpeed;
				}
			else
				wheelSpeed = wheelData.groundSpeed.z;
			}
		else	// Frenando. Hit.forwardSlip >= 0 sería hacia adelante, <0 hacia atrás, pero no hace falta tenerlo en cuenta.
			{
			Skid = Mathf.InverseLerp(frictionMax, frictionPeak, -TorqueSlip);			
			wheelSpeed = wheelData.groundSpeed.z * Skid;
			}
			
		if (m_Car.serviceMode)
			wheelSpeed = RpmToMs(WheelCol.rpm, WheelCol.radius * Wheel.transform.lossyScale.y);
			
		wheelData.angularVelocity = wheelSpeed / (WheelCol.radius * Wheel.transform.lossyScale.y);		
		
		// Determinar si hace falta controlar las marcas de las ruedas en el suelo.
		// - Si no se están poniendo marcas ahora mismo en esa rueda, se comprobará cada frame si hay que ponerlas.
		// - Si se están poniendo marcas ahora mismo, se esperará al siguiente intervalo fixed para ver si hay que poner más.
		//
		// Se ponen sólo en el terreno que NO tenga material físico (se asume que ese es material sólido).
		
		// NOTA: Todo ésto, o la mayor parte, debería ir en un script en Skidmarks / skidsmoke, para poder indicar settings globales (ej. zona roja para smoke) y coger los parámetros adecuados del propio objeto (ej. propiedades del emisor de partículas)
		
		if (wheelData.lastSkidmark != -1 && wheelData.skidmarkTime < Time.fixedDeltaTime)
			wheelData.skidmarkTime += Time.deltaTime;
		else
			{
			// Determinar las propiedades de la superficie de contacto
			
			var isHardSurface = IsHardSurface(Hit.collider);
			var isStaticSurface = IsStaticSurface(Hit.collider);
			
			// ------------------
			// Marcas de las ruedas
			// ------------------
			
			deltaT = wheelData.skidmarkTime;
			if (deltaT == 0.0) deltaT = Time.deltaTime;
			wheelData.skidmarkTime = 0.0;
			
			forwardSkidValue = Mathf.InverseLerp(forwardSkidmarksBegin, forwardSkidmarksBegin+forwardSkidmarksRange, Mathf.Abs(Wheel.getForwardSlipRatio()));			
			sidewaysSkidValue = Mathf.InverseLerp(sidewaysSkidmarksBegin, sidewaysSkidmarksBegin+sidewaysSkidmarksRange, Mathf.Abs(Wheel.getSidewaysSlipRatio()));
			wheelData.skidValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
			
			// Caso particular: al frenar bloqueando la rueda usar el skidvalue correspondiente a la velocidad del frenado
			
			var skidmarksLock = Mathf.Min(forwardSkidmarksBegin, 2.0);			
			if (TorqueSlip < 0 && Mathf.Abs(Wheel.getForwardSlipRatio()) >= skidmarksLock)
				{				
				forwardSkidValue = Mathf.InverseLerp(forwardSkidmarksBegin, forwardSkidmarksBegin+forwardSkidmarksRange, Mathf.Abs(wheelData.groundSpeed.z + skidmarksLock));
				wheelData.skidValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
				}
				
			// Se asigna un valor de derrape "sonoro" en superficies "duras" (asfalto, otro vehículo, otro objeto sólido...)
			// Las marcas sólo aparecen sobre elementos estáticos
				
			if (isHardSurface)
				{
				var downForceRatio = Mathf.Clamp01(Hit.force / WheelCol.suspensionSpring.spring);
				wheelData.skidValue *= downForceRatio;
				
				var thisSkidMark = wheelData.skidValue;
				
				if (alwaysDrawSkidmarks && wheelData.groundSpeed.magnitude > 0.01)
					thisSkidMark = downForceRatio;
				
				if (thisSkidMark > 0.0)
					{
					if (isStaticSurface && m_skidmarks)
						{
						wheelData.lastSkidmark = m_skidmarks.AddSkidMark(Hit.point + wheelData.wheelVelocity * deltaT + transform.right * wheelData.skidmarkOffset,
																					Hit.normal,
																					thisSkidMark,
																					skidmarksWidth,
																					wheelData.lastSkidmark);
						}
					else
						wheelData.lastSkidmark = -1;
					}
				else
					wheelData.lastSkidmark = -1;				
				}
			else
				{
				wheelData.skidValue = -Mathf.Max(Mathf.Abs(wheelData.angularVelocity) * WheelCol.radius * Wheel.transform.lossyScale.y, wheelData.groundSpeed.magnitude);
				wheelData.lastSkidmark = -1;
				}
			
			// ------------------
			// Humo
			// ------------------
			
			// Determinar si hace falta echar humo en las marcas de las ruedas. Sólo en superficies duras, asfalto u otro objeto sólido.

			if (isHardSurface)
				{
				forwardSkidValue = Mathf.InverseLerp(forwardSmokeBegin, forwardSmokeBegin+forwardSmokeRange, Mathf.Abs(Wheel.getForwardSlipRatio()));
				sidewaysSkidValue = Mathf.InverseLerp(sidewaysSmokeBegin, sidewaysSmokeBegin+sidewaysSmokeRange, Mathf.Abs(Wheel.getSidewaysSlipRatio())) * Wheel.getDriftFactor();
				}
			else
				{
				forwardSkidValue = 0.0;
				sidewaysSkidValue = 0.0;
				}
				
			var skidSmokeValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
			var smokeIntensity = wheelData.skidSmokeIntensity;

			// Casos particulares
			// - Permitir empezar con máxima intensidad directa en los derrapes laterales (sin tener que esperar por los tiempos)
			
			if (sidewaysSkidValue > 0.0 && smokeIntensity < sidewaysSkidValue*smokePeakTime) smokeIntensity = sidewaysSkidValue*smokePeakTime;
				
			// - Al frenar bloqueando la rueda usar el skidvalue correspondiente a la velocidad del frenado. Comenzar a emitir inmediatamente desde el inicio de la intensidad.
				
			var smokeLock = Mathf.Min(forwardSmokeBegin, 2.0);
			
			if (isHardSurface && TorqueSlip < 0 && Mathf.Abs(Wheel.getForwardSlipRatio()) >= smokeLock)
				{				
				forwardSkidValue = Mathf.InverseLerp(forwardSmokeBegin, forwardSmokeBegin+forwardSmokeRange, Mathf.Abs(wheelData.groundSpeed.z + smokeLock));
				skidSmokeValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
				if (smokeIntensity < smokeStartTime)
					smokeIntensity = smokeStartTime;
				}

			// Aumentar o disminuir la intensidad del humo en función del derrape
			
			if (skidSmokeValue > 0.0)
				smokeIntensity += deltaT;
			else
				smokeIntensity -= deltaT;
				
			if (smokeIntensity >= smokeMaxTime) smokeIntensity = smokeMaxTime;
			else if (smokeIntensity < 0.0) smokeIntensity = 0.0;				
							
			skidSmokeValue *= Mathf.InverseLerp(smokeStartTime, smokePeakTime, smokeIntensity);			
			var smokePos = Hit.point + transform.up * WheelCol.radius * Wheel.transform.lossyScale.y * 0.5 + transform.right * wheelData.skidmarkOffset;
			
			if (skidSmokeValue > 0.0 && m_skidSmoke)
				{
				var emission : float = Random.Range(m_skidSmoke.minEmission, m_skidSmoke.maxEmission);
				var lastParticleCount : float = wheelData.skidSmokeTime * emission;
				var currentParticleCount : float = Time.time * emission;
				var numParticles : int = Mathf.CeilToInt(currentParticleCount) - Mathf.CeilToInt(lastParticleCount);
				var lastParticle : int = Mathf.CeilToInt(lastParticleCount);				
				
				var Vel = WheelCol.transform.TransformDirection(m_skidSmoke.localVelocity) + m_skidSmoke.worldVelocity;
				Vel += Pivot.forward * (wheelData.groundSpeed.z - wheelSpeed) * 0.125;
				Vel += wheelData.wheelVelocity * m_skidSmoke.emitterVelocityScale;
					
				for (var i = 0; i < numParticles; i++)
					{
					var particleTime : float = Mathf.InverseLerp(lastParticleCount, currentParticleCount, lastParticle + i);
					var PosRnd = Vector3(Random.Range(-0.3, 0.3), Random.Range(-0.2, 0.2), Random.Range(-0.2, 0.2));
					var VelRnd = Vector3(Random.Range(-m_skidSmoke.rndVelocity.x, m_skidSmoke.rndVelocity.x), Random.Range(-m_skidSmoke.rndVelocity.y, m_skidSmoke.rndVelocity.y), Random.Range(-m_skidSmoke.rndVelocity.z, m_skidSmoke.rndVelocity.z));
					var Size = Random.Range(m_skidSmoke.minSize, m_skidSmoke.maxSize);
					var Energy = Random.Range(m_skidSmoke.minEnergy, m_skidSmoke.maxEnergy);		
					var Rotation = m_skidSmoke.rndRotation? Random.value * 360 : 0;
					var RotVel = m_skidSmoke.angularVelocity + Random.Range(-m_skidSmoke.rndAngularVelocity, m_skidSmoke.rndAngularVelocity);
					
					m_skidSmoke.Emit(Vector3.Lerp(wheelData.skidSmokePos, smokePos, particleTime) + PosRnd, Vel + VelRnd, Size*1, Energy*skidSmokeValue, Color(1,1,1,1), Rotation, RotVel);
					}				
				}
			
			wheelData.skidSmokeTime = Time.time;
			wheelData.skidSmokePos = smokePos;
			wheelData.skidSmokeIntensity = smokeIntensity;
			}
		}
	else
		{
		wheelData.angularVelocity = WheelCol.rpm * 6 * Mathf.Deg2Rad;  // rpm/60 = revs/sec;  revs/sec * 360 = grados/sec;  360/60 = 6	
		
		wheelData.suspensionStress = 0.0 - wheelData.lastSuspensionForce;
		wheelData.lastSuspensionForce = 0.0;
		
		wheelData.skidValue = 0.0;
		wheelData.lastSkidmark = -1;
		wheelData.skidSmokeTime = Time.time;
		wheelData.skidSmokePos = Wheel.transform.position - Wheel.transform.up * ((WheelCol.suspensionDistance + WheelCol.radius * 0.5) * Wheel.transform.lossyScale.y) + transform.right * wheelData.skidmarkOffset;
		wheelData.skidSmokeIntensity -= Time.deltaTime;
		}
	
	Graphic.Rotate(wheelData.angularVelocity * Mathf.Rad2Deg * Time.deltaTime, 0.0, 0.0);
	}


// Ajustar la posición de la rueda respecto al suelo

function DoWheelPosition(Wheel : CarWheel, WheelMesh : Transform, steerAngle : float, wheelData : WheelVisualData)
	{
	var hitPoint : Vector3;
	var grounded = false;

	var WheelCol : WheelCollider = Wheel.getWheelCollider();
	
	if (!disableRaycast)
		{
		var HitR : RaycastHit;	

		if (Physics.Raycast(Wheel.transform.position, -Wheel.transform.up, HitR, (WheelCol.suspensionDistance + WheelCol.radius) * Wheel.transform.lossyScale.y))
			{
			hitPoint = HitR.point + Wheel.transform.up * (WheelCol.radius * Wheel.transform.lossyScale.y - wheelGroundedBias) + transform.right * wheelData.colliderOffset;
			grounded = true;
			}
		}
	else
		{
		var HitW : WheelHit;
		
		if (WheelCol.GetGroundHit(HitW))
			{
			//hitPoint = Wheel.transform.position + Wheel.transform.up * (Wheel.transform.InverseTransformPoint(HitW.point).y + WheelCol.radius * Wheel.transform.lossyScale.y - wheelGroundedBias) + transform.right * wheelData.colliderOffset;   This is as slow as the Raycast
			hitPoint = HitW.point + Wheel.transform.up * (WheelCol.radius * Wheel.transform.lossyScale.y - wheelGroundedBias) + transform.right * wheelData.colliderOffset;
			grounded = true;
			}
		}
	
	if (grounded)
		WheelMesh.position = hitPoint;
	else
		WheelMesh.position = Wheel.transform.position - Wheel.transform.up * (WheelCol.suspensionDistance * Wheel.transform.lossyScale.y + wheelGroundedBias) + transform.right * wheelData.colliderOffset;
	
	WheelMesh.localEulerAngles.y = Wheel.transform.localEulerAngles.y + steerAngle;
	WheelMesh.localEulerAngles.z = Wheel.transform.localEulerAngles.z;
	}


// Conversión RPM - m/s

function RpmToMs(Rpm : float, Radius : float) : float
	{
	return Mathf.PI * Radius * Rpm / 30.0;
	}

function MsToRpm(Ms : float, Radius : float) : float
	{
	return 30.0 * Ms / (Mathf.PI * Radius);
	}	


//=================================================================================================
//
// Detection and proceesing of the impacts.
// To be used by CarDamage (mesh deform) and CarSound (sound effects)
//
// Contacts are classified as impacts or drags. Impacts are publicly exposed for one frame at a 
// specified time intervals. Drag values are permanently exposed and updated.
// The dependent scripts can apply their corresponding action according the values available each frame.
//
//=================================================================================================


private var m_sumImpactCount = 0;
private var m_sumImpactCountSoft = 0;
private var m_sumImpactPosition = Vector3.zero;
private var m_sumImpactVelocity = Vector3.zero;

private var m_lastImpactTime = 0.0;


// Impact processing. Each given interval the values are exposed for one frame.

private function ProcessImpacts()
	{
	// Lossy verification with immediate response:
	//  - if intervals are lost we do not try to catch up them. Impacts are being accumulated so we simply use the latest available values.
	//  - if last impact happened enough time ago, the next impact is processed immediately.
	
	var bCanProcessCollisions = Time.time-m_lastImpactTime >= impactInterval;
	
	// Process impact events. They must be exposed for a single frame, then dropped.
	
	if (bCanProcessCollisions && m_sumImpactCount > 0)
		{
		localImpactPosition = m_sumImpactPosition / m_sumImpactCount;
		localImpactVelocity = m_sumImpactVelocity;
		localImpactSoftSurface = m_sumImpactCountSoft > m_sumImpactCount/2;
		
		localDragPositionDiscrete = localDragPosition;
		localDragVelocityDiscrete = localDragVelocity;
		
		m_sumImpactCount = 0;
		m_sumImpactCountSoft = 0;
		m_sumImpactPosition = Vector3.zero;
		m_sumImpactVelocity = Vector3.zero;
		
		m_lastImpactTime = Time.time + impactInterval * Random.Range(-impactIntervalRandom, impactIntervalRandom);	// Add a random variation for avoiding regularities
		}
	else
		{
		localImpactPosition = Vector3.zero;
		localImpactVelocity = Vector3.zero;
		
		localDragVelocityDiscrete = Vector3.zero;
		}

	//if (localImpactVelocity.sqrMagnitude > 0.001)
	//	Debug.DrawLine(transform.TransformPoint(localImpactPosition), transform.TransformPoint(localImpactPosition) + Lin2Log(transform.TransformDirection(localImpactVelocity)), Color.red, 0.05, false);
	}
	

// Drag processing
// The values come from OnCollisionEnter/Stay so the actual drag value is updated accordingly.
//
// This function is invoked from both OnCollision (increase the drag value) and Update 
// (smoothly decrease the value to zero).
	
private function ProcessDrags(dragPosition : Vector3, dragVelocity : Vector3, dragSoftSurface : boolean)
	{
	if (dragVelocity.sqrMagnitude > 0.001)
		{	
		localDragPosition = Vector3.Lerp(localDragPosition, dragPosition, 10.0 * Time.deltaTime);
		localDragVelocity = Vector3.Lerp(localDragVelocity, dragVelocity, 20.0 * Time.deltaTime);
		localDragSoftSurface = dragSoftSurface;
		}
	else
		{
		localDragVelocity = Vector3.Lerp(localDragVelocity, Vector3.zero, 10.0 * Time.deltaTime);
		}
		
	//if (localDragVelocity.sqrMagnitude > 0.001)
	//	Debug.DrawLine(transform.TransformPoint(localDragPosition), transform.TransformPoint(localDragPosition) + Lin2Log(transform.TransformDirection(localDragVelocity)), Color.cyan, 0.05, false);
	}


// Convert all contacts of a single collision into a single impact and/or a single drag value.
// The result will be accumulated at the sum* variables.

private function ProcessContacts (col : Collision, forceImpact : boolean)
	{
	var colImpactCount = 0;						// All impacts
	var colImpactCountSoft = 0;					// Impacts on soft surface
	var colImpactPosition = Vector3.zero;
	var colImpactVelocity = Vector3.zero;
	
	var colDragCount = 0;
	var colDragCountSoft = 0;
	var colDragPosition = Vector3.zero;
	var colDragVelocity = Vector3.zero;
	
	var sqrImpactSpeed = impactMinSpeed*impactMinSpeed;
	
	// We cannot rely on the OnCollisionEnter/Stay/Exit thing: 
	// wheels are also colliders so most collisions will be reported as OnCollisionStay. 
	// We process each contact point individually and get a single impact and/or a single drag amount.
	
    for (var contact : ContactPoint in col.contacts)
		{
		// For some reason, thisCollider and otherCollider seems to appear arbitrarily swapped.
		// We must ensure they're correct or we would get a wrong velocity at the contact point.
		// Also "other" may be null sometimes (don't ask me, I just work here), so if they aren't exchanged the null will fall at "this".
		
		var thisCol = contact.thisCollider;
		var otherCol = contact.otherCollider;
		
		if (thisCol == null || thisCol.attachedRigidbody != rigidbody)
			{
			thisCol = contact.otherCollider;
			otherCol = contact.thisCollider;
			}
		
		if (typeof(thisCol) != WheelCollider && typeof(otherCol) != WheelCollider)
			{
			// Calculate the velocity of the body in the contact point with respect to the colliding object
			
			var V = rigidbody.GetPointVelocity(contact.point);
			if (otherCol && otherCol.attachedRigidbody)
				V -= otherCol.attachedRigidbody.GetPointVelocity(contact.point);
				
			var dragRatio = Vector3.Dot(V, contact.normal);
			
			// Determine whether this contact is an impact or a drag
			
			if (dragRatio < -impactThreeshold || forceImpact && col.relativeVelocity.sqrMagnitude > sqrImpactSpeed)
				{
				// Impact
				
				colImpactCount++;
				colImpactPosition += contact.point;
				colImpactVelocity += col.relativeVelocity;				
				if (otherCol && !IsHardSurface(otherCol)) colImpactCountSoft++;
				
				// Debug.DrawLine(contact.point, contact.point + Lin2Log(V), Color.red, 0.05, false);
				}
			else if (dragRatio < impactThreeshold)
				{
				// Drag
				
				colDragCount++;
				colDragPosition += contact.point;
				colDragVelocity += V;
				if (otherCol && !IsHardSurface(otherCol)) colDragCountSoft++;

				// Debug.DrawLine(contact.point, contact.point + Lin2Log(V), Color.cyan, 0.05, false);
				}
			
			//Debug.DrawLine(contact.point, contact.point + Lin2Log(V), Color.Lerp(Color.cyan, Color.red, Mathf.Abs(dragRatio)), 0.05, false);
			//Debug.DrawLine(contact.point, contact.point + contact.normal*0.5, Color.green, 0.05, false);
			}
		}
		
	// Accumulate impact values received.
		
	if (colImpactCount > 0)
		{
		colImpactPosition /= colImpactCount;
		colImpactVelocity /= colImpactCount;
		
		m_sumImpactCount++;
		m_sumImpactPosition += transform.InverseTransformPoint(colImpactPosition);
		m_sumImpactVelocity += transform.InverseTransformDirection(colImpactVelocity);
		if (colImpactCountSoft > colImpactCount/2) m_sumImpactCountSoft++;
		}
		
	// Update the current drag value
		
	if (colDragCount > 0)
		{
		colDragPosition /= colDragCount;
		colDragVelocity /= colDragCount;

		ProcessDrags(transform.InverseTransformPoint(colDragPosition), transform.InverseTransformDirection(colDragVelocity), colDragCountSoft > colDragCount/2);
		
		//Debug.DrawLine(colDragPosition, colDragPosition + Lin2Log(colDragVelocity), Color.cyan, 0.05, false);
		}
	}
	
	
function OnCollisionEnter(collision : Collision)
	{
	ProcessContacts(collision, true);
	}
	
	
function OnCollisionStay(collision : Collision)
	{
	ProcessContacts(collision, false);
	}
	
	
// Debug	
	
static function Lin2Log(value : float) : float
	{
	return Mathf.Log(Mathf.Abs(value)+1) * Mathf.Sign(value);	
	}

static function Lin2Log(value : Vector3) : Vector3
	{
	return Vector3.ClampMagnitude(value, Lin2Log(value.magnitude));
	}
		

	
















