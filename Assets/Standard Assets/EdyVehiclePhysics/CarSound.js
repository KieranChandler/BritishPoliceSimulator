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
// CarSound
//
// Configures and controls all the sounds and effects for the vehicle. 
// Data is gathered from CarVisuals and CarSettings scripts.
//
//========================================================================================================================

#pragma strict  

var EngineAudio : AudioSource;			// Main audio loop for the engine, based on the RPM

var engineIdleRPM = 600.0;
var engineGearDownRPM = 3000.0;			// GearDown - GearUp define the range for each gear. 
var engineGearUpRPM = 5000.0;			// Adjust GearDown - GearUp together with transmissionRatio and gearCount to get a proper gear distribution along the speed range of the vehicle.
var engineMaxRPM = 6000.0;

var gearCount = 5;
var transmissionRatio = 13.6;

var engineGearUpSpeed = 5.0;			// How fast are the gear shift transitions. Small values can be used to emulate true automated transmissions.
var engineGearDownSpeed = 20.0;

var engineAudioIdlePitch = 0.6;			// Pitch settings for the engine audio source
var engineAudioMaxPitch = 3.5;
var engineAudioIdleVolume = 0.4;		// Volume settings for the engine audio source
var engineAudioMaxVolume = 0.55;

var EngineExtraAudio : AudioSource;		// Customizable extra audio loop for the engine at certain range of the RPM

var engineExtraMinRPM = 4000.0;			// Customizable additional engine audio (i.e. turbo)
var engineExtraMaxRPM = 5600.0;
var engineExtraMinPitch = 0.8;
var engineExtraMaxPitch = 1.5;
var engineExtraMinVolume = 0.1;
var engineExtraMaxVolume = 1.0;

var TransmissionAudio : AudioSource;	// Audio loop based on the transmission, depends on the longitudinal speed of the vehicle.

var transmissionMinRPM = 4000.0;		// Customizable transmision audio (road rumble, single-geared engine sound, ...)
var transmissionMaxRPM = 12000.0;
var transmissionMinPitch = 0.5;
var transmissionMaxPitch = 1.6;
var transmissionMinVolume = 0.1;
var transmissionMaxVolume = 0.8;

var VelocityAudio : AudioSource;		// Audio loop based on the velocity of the vehicle, regardless engine or transmission (ej. wind effects)

var velocityMin = 3.0;					// Velocity-based audio (wind)
var velocityMax = 30.0;					// m/s
var velocityMinPitch = 0.5;
var velocityMaxPitch = 1.0;
var velocityMinVolume = 0.0;
var velocityMaxVolume = 0.4;

var SkidAudio : AudioSource;			// Audio loop for skidding tires / burnouts

var skidMin = 0.2;						// Skid audio
var skidMax = 1.0;						// Min, Max: wheels skidding. 0.0 = no wheels skidding, 1.0 = one wheel skidding full (or 4 wheels skidding 25% each), 4.0 = four wheels skidding full
var skidMaxVolume = 1.0;
var skidMinPitch = 1.0;
var skidMaxPitch = 0.9;

var OffroadAudio : AudioSource;			// Audio loop for wheels rolling offroad

var offroadSilent = 0.02;				// Offroad audio
var offroadMin = 1.0;					// m/s 
var offroadMax = 10.0;
var offroadMinPitch = 0.3;
var offroadMaxPitch = 1.5;
var offroadMinVolume = 0.3;
var offroadMaxVolume = 0.8;

var WheelBumpAudio : AudioClip;			// "bump" impacts at wheels due to suspension stress. AudioClip, will be played as "one shot" when needed.

var bumpMinForce = 4000.0;				// Newtons, delta value at the suspension
var bumpMaxForce = 18000.0;
var bumpMinVolume = 0.2;
var bumpMaxVolume = 0.6;

var BodyDragAudio : AudioSource;			// Audio loop for the bodywork being dragged over hard surfaces (also played offroad if no BodyDragOffroadAudio is present)
var BodyDragOffroadAudio : AudioSource;		// Audio loop for the bodywork being dragged over offroad surfaces only

var dragSilent = 0.01;						// m/s
var dragMin = 2.0;							
var dragMax = 20.0;
var dragMinPitch = 0.9;
var dragMaxPitch = 1.0;
var dragMinVolume = 0.9;
var dragMaxVolume = 1.0;

var BodyImpactAudio : AudioClip;			// Audio clip for body impacts over hard surfaces (also played offroad if no BodyImpactOffroadAudio is present)
var BodyImpactOffroadAudio : AudioClip;		// Audio clip for body impacts over offroad surfaces only

