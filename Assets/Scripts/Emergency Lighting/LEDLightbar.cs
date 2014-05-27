#pragma warning disable 0618

using UnityEngine;
using System.Collections;

public static class TwoTwoOneOneStrobe
{
    static public Tick[] frontPriTicks = new Tick[]
    {
        new Tick(1, 1, 0, 0, 0.05f), 
        new Tick(0, 0, 0, 0, 0.05f), 
        new Tick(1, 1, 0, 0, 0.05f), 
        new Tick(0, 0, 0, 0, 2.0f), 

        new Tick(0, 0, 1, 1, 0.05f), 
        new Tick(0, 0, 0, 0, 0.05f), 
        new Tick(0, 0, 1, 1, 0.05f), 
        new Tick(0, 0, 0, 0, 2.0f), 

        new Tick(1, 1, 0, 0, 0.05f), 
        new Tick(0, 0, 0, 0, 2.0f), 

        new Tick(0, 0, 1, 1, 0.05f), 
        new Tick(0, 0, 0, 0, 5.0f), 
    };


    static public Tick[] rearPriTicks = new Tick[]
    {
        new Tick(1, 1, 0, 0, 0.5f), 
        new Tick(0, 0, 0, 0, 0.5f), 
        new Tick(1, 1, 0, 0, 0.5f), 
        new Tick(0, 0, 0, 0, 2.0f), 

        new Tick(0, 0, 1, 1, 0.5f), 
        new Tick(0, 0, 0, 0, 0.5f), 
        new Tick(0, 0, 1, 1, 0.5f), 
        new Tick(0, 0, 0, 0, 2.0f), 

        new Tick(1, 1, 0, 0, 0.5f), 
        new Tick(0, 0, 0, 0, 2.0f), 

        new Tick(0, 0, 1, 1, 0.5f), 
        new Tick(0, 0, 0, 0, 5.0f), 
    };


    static public Tick[] secTicks = new Tick[]
    {
        new Tick(1, 1, 0, 0, 0.5f), 
        new Tick(0, 0, 0, 0, 0.5f), 
        new Tick(1, 1, 0, 0, 0.5f), 
        new Tick(0, 0, 0, 0, 1.0f), 

        new Tick(0, 0, 1, 1, 0.5f), 
        new Tick(0, 0, 0, 0, 0.5f), 
        new Tick(0, 0, 1, 1, 0.5f), 
        new Tick(0, 0, 0, 0, 1.0f), 
    };
}

[AddComponentMenu("Vehicles/Emergency Lighting/LED Lightbar")]
public class LEDLightbar : Lightbar
{
    public float delay;
    public bool frontPriFlashing;
    public bool rearPriFlashing;
    public bool secFlashing;

    public GameObject frontPrimary1;
    public GameObject frontPrimary2;
    public GameObject frontPrimary3;
    public GameObject frontPrimary4;
    public GameObject rearPrimary1;
    public GameObject rearPrimary2;
    public GameObject rearPrimary3;
    public GameObject rearPrimary4;
    public GameObject sec1;
    public GameObject sec2;
    public GameObject sec3;
    public GameObject sec4;

    public Tick[] frontPriTicks = TwoTwoOneOneStrobe.frontPriTicks;
    public Tick[] rearPriTicks = TwoTwoOneOneStrobe.rearPriTicks;
    public Tick[] secTicks = TwoTwoOneOneStrobe.secTicks;

    private int frontPriTick;
    private int rearPriTick;
    private int secTick;

