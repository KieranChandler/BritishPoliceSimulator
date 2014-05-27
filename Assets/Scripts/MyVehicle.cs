using UnityEngine;
using System.Collections;

public class MyVehicle : MonoBehaviour
{
    public Lightbar lightbar;
    public bool isPlayerOccupied;

    public CarControl car;

    private void Awake()
    {
        car = GetComponent<CarControl>();
    }
    private void Update()
    {
        car.motorInput = Mathf.Clamp01(Input.GetAxis("Vertical"));
        car.brakeInput = Mathf.Clamp01(-Input.GetAxis("Vertical"));
        car.steerInput = Mathf.Clamp(Input.GetAxis("Horizontal"), -1, 1);
    }
}