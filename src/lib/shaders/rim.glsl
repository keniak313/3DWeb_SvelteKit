// rim.glsl

// @declaration
uniform vec3 uRimColor;
uniform float uRimPower;

// @main
float rim = 1.0 - saturate(dot(vNormal, normalize(vViewPosition)));
rim = pow(rim, uRimPower);
gl_FragColor.rgb += uRimColor * rim;