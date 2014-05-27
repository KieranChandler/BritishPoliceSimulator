using UnityEngine;
using System.Collections;

public class RespawnBarrier : MonoBehaviour
{
    private void OnCollisionEnter(Collision hit)
    {
        Debug.Log(hit.collider.gameObject.name);
        BroadcastMessage("DestroyAIVehicle");
    }
}