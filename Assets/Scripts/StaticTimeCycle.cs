using UnityEngine;
using System.Collections;

public enum TimeOfDay
{
	Morning = 0,
	Noon    = 1,
	Evening = 2,
	Night   = 3
};

[System.Serializable]
public class TimeSet
{
	public Material skybox;

	public float sunIntensity = 0.75f;
	public Color SunColor = Color.white;
	public Vector3 sunAngle;

	public Color ambientLightingColor = Color.white;

	public bool enableFog;
	public Color fogColor;
	public FogMode fogMode;
	public float fogDensity;
	public float linearFogStart;
	public float linearFogEnd;
}

[AddComponentMenu("Environment/Static Time Cycle")]
public class StaticTimeCycle : MonoBehaviour
{
	public TimeOfDay currentTime;
	public float updateFreq;

	public TimeSet morning;
	public TimeSet noon;
	public TimeSet evening;
	public TimeSet night;

	private float lastUpdateTime;
	private Light sun;

    public float timeOfDay;

	private void Start()
	{
		sun = transform.FindChild("Sun").light;
        //skydome = GameObject.FindWithTag("Skydome");
	}
    private void Update()
	{
		// If time to update, Update Unity's settings
		if (Mathf.Abs(Time.time - lastUpdateTime) >= Mathf.Abs(updateFreq))
		{
			if (currentTime == TimeOfDay.Morning)
				UpdateStuff(morning);
			else if (currentTime == TimeOfDay.Noon)
				UpdateStuff(noon);
			else if (currentTime == TimeOfDay.Evening)
				UpdateStuff(evening);
			else if (currentTime == TimeOfDay.Night)
				UpdateStuff(night);


			// Store current time as last update time
			lastUpdateTime = Time.time;
		}

        timeOfDay += 20*Time.deltaTime;
	}
    private void OnGUI()
    {
        //time = GUILayout.HorizontalSlider(time, 0, 12);
    }

	private void UpdateStuff(TimeSet currentTimeSet)
	{
		//Update Skybox
        RenderSettings.skybox = currentTimeSet.skybox;



		//Update Sun Light
		sun.intensity           = currentTimeSet.sunIntensity;
		sun.color               = currentTimeSet.SunColor;
		sun.transform.rotation  = Quaternion.Euler(currentTimeSet.sunAngle);

		sun.GetComponent<LensFlare>().brightness= currentTimeSet.sunIntensity;



		//Update Ambient Lighting
		RenderSettings.ambientLight = currentTimeSet.ambientLightingColor;



		// Update Fog
		RenderSettings.fog              = currentTimeSet.enableFog;
		RenderSettings.fogColor         = currentTimeSet.fogColor;
		RenderSettings.fogMode          = currentTimeSet.fogMode;
		RenderSettings.fogDensity       = currentTimeSet.fogDensity;
		RenderSettings.fogStartDistance = currentTimeSet.linearFogStart;
		RenderSettings.fogEndDistance   = currentTimeSet.linearFogEnd;
	}
    private void UpdateSkydome(TimeSet currentTimeSet)
    {
        //Material skydomeMaterial = skydome.GetComponent<MeshRenderer>().material;
    }
}