//Based on BuildIn Shaders
//Written 2012 by EyecyArt

Shader "Eyecy/Bumped Specular" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_SpecColor ("Specular Color", Color) = (0.5,0.5,0.5,1)
	_Spec ("Specular Power", Range (0.00, 2)) = 0.3
	_Shininess ("Glossiness", Range (0.02, 2)) = 0.078125
	_MainTex ("Base (RGB) RefStrGloss (A)", 2D) = "white" {}
	_BumpMap ("Normalmap", 2D) = "bump" {}
}

SubShader {
	Tags { "RenderType"="Opaque" }
	LOD 400
CGPROGRAM
#pragma surface surf BlinnPhong

sampler2D _MainTex;
sampler2D _BumpMap;

fixed4 _Color;
half _Spec;
half _Shininess;

struct Input {
	float2 uv_MainTex;
	float2 uv_BumpMap;
};

void surf (Input IN, inout SurfaceOutput o) {
	fixed4 tex = tex2D(_MainTex, IN.uv_MainTex);
	fixed4 c = tex * _Color;
	o.Albedo = c.rgb;
	
	o.Gloss = tex.a * _Spec;
	o.Specular = _Shininess;
	
	o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_BumpMap));
	
	o.Alpha = c.a;
}
ENDCG
}

FallBack "Eyecy/Specular"
}

//Written 2012 by EyecyArt
