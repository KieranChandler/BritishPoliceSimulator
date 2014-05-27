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
// CarTest
//
// Framework for retrieving the internal data from the WheelCollider component. 
// Development only. No useful functions for games.
//
//========================================================================================================================

#pragma strict  
import System.Collections.Generic;	// List

var StartPoint : Transform;
var SideTestVelocity = 20.0;
var PauseOnTest = false;
var RecordValues = false;
var WriteFile = false;
var StopRecordAt1 = false;
var ServiceMode = false;
var FreezeRotation = false;
var Style = new GUIStyle();


private var m_CarMain : CarMain;

private var m_Car : CarControl = null;
private var m_Wheel : WheelCollider;

private var m_lastSpeed = 0.0;
private var m_lastSpeedLat = 0.0;

private var m_speed = 0.0;
private var m_accel = 0.0;
private var m_speedLat = 0.0;
private var m_accelLat = 0.0;

private var m_maxSpeed = 0.0;
private var m_maxAccel = 0.0;
private var m_maxSpeedLat = 0.0;
private var m_maxAccelLat = 0.0;

private var m_forwardSlope = 0.0;
private var m_sidewaysSlope = 0.0;
private var m_forceRatio = 0.0;
private var m_sidewaysFrictionPeak = Vector2(1.0, 1.0);
private var m_sidewaysFrictionMax = Vector2(1.0, 1.0);

private var m_sDescription : String;


private var m_bRecording = false;
private var m_recValues = new List.<float>();
private var m_slip10Value : float = 0.0;

private var m_Graph : GUICanvas;
private var m_bShowGraph = false;


private function RestartValues()
	{
	m_lastSpeed = 0.0;
	m_lastSpeedLat = 0.0;

	m_maxSpeed = 0.0;
	m_maxAccel = 0.0;
	m_maxSpeedLat = 0.0;
	m_maxAccelLat = 0.0;
	}


private function CreateGraph(rangeX : float, rangeY : float)
	{
	m_Graph = new GUICanvas(512, 256, rangeX, rangeY);
	m_Graph.SetAlpha(0.7);
	m_Graph.Clear(Color.black);
	m_Graph.Grid(1, 2, Color(0,0.2,0));
	
	for (var i=10; i<rangeY; i+=10)
		m_Graph.LineH(i, Color(0,0.5,0));
		
	m_Graph.Save();	
	}
	
/*	
private function CreateTestGraph1()
	{
	CreateGraph(3, 18);
	
	var Friction = new CarFrictionCurve();
	var Coefs = CarWheelFriction.MCforward;
	
	Friction.grip = 1000;
	Friction.gripRange = 1;
	Friction.drift = 0;
	Friction.driftSlope = 0;
	
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.drift = 20;  
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.drift = 50;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.drift = 100;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.drift = 200;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.drift = 500;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	
	m_Graph.Save();	
	}
	
private function CreateTestGraph2()
	{
	CreateGraph(7, 25);
	
	var Friction = new CarFrictionCurve();
	var Coefs = CarWheelFriction.MCforward;
	
	Friction.grip = 1000;
	Friction.gripRange = 1;
	Friction.drift = 100;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 2;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 3;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 4;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 5;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	
	m_Graph.Save();	
	}
	
	
private function CreateTestGraph2a()
	{
	CreateGraph(8, 30);
	
	var Friction = new CarFrictionCurve();
	var Coefs = CarWheelFriction.MCforward;
	
	Friction.grip = 1000;
	Friction.gripRange = 1;
	Friction.drift = 0;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 3;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 5;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.gripRange = 7;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	
	m_Graph.Save();	
	}
	
	
private function CreateTestGraph3()
	{
	CreateGraph(4, 30);
	
	var Friction = new CarFrictionCurve();
	var Coefs = CarWheelFriction.MCforward;
	
	Friction.grip = 1000;
	Friction.gripRange = 2;
	Friction.drift = 100;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.grip = 1000;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.grip = 2000;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	Friction.grip = 2500;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	
	m_Graph.Save();	
	}
	
	
private function CreateTestGraph4()
	{
	CreateGraph(2, 20);
	
	var Friction = new CarFrictionCurve();
	var Coefs = CarWheelFriction.MCforward;
	
	Friction.grip = 500;
	Friction.gripRange = 1;
	Friction.drift = 0;
	Friction.driftSlope = CarWheelFriction.GetValue(Coefs, Friction.drift, 1.0+Friction.gripRange) / (1.0+Friction.gripRange);
	
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	CarWheelFriction.DrawScaledFrictionCurve(m_Graph, Coefs, Friction, 0.5, Color.gray);
	Friction.grip = 1000;
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	CarWheelFriction.DrawScaledFrictionCurve(m_Graph, Coefs, Friction, 0.5, Color.gray);
	Friction.grip = 1500;	
	CarWheelFriction.DrawFrictionCurve(m_Graph, Coefs, Friction, Color.gray);
	CarWheelFriction.DrawScaledFrictionCurve(m_Graph, Coefs, Friction, 0.5, Color.gray);	
	
	m_Graph.Save();	
	}
	
	

function CreateTestGraph()
	{
	CreateTestGraph4();
	}
*/
	
	