var impactMin = 0.1;						// m/s
var impactMax = 10.0;
var impactMinPitch = 0.3;
var impactMaxPitch = 0.6;
var impactRandomPitch = 0.1;
var impactMinVolume = 0.8;
var impactMaxVolume = 1.0;
var impactRandomVolume = 0.1;


var BodyScratchAudio : AudioClip;			// Audio clip for random body scratch effects against hard surfaces

var scratchMin = 2.0;						// m/s
var scratchRandom = 0.02;
var scratchInterval = 0.2;
var scratchMinPitch = 0.7;
var scratchMaxPitch = 1.1;
var scratchMinVolume = 0.9;
var scratchMaxVolume = 1.0;


private var m_lastScratchTime = 0.0;


var currentGear : int = 0;				// No configuration here - just for debugging purposes on the inspector.
var transmissionRPM = 0.0;

var engineRPM = 0.0;
var skidValue = 0.0;
var offroadValue = 0.0;


private var m_CarVisuals : CarVisuals;
private var m_CarSettings : CarSettings;
private var m_lastGear : int = 0;
private var m_engineDamp : float;


function OnEnable ()
	{
	// Retrieve the components which will be used later for gathering the vehicle's settings and the speed at each wheel.
	
	m_CarVisuals = GetComponent(CarVisuals) as CarVisuals;
	m_CarSettings = GetComponent(CarSettings) as CarSettings;
	
	// Parameter constraints and settings
	
	if (gearCount < 2) gearCount = 2;
	
	m_engineDamp = engineGearUpSpeed;
	}


