Shader  "Emissive" {

Properties {
	_Color ("Color (RGB)", Color) = (1,1,1,1)
    _MainTex ("Base (RGB) Gloss (A)", 2D) = "white" {}
    _EmissiveIntensity("_EmissiveIntensity", Float ) = 0.5
}

SubShader {
    Tags { "RenderType"="Opaque" }
    LOD 250
    
	CGPROGRAM
	#pragma surface surf Lambert
	
	fixed4 _Color;
	sampler2D _MainTex;
	float _EmissiveIntensity;
	
	struct Input  {
    	float2 uv_MainTex;
	};
	
	void surf (Input  IN, inout SurfaceOutput o) {
    	fixed4 tex = tex2D(_MainTex, IN.uv_MainTex) * _Color;
    	o.Albedo = tex.rgb;
    	o.Alpha = tex.a;
    
    	o.Emission=(tex.rgb * tex.a) * _EmissiveIntensity;
	}
	ENDCG
	}
 
	FallBack "Self-Illumin/Diffuse"
}