/* eslint-disable */
// contains webgl code for rendering 3d fox animation

import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { FoxAnimation } from './fox-animate';
import { FoxBox, unpackFox } from './fox-geometry';
import { FOX_FRAG_SHADER, FOX_VERT_SHADER } from './fox-shader';

export class FoxRenderer {
  public animation: FoxAnimation;

  public animationTick = 0;

  private initShader(type: number, src: string) {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('Error creating vertex shader');
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }

  private initProgram(spec: { vert: string; frag: string }) {
    const { gl } = this;
    const vs = this.initShader(gl.VERTEX_SHADER, spec.vert);
    const fs = this.initShader(gl.FRAGMENT_SHADER, spec.frag);
    const prog = gl.createProgram();
    if (!prog) {
      throw new Error('Error creating shader program');
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('link failed', {
        prog: gl.getProgramInfoLog(prog),
        frag: gl.getShaderInfoLog(fs),
        vert: gl.getShaderInfoLog(vs),
      });
    }
    return prog;
  }

  private foxShader: WebGLProgram;

  private vPosition: number;

  private vNormal: number;

  private vColor: number;

  private vCenter: number;

  private uAnimate: WebGLUniformLocation;

  private uViewProj: WebGLUniformLocation;

  private uTick: WebGLUniformLocation;

  private uEye: WebGLUniformLocation;

  private uHemisphereAxis: WebGLUniformLocation;

  private uHemisphereColor0: WebGLUniformLocation;

  private uHemisphereColor1: WebGLUniformLocation;

  private uInteriorColor0: WebGLUniformLocation;

  private uInteriorColor1: WebGLUniformLocation;

  private uFogColor: WebGLUniformLocation;

  private initFoxShader() {
    const program = (this.foxShader = this.initProgram({
      vert: FOX_VERT_SHADER,
      frag: FOX_FRAG_SHADER,
    }));

    const { gl } = this;

    this.vPosition = gl.getAttribLocation(program, 'vPosition');
    this.vNormal = gl.getAttribLocation(program, 'vNormal');
    this.vColor = gl.getAttribLocation(program, 'vColor');
    this.vCenter = gl.getAttribLocation(program, 'vCenter');

    this.uAnimate = gl.getUniformLocation(program, 'uAnimate');
    this.uViewProj = gl.getUniformLocation(program, 'uViewProj');
    this.uTick = gl.getUniformLocation(program, 'uTick');

    this.uEye = gl.getUniformLocation(program, 'uEye');

    this.uHemisphereAxis = gl.getUniformLocation(program, 'uHemisphereAxis');
    this.uHemisphereColor0 = gl.getUniformLocation(
      program,
      'uHemisphereColor0',
    );

    this.uHemisphereColor1 = gl.getUniformLocation(
      program,
      'uHemisphereColor1',
    );

    this.uInteriorColor0 = gl.getUniformLocation(program, 'uInteriorColor0');
    this.uInteriorColor1 = gl.getUniformLocation(program, 'uInteriorColor1');
    this.uFogColor = gl.getUniformLocation(program, 'uFogColor');
  }

  private foxVBuffer: WebGLBuffer;

  private foxIBuffer: WebGLBuffer;

  private foxBoxes: FoxBox[];

  private foxVertCount: number;

