Shader "Layered/Opaque" {
Properties {
_Color ("Main Color", Color) = (1,1,1,1)
_Texture0 ("Texture0 (RGB)", 2D) = "white" {}
_Texture1 ("Texture1 (RGB)", 2D) = "white" {}
_MixValue ("MixValue (Range)",Range(0,1)) = 0.5
}
SubShader {
Cull Back
ZWrite On
ZTest LEqual
Tags {"Queue"="Geometry+0" "IgnoreProjector"="False" "RenderType"="Opaque" }
CGPROGRAM
#pragma surface surf Lambert

float4 _Color;
sampler2D _Texture0;
sampler2D _Texture1;
float _MixValue;

struct Input {
float2 uv_Texture0;
float2 uv_Texture1;
};

void surf (Input IN, inout SurfaceOutput o){
half4 c0=tex2D (_Texture0, IN.uv_Texture0);
half4 c1=tex2D (_Texture1, IN.uv_Texture1);
c0=c0*_MixValue;
c1=c1*(1-_MixValue);
o.Albedo=(c0+c1)*_Color;
}

ENDCG
}
FallBack "Diffuse"
}
