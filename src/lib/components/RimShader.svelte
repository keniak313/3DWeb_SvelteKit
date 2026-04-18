<script>
	import { T } from '@threlte/core';
	import { Color } from 'three';

	let {
		rimColor = '#00ffff',
		rimPower = 3.0,
		rimIntensity = 1.5,
		baseColor = '#1a1a26'
	} = $props();
</script>

<T.ShaderMaterial
	transparent={true}
	uniforms={{
		rimColor: { value: new Color(rimColor) },
		rimPower: { value: rimPower },
		rimIntensity: { value: rimIntensity },
		baseColor: { value: new Color(baseColor) }
	}}
	vertexShader={`
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      // Transformacja normalnych do przestrzeni widoku
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `}
	fragmentShader={`
    uniform vec3 rimColor;
    uniform float rimPower;
    uniform float rimIntensity;
    uniform vec3 baseColor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Obliczanie efektu Fresnela (iloczyn skalarny)
      float rim = 1.0 - max(0.0, dot(normal, viewDir));
      rim = pow(rim, rimPower) * rimIntensity;
      
      vec3 finalColor = baseColor + rimColor * rim;
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `}
/>