function Update()
	{
	var averageWheelRate : float;
	
	// Retrieve the average wheel spin rate of the drive wheels
	
	switch (m_CarSettings.tractionAxle)
		{
		case 0: averageWheelRate = (m_CarVisuals.spinRateFL + m_CarVisuals.spinRateFR) * 0.5; break;	// Front drive
		case 1: averageWheelRate = (m_CarVisuals.spinRateRL + m_CarVisuals.spinRateRR) * 0.5; break;	// Rear drive
		default: 																						// Full 4x4 drive
			averageWheelRate = (m_CarVisuals.spinRateFL + m_CarVisuals.spinRateFR + m_CarVisuals.spinRateRL + m_CarVisuals.spinRateRR) * 0.25;
		}
	
	// Get the RPM at the output of the gearbox. spinRate is rads/s, need RPM.

	transmissionRPM = averageWheelRate * Mathf.Rad2Deg / 6.0;			// 6.0 = 360.0 / 60.0
	transmissionRPM *= transmissionRatio;
	
	// Calculate the engine RPM according to three possible states:
	// - Stopped
	// - Moving forward. The top gear can increase the sound pitch until its limit
	// - Reverse. Single gear, sound pitch is increased until its limit
	
	var updatedEngineRPM : float;
	
	if (Mathf.Abs(averageWheelRate) < 1.0)
		{
		currentGear = 0;
		updatedEngineRPM = engineIdleRPM + Mathf.Abs(transmissionRPM);
		}
	else
	if (transmissionRPM >= 0)
		{
		// First gear goes from idle to gearUp
		
		var firstGear = engineGearUpRPM - engineIdleRPM;	
		
		if (transmissionRPM < firstGear)
			{
			currentGear = 1;
			updatedEngineRPM = transmissionRPM + engineIdleRPM;
			}
		else
			{
			// Second gear and above go from gearDown to gearUp
				
			var gearWidth = engineGearUpRPM - engineGearDownRPM;
			
			currentGear = 2 + (transmissionRPM - firstGear) / gearWidth;
			
			if (currentGear > gearCount)
				{
				currentGear = gearCount;
				updatedEngineRPM = transmissionRPM - firstGear - (gearCount-2) * gearWidth + engineGearDownRPM;
				}
			else
				updatedEngineRPM = Mathf.Repeat(transmissionRPM - firstGear, gearWidth) + engineGearDownRPM;
			}
		}
	else
		{
		// Reverse gear
		
		currentGear = -1;
		updatedEngineRPM = Mathf.Abs(transmissionRPM) + engineIdleRPM;
		}
		
	updatedEngineRPM = Mathf.Clamp(updatedEngineRPM, 10.0, engineMaxRPM);	

	// Calculate engine damp according to latest shift up or shift down
	
	if (currentGear != m_lastGear)
		{
		m_engineDamp = currentGear > m_lastGear? engineGearUpSpeed : engineGearDownSpeed;
		m_lastGear = currentGear;
		}
	
	// Final engine RPM
	
	engineRPM = Mathf.Lerp(engineRPM, updatedEngineRPM, m_engineDamp * Time.deltaTime);
	
	// Engine audio pitch and volume according to the configured range and engine RPM
	
	if (EngineAudio)
		ProcessContinuousAudio(EngineAudio, engineRPM, engineIdleRPM, engineMaxRPM, engineAudioIdlePitch, engineAudioMaxPitch, engineAudioIdleVolume, engineAudioMaxVolume);
		
	// Extra engine audio
	
	if (EngineExtraAudio)
		ProcessContinuousAudio(EngineExtraAudio, engineRPM, engineExtraMinRPM, engineExtraMaxRPM, engineExtraMinPitch, engineExtraMaxPitch, engineExtraMinVolume, engineExtraMaxVolume);
		
	// Transmission audio
	
	if (TransmissionAudio)
		ProcessContinuousAudio(TransmissionAudio, Mathf.Abs(transmissionRPM), transmissionMinRPM, transmissionMaxRPM, transmissionMinPitch, transmissionMaxPitch, transmissionMinVolume, transmissionMaxVolume);

	// Velocity audio
	
	if (VelocityAudio)
		ProcessContinuousAudio(VelocityAudio, rigidbody.velocity.magnitude, velocityMin, velocityMax, velocityMinPitch, velocityMaxPitch, velocityMinVolume, velocityMaxVolume);

	// Skid values from CarVisuals:
	//   > 0 = skidding over asphalt / hard surfaces. we use the sum of all wheels (a single wheel skidding to the top causes maximum skid)
	//   < 0 = rolling / skidding over offroad surfaces. we use the average value of all wheels.
		
	var asphaltSkid = 0.0;
	var offroadSkid = 0.0;
	var offroadWheels = 0;
	
	if (m_CarVisuals.skidValueFL >= 0.0) asphaltSkid += m_CarVisuals.skidValueFL; else { offroadSkid -= m_CarVisuals.skidValueFL; offroadWheels++; }
	if (m_CarVisuals.skidValueFR >= 0.0) asphaltSkid += m_CarVisuals.skidValueFR; else { offroadSkid -= m_CarVisuals.skidValueFR; offroadWheels++; }
	if (m_CarVisuals.skidValueRL >= 0.0) asphaltSkid += m_CarVisuals.skidValueRL; else { offroadSkid -= m_CarVisuals.skidValueRL; offroadWheels++; }
	if (m_CarVisuals.skidValueRR >= 0.0) asphaltSkid += m_CarVisuals.skidValueRR; else { offroadSkid -= m_CarVisuals.skidValueRR; offroadWheels++; }
		
	if (offroadWheels > 1) offroadSkid /= offroadWheels;
		
	// Skid audio
	
	skidValue = Mathf.Lerp(skidValue, asphaltSkid, 40.0 * Time.deltaTime);
	if (SkidAudio)
		ProcessContinuousAudio(SkidAudio, skidValue, skidMin, skidMax, skidMinPitch, skidMaxPitch, 0.0, skidMaxVolume);
		
	// Offroad audio
	
	offroadValue = Mathf.Lerp(offroadValue, offroadSkid, 20.0 * Time.deltaTime);
	if (OffroadAudio)
		{
		ProcessSpeedBasedAudio(OffroadAudio, offroadValue, offroadSilent, offroadMin, offroadMax, 0.0, offroadMinPitch, offroadMaxPitch, offroadMinVolume, offroadMaxVolume);
		}
		
	// Wheel bumps
	
	if (WheelBumpAudio)
		{
		ProcessWheelBumpAudio(m_CarVisuals.suspensionStressFL, m_CarVisuals.PivotFL);
		ProcessWheelBumpAudio(m_CarVisuals.suspensionStressFR, m_CarVisuals.PivotFR);
		ProcessWheelBumpAudio(m_CarVisuals.suspensionStressRL, m_CarVisuals.PivotRL);
		ProcessWheelBumpAudio(m_CarVisuals.suspensionStressRR, m_CarVisuals.PivotRR);
		}
		
	// Body drag audio
	
	var dragSpeed = m_CarVisuals.localDragVelocity.magnitude;
	
	if (BodyDragAudio)
		ProcessSpeedBasedAudio(BodyDragAudio, !m_CarVisuals.localDragSoftSurface || !BodyDragOffroadAudio? dragSpeed : 0.0, dragSilent, dragMin, dragMax, dragMinPitch, dragMinPitch, dragMaxPitch, dragMinVolume, dragMaxVolume);

	if (BodyDragOffroadAudio)
		ProcessSpeedBasedAudio(BodyDragOffroadAudio, m_CarVisuals.localDragSoftSurface? dragSpeed : 0.0, dragSilent, dragMin, dragMax, dragMinPitch, dragMinPitch, dragMaxPitch, dragMinVolume, dragMaxVolume);
		
	// Body impacts audio
	
	var impactSpeed = m_CarVisuals.localImpactVelocity.magnitude;
	
	if (BodyImpactAudio || BodyImpactOffroadAudio)
		{		
		if (impactSpeed > impactMin)
			{
			var impactRatio = Mathf.InverseLerp(impactMin, impactMax, impactSpeed);
			var clip : AudioClip;
			
			if (BodyImpactAudio && (!m_CarVisuals.localImpactSoftSurface || !BodyImpactOffroadAudio))
				clip = BodyImpactAudio;
			else
			if (m_CarVisuals.localImpactSoftSurface)
				clip = BodyImpactOffroadAudio;
				
			if (clip)
				PlayOneTime(clip, transform.TransformPoint(m_CarVisuals.localImpactPosition), Mathf.Lerp(impactMinVolume, impactMaxVolume, impactRatio)+Random.Range(-impactRandomVolume, impactRandomVolume), Mathf.Lerp(impactMinPitch, impactMaxPitch, impactRatio)+Random.Range(-impactRandomPitch, impactRandomPitch));
			}
		}
		
	// Random body scratch on drags
		
	if (BodyScratchAudio)
		{
		if (dragSpeed > scratchMin && !m_CarVisuals.localDragSoftSurface && Random.value < scratchRandom && Time.time-m_lastScratchTime > scratchInterval)
			{
			PlayOneTime(BodyScratchAudio, transform.TransformPoint(m_CarVisuals.localDragPosition), Random.Range(scratchMinVolume, scratchMaxVolume), Random.Range(scratchMinPitch, scratchMaxPitch));
			m_lastScratchTime = Time.time;
			}
		}
	}
	
	
