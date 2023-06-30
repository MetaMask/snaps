/* eslint-disable */

export const FOX_VERT_SHADER = `
precision highp float;
attribute vec4 vPosition;
attribute vec4 vNormal;
attribute vec4 vColor;
attribute vec4 vCenter;

varying vec3 fColor;
varying float fDepth;

uniform float uTick;
uniform vec3 uEye;
uniform mat4 uViewProj;
uniform mat4 uAnimate;
uniform vec3 uHemisphereAxis;
uniform vec3 uHemisphereColor0;
uniform vec3 uHemisphereColor1;
uniform vec3 uInteriorColor0;
uniform vec3 uInteriorColor1;

void main () {
    vec3 normal = normalize((uAnimate * vec4(vNormal.xyz, 0)).xyz);
    vec3 light = mix(uHemisphereColor0, uHemisphereColor1, 0.5 * (1. + dot(normal, uHemisphereAxis)));
    vec3 interiorColor = mix(uInteriorColor0, uInteriorColor1,
        fract(dot(vec3(0.7436455, 0.11173, 0.576165), vCenter.xyz)));
    fColor = light * mix(vColor.rgb, interiorColor, vColor.a);
    vec4 worldPos = uAnimate * vec4(vPosition.xyz - vCenter.xyz, 1.);
    fDepth = distance(worldPos.xyz, uEye);
    gl_Position = uViewProj * worldPos;
}
`;

export const FOX_FRAG_SHADER = `
precision mediump float;

uniform vec3 uFogColor;
varying vec3 fColor;
varying float fDepth;

void main () {
    float fogExp = exp(-0.0002 * fDepth);
    gl_FragColor = vec4(mix(uFogColor, fColor, fogExp), 1.);
}`;