    private void Awake()
    {
        LightbarAwake();

        SetFrontPri(0, 0, 0, 0);
        SetRearPri(0, 0, 0, 0);
        SetSec(0, 0, 0, 0);

        frontPriTicks = new Tick[]
        {
            new Tick(1, 1, 0, 0, 0.15f), 
            new Tick(0, 0, 0, 0, 0.15f), 
            new Tick(1, 1, 0, 0, 0.15f), 
            new Tick(0, 0, 0, 0, 2.0f), 

            new Tick(0, 0, 1, 1, 0.15f), 
            new Tick(0, 0, 0, 0, 0.15f), 
            new Tick(0, 0, 1, 1, 0.15f), 
            new Tick(0, 0, 0, 0, 2.0f), 

            new Tick(1, 1, 0, 0, 0.15f), 
            new Tick(0, 0, 0, 0, 2.0f), 

            new Tick(0, 0, 1, 1, 0.15f), 
            new Tick(0, 0, 0, 0, 5.0f)
        };

        rearPriTicks = new Tick[]
        {
            new Tick(1, 1, 0, 0, 0.15f), 
            new Tick(0, 0, 0, 0, 0.15f), 
            new Tick(1, 1, 0, 0, 0.15f), 
            new Tick(0, 0, 0, 0, 2.0f), 

            new Tick(0, 0, 1, 1, 0.15f), 
            new Tick(0, 0, 0, 0, 0.15f), 
            new Tick(0, 0, 1, 1, 0.15f), 
            new Tick(0, 0, 0, 0, 2.0f), 

            new Tick(1, 1, 0, 0, 0.15f), 
            new Tick(0, 0, 0, 0, 2.0f), 

            new Tick(0, 0, 1, 1, 0.15f), 
            new Tick(0, 0, 0, 0, 5.0f)
        };

        secTicks = new Tick[]
        {
            new Tick(1, 1, 0, 0, 0.5f), 
            new Tick(0, 0, 0, 0, 0.5f), 
            new Tick(1, 1, 0, 0, 0.5f), 
            new Tick(0, 0, 0, 0, 1.0f), 

            new Tick(0, 0, 1, 1, 0.5f), 
            new Tick(0, 0, 0, 0, 0.5f), 
            new Tick(0, 0, 1, 1, 0.5f), 
            new Tick(0, 0, 0, 0, 1.0f), 
        };
    }
    private void Update()
    {
        LightbarUpdate();

        if (panelEnabled)
        {
            if (Input.GetKeyUp(KeyCode.Insert))
            {
                frontPriEnabled = !frontPriEnabled;
                audio.PlayOneShot(beepSound);
            }
            if (Input.GetKeyUp(KeyCode.Delete))
            {
                rearPriEnabled = !rearPriEnabled;
                audio.PlayOneShot(beepSound);
            }
            else if (Input.GetKeyUp(KeyCode.Home))
            {
                audio.PlayOneShot(beepSound);
                hlEnabled = !hlEnabled;
            }
            else if (Input.GetKeyUp(KeyCode.End))
            {
                audio.PlayOneShot(beepSound);
                secEnabled = !secEnabled;
            }
            else if (Input.GetKeyUp(KeyCode.PageUp))
            {
                audio.PlayOneShot(beepSound);
                sirenIndex = 0;
                sirenEnabled = !sirenEnabled;
            }
            else if (Input.GetKeyUp(KeyCode.PageDown))
            {
                audio.PlayOneShot(beepSound);
                frontPriEnabled = false;
                rearPriEnabled = true;
                secEnabled = true;
                hlEnabled = false;
                sirenEnabled = false;
            }
        }

        //Enable or disable Front Primaries
        if(frontPriEnabled)
        {
            if (!frontPriFlashing)
                StartCoroutine("FrontPriTick");
        }
        else
        {
            frontPriTick = 0;
            SetFrontPri(0, 0, 0, 0);
        }

        //Enable or disable Rear Primaries
        if (rearPriEnabled)
        {
            if (!rearPriFlashing)
                StartCoroutine("RearPriTick");
        }
        else
        {
            rearPriTick = 0;
            SetRearPri(0, 0, 0, 0);
        }

        //Enable or disable Secondaries
        if (secEnabled)
        {
            if (!secFlashing)
                StartCoroutine("SecTick");
        }
        else
        {
            secTick = 0;
            SetSec(0, 0, 0, 0);
        }
    }
    private void OnGUI()
    {
        if (panelEnabled)
        {
            if (GUI.Button(new Rect(boxPos.x + spacing.x, boxPos.y + spacing.y, buttonSize.x, buttonSize.y), "Front \nBlues"))
            {
                frontPriEnabled = !frontPriEnabled;
                audioSource.PlayOneShot(beepSound);
            }
            if (GUI.Button(new Rect(boxPos.x + spacing.x, boxPos.y + spacing.y * 2, buttonSize.x, buttonSize.y), "Rear \nBlues"))
            {
                rearPriEnabled = !rearPriEnabled;
                audioSource.PlayOneShot(beepSound);
            }
            if (GUI.Button(new Rect(boxPos.x + spacing.x * 2, boxPos.y + spacing.y, buttonSize.x, buttonSize.y), "Headlights \nFlash"))
            {
                audioSource.PlayOneShot(beepSound);
                hlEnabled = !hlEnabled;
            }
            if (GUI.Button(new Rect(boxPos.x + spacing.x * 2, boxPos.y + spacing.y * 2, buttonSize.x, buttonSize.y), "Rear \nReds"))
            {
                audioSource.PlayOneShot(beepSound);
                secEnabled = !secEnabled;
            }
            if (GUI.Button(new Rect(boxPos.x + spacing.x * 3, boxPos.y + spacing.y, buttonSize.x, buttonSize.y), "Siren"))
            {
                audioSource.PlayOneShot(beepSound);
                sirenEnabled = !sirenEnabled;
            }
            if (GUI.Button(new Rect(boxPos.x + spacing.x * 3, boxPos.y + spacing.y * 2, buttonSize.x, buttonSize.y), "Arrival"))
            {
                audioSource.PlayOneShot(beepSound);
                frontPriEnabled = false;
                rearPriEnabled = true;
                secEnabled = true;
                hlEnabled = false;
                sirenEnabled = false;
            }
        }
    }

