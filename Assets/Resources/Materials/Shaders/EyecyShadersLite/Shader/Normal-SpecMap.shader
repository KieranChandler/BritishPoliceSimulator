//Based on BuildIn Shaders
//Written 2012 by EyecyArt

Shader "Eyecy/SpecularMap" {
Properties {
	_Color ("Main Color", Color) = (0.5, 0.5, 0.5, 0)
	_Spec ("Specular Power", Range (0.00, 2)) = 0.3
	_Shininess ("Glossiness", Range (0.02, 2)) = 0.078125
	_MainTex ("Base (RGB)", 2D) = "white" {}
	_SpecTex ("Spec (RGB) Gloss (A)", 2D) = "white" {}
}

SubShader {
	Tags { "RenderType"="Opaque" }
	LOD 300
	
CGPROGRAM
#pragma surface surf BlinnPhongSpecMap

sampler2D _MainTex;
sampler2D _SpecTex;
fixed4 _Color;
half _Spec;
half _Shininess;

struct Input {
	float2 uv_MainTex;
};

struct SurfaceOut {
	fixed3 Albedo;
	fixed3 Normal;
	fixed3 Emission;
	half Specular;
	fixed3 Gloss;
	fixed Alpha;
};

void surf (Input IN, inout SurfaceOut o) {
	fixed4 tex = tex2D(_MainTex, IN.uv_MainTex);
	fixed4 texS = tex2D(_SpecTex, IN.uv_MainTex);
	o.Albedo = tex.rgb * _Color.rgb;
	o.Gloss = texS.rgb * _Spec;
	o.Alpha = tex.a * _Color.a;
	o.Specular = texS.a * _Shininess;
}

inline fixed4 LightingBlinnPhongSpecMap (SurfaceOut s, fixed3 lightDir, half3 viewDir, fixed atten)
{
	half3 h = normalize (lightDir + viewDir);
	
	fixed diff = max (0, dot (s.Normal, lightDir));
	
	float nh = max (0, dot (s.Normal, h));
	float spec = pow (nh, s.Specular*128.0);
	
	fixed4 c;
	c.rgb = (s.Albedo * _LightColor0.rgb * diff + _LightColor0.rgb * spec * s.Gloss) * (atten * 2);
	c.a = s.Alpha + _LightColor0.a * (0.2989f * s.Gloss.r + 0.5870f * s.Gloss.g + 0.1140f * s.Gloss.b) * spec * atten;
	return c;
}
ENDCG
}

Fallback "Eyecy/Specular"
}

//Written 2012 by EyecyArt