function Start ()
	{
	m_CarMain = GetComponent(CarMain) as CarMain;
	
	CreateGraph(SideTestVelocity, m_sidewaysFrictionPeak.y*1.5);
	}


function Update ()
	{
	if (Input.GetKeyDown(KeyCode.Alpha8))
		{
		// Detener y posicionar el vehículo en el punto de partida
		
		m_Car.rigidbody.AddForce(-m_Car.rigidbody.velocity, ForceMode.VelocityChange);
		m_Car.rigidbody.AddTorque(-m_Car.rigidbody.angularVelocity, ForceMode.VelocityChange);
		m_Car.rigidbody.MovePosition(StartPoint.position);
		m_Car.rigidbody.MoveRotation(StartPoint.rotation);
		
		// Detener grabación
		
		StopRecording();
		
		// Reiniciar los valores máximos

		RestartValues();
		}

	if (Input.GetKeyDown(KeyCode.Alpha9))
		{
		m_Car.rigidbody.AddForce(SideTestVelocity * m_Car.transform.right, ForceMode.VelocityChange);
		if (PauseOnTest) Debug.Break();
		
		// Iniciar grabación
		
		if (RecordValues) StartRecording();
		}
		
	if (Input.GetKeyDown(KeyCode.Alpha0))
		StopRecording();
		
		
	if (Input.GetKeyDown(KeyCode.KeypadPlus))
		m_Car.motorMax += 0.1;		
		//m_Car.SidewaysWheelFriction.grip += 100;
		//m_Car.ForwardWheelFriction.grip += 100;
	if (Input.GetKeyDown(KeyCode.KeypadMinus))
		m_Car.motorMax -= 0.1;
		//m_Car.SidewaysWheelFriction.grip -= 100;
		//m_Car.ForwardWheelFriction.grip -= 100;
		
	if (Input.GetKeyDown(KeyCode.KeypadMultiply))
		m_Car.brakeMax += 0.1;
	if (Input.GetKeyDown(KeyCode.KeypadDivide))
		m_Car.brakeMax -= 0.1;
		
	// Regenerar el gráfico de los valores y mostrarlo
	// Al regenerarlo coge los nuevos valores, si hay.
		
	if (Input.GetKeyDown(KeyCode.Alpha7))
		{
		if (!m_bShowGraph)
			{
			CreateGraph(SideTestVelocity, m_sidewaysFrictionPeak.y*1.5);
			//CreateTestGraph();
			UpdateGraph();
			}
		
		m_bShowGraph = !m_bShowGraph;		
		}
	}
	
	
private function UpdateGraph()
	{
	m_Graph.Restore();
	
	if (m_recValues.Count > 0)
		{
		m_Graph.Line(Vector2(0, m_sidewaysFrictionPeak.y), m_sidewaysFrictionPeak, Color.gray);
		m_Graph.LineV(m_sidewaysFrictionPeak.x, Color.gray);		
		//m_Graph.Line(Vector2(m_Graph.CanvasWidth(), m_sidewaysFrictionMax.y), m_sidewaysFrictionMax, Color.gray);
		m_Graph.LineV(m_sidewaysFrictionMax.x, Color.gray);
		
		CarWheelFriction.DrawFrictionCurve(m_Graph, CarWheelFriction.MCsideways, m_Car.SidewaysWheelFriction, Color.gray);
		m_Graph.LineGraph(m_recValues as float[], 3);
		}
	}

