#pragma warning disable 0618

using UnityEngine;
using System.Collections;

[System.Serializable]
public class Tick
{
	public int pri1, pri2, pri3, pri4;
	public float delay;

	public Tick(int p1, int p2, int p3, int p4, float d)
	{
		pri1 = p1;
		pri2 = p2;
		pri3 = p3;
		pri4 = p4;
		delay = d;
	}
};

public enum LightbarType
{
    LED = 0,
    Strobe = 1, 
	Spin = 2
};

[AddComponentMenu("Vehicles/Emergency Lighting/Lightbar Base (Do Not Use)")]
[RequireComponent(typeof(AudioSource))]
public class Lightbar : MonoBehaviour
{
    public bool panelEnabled;

    public bool frontPriEnabled;
    public bool rearPriEnabled;
	public bool secEnabled;
	public bool hlEnabled;
    public bool leftAlleyEnabled;
    public bool rightAlleyEnabled;

    //GUI Settings
	public AudioSource audioSource;
	public AudioClip beepSound;
	public Vector2 boxPos = new Vector2(-50, 400);
	public Vector2 spacing = new Vector2(80, 60);
	public Vector2 buttonSize = new Vector2(75, 55);

    //Siren Settings
    public bool sirenEnabled;
    public int sirenIndex;
    public AudioClip[] sirens;

	[HideInInspector]
	public GameObject myVehicle;

	public void LightbarAwake()
	{
		audioSource.clip = sirens[0];
		audioSource.loop = true;
	}
    public void LightbarUpdate()
	{
        //Toggle Siren
		if(sirenEnabled)
		{
			if(!audioSource.isPlaying)
				audioSource.Play();

			if(audioSource.clip != sirens[sirenIndex])
				audioSource.clip = sirens[sirenIndex];
		} else
		{
			if(audioSource.isPlaying)
				audioSource.Stop();
		}

        //Cycle Sirens
        if (Input.GetKeyDown(KeyCode.Tab))
        {
            if (sirenIndex < 2)
                sirenIndex++;
            else
                sirenIndex = 0;
        }
	}

	public void TogglePanel()
	{
		panelEnabled = !panelEnabled;
	}
}