    private IEnumerator FrontPriTick()
    {
        frontPriFlashing = true;

        if(frontPriTick < frontPriTicks.Length)
        {
            //Enable or disable all emmisive dummies
            SetFrontPri(frontPriTicks[frontPriTick].pri1, 
                        frontPriTicks[frontPriTick].pri2, 
                        frontPriTicks[frontPriTick].pri3, 
                        frontPriTicks[frontPriTick].pri4);

            //Wait for current tick's delay
            yield return new WaitForSeconds(frontPriTicks[frontPriTick].delay * delay);

            frontPriTick++;
        }

        //Reset tick timer
        if (frontPriTick >= frontPriTicks.Length)
            frontPriTick = 0;

        frontPriFlashing = false;
    }
    private IEnumerator RearPriTick()
    {
        rearPriFlashing = true;

        if (rearPriTick < rearPriTicks.Length)
        {
            //Enable or disable all emmisive dummies
            SetRearPri(rearPriTicks[rearPriTick].pri1,
                        rearPriTicks[rearPriTick].pri2,
                        rearPriTicks[rearPriTick].pri3,
                        rearPriTicks[rearPriTick].pri4);

            //Wait for current tick's delay
            yield return new WaitForSeconds(rearPriTicks[rearPriTick].delay * delay);

            rearPriTick++;
        }

        //Reset tick timer
        if (rearPriTick >= rearPriTicks.Length)
            rearPriTick = 0;

        rearPriFlashing = false;
    }
    private IEnumerator SecTick()
    {
        secFlashing = true;

        if (secTick < secTicks.Length)
        {
            //Enable or disable all emmisive dummies
            SetSec(secTicks[secTick].pri1,
                        secTicks[secTick].pri2,
                        secTicks[secTick].pri3,
                        secTicks[secTick].pri4);

            //Wait for current tick's delay
            yield return new WaitForSeconds(secTicks[secTick].delay * delay);

            secTick++;
        }

        //Reset tick timer
        if (secTick >= secTicks.Length)
            secTick = 0;

        secFlashing = false;
    }

    public void SetFrontPri(int pri1, int pri2, int pri3, int pri4)
    {
        if (frontPrimary1)
            frontPrimary1.SetActive(IntToBool(pri1));
        if (frontPrimary2)
            frontPrimary2.SetActive(IntToBool(pri2));
        if (frontPrimary3)
            frontPrimary3.SetActive(IntToBool(pri3));
        if (frontPrimary4)
            frontPrimary4.SetActive(IntToBool(pri4));
    }
    public void SetRearPri(int pri1, int pri2, int pri3, int pri4)
    {
        if (rearPrimary1)
            rearPrimary1.SetActive(IntToBool(pri1));
        if (rearPrimary2)
            rearPrimary2.SetActive(IntToBool(pri2));
        if (rearPrimary3)
            rearPrimary3.SetActive(IntToBool(pri3));
        if (rearPrimary4)
            rearPrimary4.SetActive(IntToBool(pri4));
    }
    public void SetSec(int s1, int s2, int s3, int s4)
    {
        if (sec1)
            sec1.SetActive(IntToBool(s1));
        if (sec2)
            sec2.SetActive(IntToBool(s2));
        if (sec3)
            sec3.SetActive(IntToBool(s3));
        if (sec4)
            sec4.SetActive(IntToBool(s4));
    }

    public bool IntToBool(int i)
    {
        if (i == 1)
            return true;
        else
            return false;
    }
}