using UnityEngine;
using System.Collections;
[AddComponentMenu("Vehicles/Vehicle")]
public class Vehicle : MonoBehaviour
{
    public bool isPlayerOccupied;

    public CarControl carControl;
    public Lightbar lightbar;

    public bool headLightsEnabled;
    public int indicatorsEnabled; public bool indicatorsFlashing; public float indicatorFlashDelay;
    public bool brakeLightsEnabled;
    public bool reverseLightsEnabled;

    [HideInInspector]
    public GameObject[] headLights;
    [HideInInspector]
    public GameObject[] tailLights;
    [HideInInspector]
    public GameObject[] indicators;
    [HideInInspector]
    public GameObject[] brakeLights;
    [HideInInspector]
    public GameObject[] reverseLights;

    public float motorInput;
    public float brakeInput;
    public float steerInput;

    private void Awake()
    {
        carControl = GetComponent<CarControl>();


        headLights = new GameObject[2];
        headLights[0] = transform.FindChild("Light_Head_L").gameObject;
        headLights[1] = transform.FindChild("Light_Head_R").gameObject;

        tailLights = new GameObject[2];
        tailLights[0] = transform.FindChild("Light_Tail_L").gameObject;
        tailLights[1] = transform.FindChild("Light_Tail_R").gameObject;

        indicators = new GameObject[2];
        indicators[0] = transform.FindChild("Light_Indicator_L").gameObject;
        indicators[1] = transform.FindChild("Light_Indicator_R").gameObject;

        brakeLights = new GameObject[2];
        brakeLights[0] = transform.FindChild("Light_Brake_L").gameObject;
        brakeLights[1] = transform.FindChild("Light_Brake_R").gameObject;

        reverseLights = new GameObject[2];
        reverseLights[0] = transform.FindChild("Light_Reverse_L").gameObject;
        reverseLights[1] = transform.FindChild("Light_Reverse_R").gameObject;
    }
    private void Update()
    {
        carControl.steerInput = Mathf.Clamp(Input.GetAxis("Horizontal"), -1, 1);
        carControl.handbrakeInput = Mathf.Clamp01(Input.GetAxis("Jump"));

        if(carControl.getGear() == "D")
        {
            carControl.motorInput = Mathf.Clamp01(Input.GetAxis("Vertical"));
            carControl.brakeInput = Mathf.Clamp01(-Input.GetAxis("Vertical"));
        }
        else if (carControl.getGear() == "N")
        {
            carControl.motorInput = Mathf.Clamp(Input.GetAxis("Vertical"), -1, 1);
            //carControl.brakeInput = Mathf.Clamp01(-Input.GetAxis("Vertical"));
        }
        else if (carControl.getGear() == "R")
        {
            carControl.motorInput = Mathf.Clamp01(-Input.GetAxis("Vertical"));
            carControl.brakeInput = Mathf.Clamp01(Input.GetAxis("Vertical"));
        }


        UpdateLights();
    }
    private void OnGUI()
    {
        GUILayout.Label("Horizontal: " + Input.GetAxis("Horizontal").ToString());
        GUILayout.Label("Vertical: " + Input.GetAxis("Vertical").ToString());
        GUILayout.Label("Toggle Headlights: " + Input.GetAxis("ToggleHeadlights").ToString());
    }

    private void UpdateLights()
    {
        // Update Brake Lights
        if(carControl.brakeInput > 0.1f)
        {
            brakeLightsEnabled = true;
            if (!brakeLights[0].activeSelf)
            {
                brakeLights[0].SetActive(true);
                brakeLights[1].SetActive(true);

                tailLights[0].SetActive(false);
                tailLights[1].SetActive(false);
            }
        } else
        {
            brakeLightsEnabled = false;
            if (brakeLights[0].activeSelf)
            {
                brakeLights[0].SetActive(false);
                brakeLights[1].SetActive(false);

                if(headLightsEnabled)
                {
                    tailLights[0].SetActive(true);
                    tailLights[1].SetActive(true);
                } else
                {
                    tailLights[0].SetActive(false);
                    tailLights[1].SetActive(false);
                }
            }
        }



        // Update Head Lights
        if(Input.GetButtonUp("ToggleHeadlights"))
        {
            ToggleHeadlights();
        }



        // Update Indicators
        if(Input.GetKeyUp(KeyCode.E))
        {
            if (indicatorsEnabled < 1)
                indicatorsEnabled++;
            else
                indicatorsEnabled = 0;
        }
        else if (Input.GetKeyUp(KeyCode.Q))
        {
            if (indicatorsEnabled > -1)
                indicatorsEnabled--;
            else
                indicatorsEnabled = 0;
        }

        if (indicatorsEnabled != 0)
        {
            if (!indicatorsFlashing)
                StartCoroutine("IndicatorFlash");
        }
        else
        {
            indicators[0].SetActive(false);
            indicators[1].SetActive(false);
        }



        // Update Reverse Lights
        if (carControl.getGear() == "R")
        {
            reverseLightsEnabled = true;
            if (!reverseLights[0].activeSelf)
            {
                reverseLights[0].SetActive(true);
                reverseLights[1].SetActive(true);
            }
        }
        else
        {
            reverseLightsEnabled = false;
            if (reverseLights[0].activeSelf)
            {
                reverseLights[0].SetActive(false);
                reverseLights[1].SetActive(false);
            }
        }
    }
    private IEnumerator IndicatorFlash()
    {
        indicatorsFlashing = true;

        if (indicatorsEnabled == -1)
        {
            indicators[0].SetActive(true);
            yield return new WaitForSeconds(indicatorFlashDelay);

            indicators[0].SetActive(false);
            yield return new WaitForSeconds(indicatorFlashDelay);
        }
        else if (indicatorsEnabled == 1)
        {
            indicators[1].SetActive(true);
            yield return new WaitForSeconds(indicatorFlashDelay);

            indicators[1].SetActive(false);
            yield return new WaitForSeconds(indicatorFlashDelay);
        }

        indicatorsFlashing = false;
    }

    public bool ToggleHeadlights()
    {
        headLightsEnabled = !headLightsEnabled;

        headLights[0].SetActive(headLightsEnabled);
        headLights[1].SetActive(headLightsEnabled);

        tailLights[0].SetActive(headLightsEnabled);
        tailLights[1].SetActive(headLightsEnabled);

        return headLightsEnabled;
    }
}