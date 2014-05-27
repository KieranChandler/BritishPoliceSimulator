//Based on BuildIn Shaders
//Written 2012 by EyecyArt

Shader "Eyecy/Specular" {
Properties {
	_Color ("Main Color", Color) = (0.5, 0.5, 0.5, 0)
	_SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
	_Spec ("Specular Power", Range (0.00, 2)) = 0.3
	_Shininess ("Glossiness", Range (0.02, 2)) = 0.07
	_MainTex ("Base (RGB) Spec (A)", 2D) = "white" {}
}

SubShader {
	Tags { "RenderType"="Opaque" }
	LOD 300
	
CGPROGRAM
#pragma surface surf BlinnPhong

sampler2D _MainTex;
fixed4 _Color;
half _Spec;
half _Shininess;

struct Input {
	float2 uv_MainTex;
};

void surf (Input IN, inout SurfaceOutput o) {
	fixed4 tex = tex2D(_MainTex, IN.uv_MainTex);
	o.Albedo = tex.rgb * _Color.rgb;
	o.Gloss = tex.a * _Spec;
	o.Alpha = tex.a * _Color.a;
	o.Specular = _Shininess;
}
ENDCG
}

Fallback "VertexLit"
}

//Written 2012 by EyecyArt
