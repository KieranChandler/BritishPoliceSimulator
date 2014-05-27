#pragma warning disable 0618

using UnityEngine;
using System.Collections;

[AddComponentMenu("Vehicles/Emergency Lighting/Rotator Lightbar")]
public class RotatorLightbar : Lightbar
{
    public float spinSpeed;
    public Transform[] leftSpinners;
    public Transform[] rightSpinners;

    private void Update()
    {
        if (panelEnabled)
        {
            if (Input.GetKeyUp(KeyCode.Insert))
            {
                frontPriEnabled = !frontPriEnabled;
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


        if (frontPriEnabled)
        {
            for (int i = 0; i < leftSpinners.Length; i++)
            {
                for (int j = 0; j < leftSpinners[i].GetChildCount(); j++)
                {
                    if (!leftSpinners[i].GetChild(j).gameObject.activeSelf)
                    {
                        leftSpinners[i].GetChild(j).gameObject.SetActive(true);
                        rightSpinners[i].GetChild(j).gameObject.SetActive(true);
                    }
                }

                leftSpinners[i].Rotate(0, 0, spinSpeed * Time.deltaTime);
                rightSpinners[i].Rotate(0, 0, spinSpeed * Time.deltaTime);
            }
        }
        else
        {
            if (leftSpinners[0].gameObject.activeSelf || leftSpinners[1].gameObject.activeSelf)
            {
                for (int i = 0; i < leftSpinners.Length; i++)
                {
                    for (int j = 0; j < leftSpinners[i].GetChildCount(); j++)
                    {
                        leftSpinners[i].GetChild(j).gameObject.SetActive(false);
                        rightSpinners[i].GetChild(j).gameObject.SetActive(false);
                    }
                }
            }
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
            //if (GUI.Button(new Rect(boxPos.x + spacing.x, boxPos.y + spacing.y * 2, buttonSize.x, buttonSize.y), "Rear \nBlues"))
            //{
            //    rearPriEnabled = !rearPriEnabled;
            //    audioSource.PlayOneShot(beepSound);
            //}
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
}