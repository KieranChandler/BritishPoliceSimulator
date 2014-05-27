using UnityEngine;
using System.Collections;

public class CarIBL : MonoBehaviour
{
    public int updateFrames;

    public Camera cam;
    public Material IBLMaterial;

    private int lastUpdateFrame;
    public Cubemap cube;

    private void Awake()
    {
        cube = new Cubemap(16, TextureFormat.RGB24, true);
        IBLMaterial.SetTexture("_Cube", cube);
    }
    private void Update()
    {
        if(Time.frameCount - lastUpdateFrame >= updateFrames)
        {
            cam.RenderToCubemap(cube);
            lastUpdateFrame = Time.frameCount;
        }
    }
}