  private initGeometry() {
    const { gl } = this;
    const { vbuffer, ibuffer, boxes, lo, hi } = unpackFox();
    this.foxBoxes = boxes;
    this.foxVertCount = ibuffer.length;

    vec3.copy(this.lo, lo);
    vec3.copy(this.hi, hi);

    vec3.add(this.center, this.lo, this.hi);
    vec3.scale(this.center, this.center, 0.5);

    const foxVerts = gl.createBuffer();
    if (!foxVerts) {
      throw new Error('Error allocating fox vertex buffer');
    }
    this.foxVBuffer = foxVerts;
    gl.bindBuffer(gl.ARRAY_BUFFER, foxVerts);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbuffer), gl.STATIC_DRAW);

    const foxFaces = gl.createBuffer();
    if (!foxFaces) {
      throw new Error('Error allocating fox face buffer');
    }
    this.foxIBuffer = foxFaces;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, foxFaces);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(ibuffer),
      gl.STATIC_DRAW,
    );

    this.animation = new FoxAnimation(boxes);
  }

  private bindFoxBuffer() {
    const { gl } = this;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.foxVBuffer);
    if (this.vPosition >= 0) {
      gl.enableVertexAttribArray(this.vPosition);
      gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 64, 0);
    }

    if (this.vNormal >= 0) {
      gl.enableVertexAttribArray(this.vNormal);
      gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 64, 16);
    }

    if (this.vColor >= 0) {
      gl.enableVertexAttribArray(this.vColor);
      gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 64, 32);
    }

    if (this.vCenter >= 0) {
      gl.enableVertexAttribArray(this.vCenter);
      gl.vertexAttribPointer(this.vCenter, 4, gl.FLOAT, false, 64, 48);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.foxIBuffer);
  }

  public theta = Math.PI / 2;

  public phi = 0;

  public distance = 400;

  private eye = vec3.fromValues(0, 0, -2);

  private center = vec3.fromValues(0, 0, 0);

  private lo = vec3.fromValues(-1, -1, -1);

  private hi = vec3.fromValues(1, 1, 1);

  private view = mat4.identity(mat4.create());

  private proj = mat4.identity(mat4.create());

  private viewProj = mat4.identity(mat4.create());

  private invViewProj = mat4.identity(mat4.create());

  private updateCamera() {
    // calculate transformations
    const { eye } = this;
    const { center } = this;
    const { theta } = this;
    const { phi } = this;
    const { distance } = this;

    // calculate center
    const { lo } = this;
    const { hi } = this;
    center[0] = 0.5 * (lo[0] + hi[0]);
    center[1] = 0.5 * (lo[1] + hi[1]);
    center[2] = 0.5 * (lo[2] + hi[2]);

    // calculate eye
    eye[0] = Math.cos(theta) * Math.cos(phi) * distance + center[0];
    eye[1] = Math.sin(phi) * distance + center[1];
    eye[2] = Math.sin(theta) * Math.cos(phi) * distance + center[2];

    // calculate view projection matrix
    mat4.lookAt(mat4.identity(this.view), eye, center, [0, 1, 0]);
    mat4.perspective(
      mat4.identity(this.proj),
      Math.PI / 4,
      this.gl.drawingBufferWidth / this.gl.drawingBufferHeight,
      0.5,
      1600,
    );
    mat4.mul(this.viewProj, this.proj, this.view);
    mat4.invert(this.invViewProj, this.viewProj);
  }

  public foxLookAt(x: number, y: number) {
    console.log('bound2', x, y, this.gl);
    const pick = vec4.fromValues(
      (2 * x * window.devicePixelRatio) / this.gl.drawingBufferWidth - 1,
      1 - (2 * y * window.devicePixelRatio) / this.gl.drawingBufferHeight,
      1,
      1,
    );
    vec4.transformMat4(pick, pick, this.invViewProj);
    const point = vec3.fromValues(
      pick[0] / pick[3],
      pick[1] / pick[3],
      pick[2] / pick[3],
    );
    vec3.normalize(point, point);
    const up = vec3.fromValues(0, 1, 0);
    vec3.scaleAndAdd(up, up, point, -vec3.dot(point, up));
    vec3.normalize(up, up);
    quat.setAxes(
      this.animation.animRotation,
      point,
      vec3.cross(vec3.create(), point, up),
      up,
    );
  }

  constructor(private gl: WebGLRenderingContext) {
    this.initFoxShader();
    this.initGeometry();
  }

  private _lastTimestamp = 0;

  public animate(timestamp: number) {
    const dt = (timestamp - this._lastTimestamp) / 16;
    this._lastTimestamp = timestamp;
    this.animationTick = 10 * (1 + Math.cos(timestamp * 0.001));
    this.animation.update(timestamp / 16, Math.min(0.5, dt));
  }

  public explodeRay(x: number, y: number, mag: number) {
    const pickDir = vec4.fromValues(
      (2 * x * window.devicePixelRatio) / this.gl.drawingBufferWidth - 1,
      1 - (2 * y * window.devicePixelRatio) / this.gl.drawingBufferHeight,
      1,
      1,
    );
    vec4.transformMat4(pickDir, pickDir, this.invViewProj);
    const dir = vec3.fromValues(
      pickDir[0] / pickDir[3] - this.eye[0],
      pickDir[1] / pickDir[3] - this.eye[1],
      pickDir[2] / pickDir[3] - this.eye[2],
    );
    vec3.normalize(dir, dir);
    this.animation.explode(this.eye, dir, mag);
  }

  public hemisphereAxis = vec3.create();

  public hemisphereColor0 = vec3.create();

  public hemisphereColor1 = vec3.create();

  public interiorColor0 = vec3.create();

  public interiorColor1 = vec3.create();

  public fogColor = vec3.create();

  public draw() {
    // Clear drawing buffer
    const { gl } = this;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update camera state
    this.updateCamera();

    // draw animation
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(this.foxShader);

    this.bindFoxBuffer();
    gl.uniformMatrix4fv(this.uViewProj, false, this.viewProj);
    gl.uniform1f(this.uTick, this.animationTick);
    gl.uniform3fv(this.uEye, this.eye);
    gl.uniform3fv(this.uHemisphereAxis, this.hemisphereAxis);
    gl.uniform3fv(this.uHemisphereColor0, this.hemisphereColor0);
    gl.uniform3fv(this.uHemisphereColor1, this.hemisphereColor1);
    gl.uniform3fv(this.uInteriorColor0, this.interiorColor0);
    gl.uniform3fv(this.uInteriorColor1, this.interiorColor1);
    gl.uniform3fv(this.uFogColor, this.fogColor);

    const boxes = this.foxBoxes;
    const xforms = this.animation.boxTransforms;
    for (let i = 0; i < boxes.length; ++i) {
      const { start, end } = boxes[i];
      gl.uniformMatrix4fv(this.uAnimate, false, xforms[i]);
      gl.drawElements(gl.TRIANGLES, end - start, gl.UNSIGNED_SHORT, 2 * start);
    }
  }
}