private function ProcessContinuousAudio(Audio : AudioSource, audioValue : float, audioMin : float, audioMax : float, minPitch : float, maxPitch : float, minVolume : float, maxVolume : float)
	{
	var audioRatio = Mathf.InverseLerp(audioMin, audioMax, audioValue);
	
	Audio.pitch = Mathf.Lerp(minPitch, maxPitch, audioRatio);
	Audio.volume = Mathf.Lerp(minVolume, maxVolume, audioRatio);
	
	if (!Audio.isPlaying) Audio.Play();
	Audio.loop = true;
	}	


private function ProcessSpeedBasedAudio(Audio : AudioSource, audioValue : float, audioSilent : float, audioMin : float, audioMax : float, silentPitch : float, minPitch : float, maxPitch : float, minVolume : float, maxVolume : float)
	{
	if (audioValue < audioSilent)
		{
		if (Audio.isPlaying) Audio.Stop();
		}
	else
		{
		if (audioValue < audioMin)
			{
			var audioRatio = Mathf.InverseLerp(audioSilent, audioMin, audioValue);
			
			Audio.pitch = Mathf.Lerp(silentPitch, minPitch, audioRatio);
			Audio.volume = Mathf.Lerp(0.0, minVolume, audioRatio);
			}
		else
			{
			audioRatio = Mathf.InverseLerp(audioMin, audioMax, audioValue);
			
			Audio.pitch = Mathf.Lerp(minPitch, maxPitch, audioRatio);
			Audio.volume = Mathf.Lerp(minVolume, maxVolume, audioRatio);
			}
			
		if (!Audio.isPlaying) Audio.Play();
		Audio.loop = true;
		}
	}
	
	
private function ProcessWheelBumpAudio(suspensionStress : float, suspensionPoint : Transform)
	{
	var bumpRatio = Mathf.InverseLerp(bumpMinForce, bumpMaxForce, suspensionStress);
	if (bumpRatio > 0.0) PlayOneTime(WheelBumpAudio, suspensionPoint.position, Mathf.Lerp(bumpMinVolume, bumpMaxVolume, bumpRatio));
	}

		
function PlayOneTime (clip : AudioClip, position : Vector3, volume : float) 
	{
	PlayOneTime(clip, position, volume, 1.0);
	}
	

function PlayOneTime (clip : AudioClip, position : Vector3, volume : float, pitch : float) 
	{
	if (clip == null) return;
	
    var go = new GameObject("One shot audio");
	go.transform.parent = transform;
    go.transform.position = position;
    var source : AudioSource = go.AddComponent (AudioSource);
    source.clip = clip;
    source.volume = volume;
	source.pitch = pitch;
    source.Play ();
    Destroy (go, clip.length);
	}

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	