Shader "Specular Mapped" {
	Properties {
		_Color ("Main Color", Color) = (1,1,1,1)
		_SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
		_Shininess ("Shininess", Range(0.01, 1)) = 0.75
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_SpecMap ("Specular Map", 2D) = "black" {}
	}
	SubShader {
		Tags { "RenderType"="Opaque" }
		LOD 400
		
		CGPROGRAM
		#pragma surface surf BlinnPhong

		sampler2D _MainTex;
		sampler2D _SpecMap;
		fixed4 _Color;
		half _Shininess;

		struct Input {
			float2 uv_MainTex;
			float2 uv_SpecMap;
		};

		void surf (Input IN, inout SurfaceOutput o) {
			fixed4 tex = tex2D(_MainTex, IN.uv_MainTex);
			fixed4 specTex = tex2D(_SpecMap, IN.uv_SpecMap);
			o.Albedo = tex.rgb * _Color.a;
			o.Gloss = specTex.r;
			o.Alpha = tex.a * _Color.a;
			o.Specular = _Shininess * specTex.a;
		}
		ENDCG
	} 
	FallBack "Diffuse"
}
