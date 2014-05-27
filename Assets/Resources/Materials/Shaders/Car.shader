Shader "Car" {
	Properties {
		_MainTex ("Base (RGB)", 2D) = "white" {}
		_Cube ("Reflection", CUBE) = "" {}
		_MixValue ("MixValue (Range)",Range(0,1)) = 0.5
	}
	SubShader {
		Tags { "RenderType"="Opaque" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf Lambert

		sampler2D _MainTex;
		samplerCUBE _Cube;
		float _MixValue;

		struct Input {
			float2 uv_MainTex;
			float3 worldRefl;
		};

		void surf (Input IN, inout SurfaceOutput o) {
			half4 cMain = tex2D (_MainTex, IN.uv_MainTex);
			half4 cRefl = texCUBE(_Cube, IN.worldRefl);
			
			cMain = cMain * _MixValue;
			cRefl = cRefl * (1-_MixValue);
			
			o.Albedo = cMain.rgb/* + cRefl.rgb*/;
			o.Emission = cRefl.rgb;
			o.Alpha = cMain.a + cRefl.a;
		}
		ENDCG
	} 
	FallBack "Diffuse"
}