private function SetServiceMode(Car : CarControl, serviceMode : boolean, freezeRotation : boolean)
	{
	Car.serviceMode = serviceMode;
	Car.WheelFL.serviceMode = serviceMode;
	Car.WheelFR.serviceMode = serviceMode;
	Car.WheelRL.serviceMode = serviceMode;
	Car.WheelRR.serviceMode = serviceMode;
	
	var Settings : CarSettings = Car.GetComponent(CarSettings) as CarSettings;
	if (Settings)
		Settings.serviceMode = ServiceMode;
	
	Car.rigidbody.freezeRotation = freezeRotation;
	}
	
	
function OnDisable ()
	{
	if (m_Car) SetServiceMode(m_Car, false, false);
	}
	
	
function FixedUpdate ()
	{
	// Detectar cambios en el coche actual y reiniciar datos
	
	var ActiveCar = m_CarMain.getSelectedCar();	
	if (m_Car != ActiveCar)
		{
		if (m_Car) SetServiceMode(m_Car, false, false);
			
		StopRecording();
		RestartValues();
		
		m_Car = ActiveCar;		
		m_Wheel = m_Car.WheelRL.getWheelCollider();
		}

	m_sidewaysFrictionPeak = m_Car.WheelRL.getSidewaysPeak();
	m_sidewaysFrictionMax = m_Car.WheelRL.getSidewaysMax();
	SetServiceMode(m_Car, ServiceMode, FreezeRotation);
		
	// Calcular velocidades y aceleraciones

	m_speed = Mathf.Abs(Vector3.Dot(m_Car.rigidbody.velocity, m_Car.transform.forward));
	m_accel = Mathf.Abs((m_speed-m_lastSpeed) / Time.deltaTime);
	m_speedLat = Mathf.Abs(Vector3.Dot(m_Car.rigidbody.velocity, m_Car.transform.right));
	m_accelLat = Mathf.Abs((m_speedLat-m_lastSpeedLat) / Time.deltaTime);
	
	if (m_speed > m_maxSpeed) m_maxSpeed = m_speed;
	if (m_accel > m_maxAccel) m_maxAccel = m_accel;
	if (m_speedLat > m_maxSpeedLat) m_maxSpeedLat = m_speedLat;
	if (m_accelLat > m_maxAccelLat) m_maxAccelLat = m_accelLat;	
	
	var showAccel = m_accel < 0.1? 0.0 : m_accel;
	var showMaxAccel = m_maxAccel < 0.1? 0.0 : m_maxAccel;
	
	m_forwardSlope = 0.0;
	m_sidewaysSlope = 0.0;
	m_forceRatio = 0.0;
	
	// Calcular deslizamientos para obtener pendientes longitudinales y laterales en la rueda indicada
	
	var Hit : WheelHit;
	var bGrounded = false;
	if (m_Wheel.GetGroundHit(Hit))
		{
		if (Mathf.Abs(Hit.forwardSlip) > 0.01) m_forwardSlope = m_accel / Mathf.Abs(Hit.forwardSlip);
		if (Mathf.Abs(Hit.sidewaysSlip) > 0.01) m_sidewaysSlope = m_accelLat / Mathf.Abs(Hit.sidewaysSlip);
		bGrounded = true;
		
		m_forceRatio = Mathf.Clamp01(Hit.force / m_Wheel.suspensionSpring.spring);
		}
		
	// Componer strings
	
	m_sDescription = String.Format("Spd:{0,5:0.00} m/s  Acc:{1,6:0.000} m/s2  Slp:{2,6:0.000}\nLat:{3,5:0.00} m/s  Acc:{4,6:0.000} m/s2  Slp:{5,6:0.000}\n",
						m_speed, m_accel, m_forwardSlope, m_speedLat, m_accelLat, m_sidewaysSlope);

	m_sDescription += String.Format("Speed:{0,6:0.0} km/h {1,5:0.0} mph\nAccel:{2,4:0.0} s(0-100km/h) {3,4:0.0} s(0-60mph)\n",
						m_speed*3.6, m_speed*2.237, (100/3.6)/showAccel, (60/2.237)/showAccel);
						
	// m_sDescription += String.Format("Ratio:{0,5:0.00}  AccRelative:{1,5:0.00}\n", m_forceRatio, m_accel/m_forceRatio);

	m_sDescription += String.Format("\nPredicted sideways peak: ({0:0.000}, {1:0.000})\n", m_sidewaysFrictionPeak.x, m_sidewaysFrictionPeak.y);
	
	if (!m_bRecording && m_recValues.Count > 0 && m_slip10Value >= 0.0)
		m_sDescription += String.Format("Magic Curve value: {0:0.000} for slope {1:0.}", m_slip10Value, m_Car.WheelRL.SidewaysWheelFriction.grip);
	
	m_lastSpeed = m_speed;
	m_lastSpeedLat = m_speedLat;
					
	// Grabación
	
	if (m_bRecording)
		{
		var bStopRecord = false;
		
		m_sDescription += String.Format("REC: {0}", m_recValues.Count/3);
		
		if (bGrounded)
			{
			m_recValues.Add(Mathf.Abs(Hit.sidewaysSlip));
			m_recValues.Add(m_accelLat);
			m_recValues.Add(m_sidewaysSlope);
			
			if (m_recValues.Count/3 > 10 && Mathf.Abs(Hit.sidewaysSlip) < 0.1) bStopRecord = true;
			}
			
		if (m_recValues.Count/3 > 1000) bStopRecord = true;
		
		if (m_recValues.Count > 3)
			{
			var i = (m_recValues.Count / 3) - 1;
			
			// Localizar y calcular el valor de slip en 1.0 cuando el slip pasa de más de 1.0 a menos de 1.0;
			
			var x0 = m_recValues[i*3];
			var y0 = m_recValues[i*3+1];
			
			var x1 = m_recValues[(i-1)*3];
			var y1 = m_recValues[(i-1)*3+1];
			
			if (x1 >= 1.0 && x0 < 1.0)
				{
				m_slip10Value = y0 + (y1-y0) / (x1-x0) * (1.0 - x0);
				if (StopRecordAt1) bStopRecord = true;
				}
			}
			
		if (bStopRecord)
			StopRecording();
		}
	}
	
	
