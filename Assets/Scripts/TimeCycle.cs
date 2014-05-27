using UnityEngine;
using System.Collections;

[AddComponentMenu("Environment/Time Cycle")]
public class TimeCycle : MonoBehaviour
{
    public float dayCycleInMinutes;
    private float dayCycleInSeconds;
    public float startTimeMilitary;

    private Light sun;

    private const float SECOND = 1;
    private const float MINUTE = 60 * SECOND;
    private const float HOUR = 60 * MINUTE;
    private const float DAY = 24 * HOUR;
    private const float DEGREES_PER_SECOND = 360 / DAY;

    private float degreeRotation;
    private float timeOfDay;



    private void Start()
    {
        sun = transform.FindChild("Sun").light;

        timeOfDay = 0;
        degreeRotation = DEGREES_PER_SECOND * DAY / (dayCycleInMinutes * MINUTE);
        dayCycleInSeconds = dayCycleInMinutes * MINUTE;
    }
    private void Update()
    {
        sun.transform.Rotate(new Vector3(degreeRotation,0,0) * Time.deltaTime);



        timeOfDay += Time.deltaTime;

        if (timeOfDay > dayCycleInSeconds)
            timeOfDay -= dayCycleInSeconds;



        UpdateSkybox();
    }

    private void UpdateSkybox()
    {
        float temp = timeOfDay / dayCycleInSeconds * 2;



        if (temp > 1)
            temp = 1 - (temp - 1);



        RenderSettings.skybox.SetFloat("_Blend", temp);
        Debug.Log(temp);
    }
}