function StartRecording ()
	{
	m_slip10Value = -1.0;
	m_recValues.Clear();
	m_bRecording = true;		
	}
	
	
function StopRecording ()
	{
	if (!m_bRecording) return;
	
	// Finalizar grabación y guardar datos
	
	m_bRecording = false;
	
	// Eliminar los valores de slip neutros al inicio y al final
	
	if (m_recValues.Count < 3) return;	
	while (m_recValues[0] <= 0.01 || m_recValues[0] > SideTestVelocity)
		m_recValues.RemoveRange(0, 3);
		
	if (m_recValues.Count < 3) return;
	while (m_recValues[((m_recValues.Count/3)-1)*3] <= 0.01 || m_recValues[((m_recValues.Count/3)-1)*3] > SideTestVelocity)
		m_recValues.RemoveRange(((m_recValues.Count/3)-1)*3, 3);
		
	// Actualizar el gráfico si está visible
	
	if (m_bShowGraph)
		{
		CreateGraph(SideTestVelocity, m_sidewaysFrictionPeak.y*1.5);
		UpdateGraph();
		}
		
	// Volcar los datos
	
	if (WriteFile)
		{	
		var sw : System.IO.StreamWriter = new System.IO.StreamWriter("Telemetry.txt"); 

		if (m_slip10Value >= 0.0)
			{
			sw.WriteLine(String.Format("Total values: {0}", m_recValues.Count/3));
			sw.WriteLine(String.Format("Slip at 1.0: {0:0.000}", m_slip10Value));
			}
			
		for (var i=0; i<m_recValues.Count/3; i++)
			sw.WriteLine(String.Format("{0:0.000}\t{1:0.000}\t{2:0.000}", m_recValues[i*3], m_recValues[i*3+1], m_recValues[i*3+2]));
	
		sw.Close();
		}
	}


function OnGUI ()
	{
	GUI.Box(Rect (8, 230, 325, 125), "Speed - Acceleration");
	GUI.Label (Rect (16, 258, 340, 200), m_sDescription, Style);
	
	if (m_bShowGraph)
		m_Graph.GUIDraw(450, 8);
	}












