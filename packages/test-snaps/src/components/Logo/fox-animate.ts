/* eslint-disable */

import { mat3, mat4, quat, vec3, vec4 } from 'gl-matrix';
import { createNoise4D } from 'simplex-noise';
import { FoxBox } from './fox-geometry';

const noise = createNoise4D();

const K_POS_DAMPING = 0.8;
const K_ROT_DAMPING = 0.4;

const K_POS_RECOVER = 0.1;
const K_ROT_RECOVER = 0.1;

const NOISE_MAG = 4;
const NOISE_SCALE = 0.008;
const WAVE_FREQ = 0.012;

/**
 *
 * @param N
 * @param stride
 */
function allocBuffer(N: number, stride: number): any {
  const buffer = new Float64Array(N * stride);
  const result: Float64Array[] = [];
  for (let i = 0; i < buffer.length; i += stride) {
    result.push(buffer.subarray(i, i + stride));
  }
  return result;
}

export class FoxAnimation {
  public N: number;

  public boxTransforms: mat4[] = [];

  public animRotation: quat = quat.identity(quat.create());

  // box parameters
  public centers: vec3[] = [];

  public weights: vec4[] = [];

  // box physics stuff
  public restPosition: number[] = [];

  public curPosition: vec3[] = [];

  public nextPosition: vec3[] = [];

  public velocity: vec3[] = [];

  public restRotation: number[] = [];

  public curRotation: quat[] = [];

  public nextRotation: quat[] = [];

  public angularVelocity: quat[] = [];

  constructor(boxes: FoxBox[]) {
    const N = (this.N = boxes.length);

    this.boxTransforms = allocBuffer(N, 16);
    this.centers = allocBuffer(N, 3);
    this.weights = allocBuffer(N, 4);
    this.curPosition = allocBuffer(N, 3);
    this.nextPosition = allocBuffer(N, 3);
    this.velocity = allocBuffer(N, 3);

    this.nextRotation = allocBuffer(N, 4);
    this.curRotation = allocBuffer(N, 4);
    this.angularVelocity = allocBuffer(N, 4);

    for (let i = 0; i < boxes.length; ++i) {
      mat4.identity(this.boxTransforms[i]);

      vec3.set(this.centers[i], boxes[i].cx, boxes[i].cy, boxes[i].cz);
      vec4.set(
        this.weights[i],
        boxes[i].bx,
        boxes[i].by,
        boxes[i].bz,
        boxes[i].bw,
      );

      const P = vec3.scaleAndAdd(
        vec3.create(),
        this.centers[i],
        this.weights[i] as vec3,
        -150,
      );
      P[1] += 40 * Math.random();
      vec3.copy(this.curPosition[i], P);
      vec3.copy(this.nextPosition[i], P);

      quat.identity(this.curRotation[i]);
      quat.identity(this.nextRotation[i]);

      this.restPosition.push(-1);
      this.restRotation.push(-1);
    }
  }

  private _qTmp = quat.create();

  public preintegrate(dt: number) {
    for (let i = 0; i < this.curPosition.length; ++i) {
      vec3.scaleAndAdd(
        this.nextPosition[i],
        this.curPosition[i],
        this.velocity[i],
        dt,
      );
    }

    for (let i = 0; i < this.curRotation.length; ++i) {
      vec4.scaleAndAdd(
        this.nextRotation[i],
        this.curRotation[i],
        this.angularVelocity[i],
        dt,
      );
      quat.normalize(this.nextRotation[i], this.nextRotation[i]);
    }
  }

  public postintegrate(dt: number) {
    const VELOCITY_SCALE = Math.exp(-K_POS_DAMPING * dt) / dt;
    for (let i = 0; i < this.curPosition.length; ++i) {
      vec3.subtract(
        this.velocity[i],
        this.nextPosition[i],
        this.curPosition[i],
      );
      vec3.scale(this.velocity[i], this.velocity[i], VELOCITY_SCALE);
      vec3.copy(this.curPosition[i], this.nextPosition[i]);
    }

    const ROTATION_SCALE = Math.exp(-K_ROT_DAMPING * dt) / dt;
    for (let i = 0; i < this.curRotation.length; ++i) {
      vec4.subtract(
        this.angularVelocity[i],
        this.nextRotation[i],
        this.curRotation[i],
      );

      vec4.scale(
        this.angularVelocity[i],
        this.angularVelocity[i],
        ROTATION_SCALE,
      );
      quat.copy(this.curRotation[i], this.nextRotation[i]);
    }
  }

  public updateTransforms() {
    for (let i = 0; i < this.boxTransforms.length; ++i) {
      mat4.fromRotationTranslation(
        this.boxTransforms[i],
        this.curRotation[i],
        this.curPosition[i],
      );
    }
  }

  private _lastExplode = 1;

  private _displacement = vec3.create();

  private _linePoint = vec3.create();

  private _velocity = vec3.create();

  private _angVelocity = vec3.create();

  public explode(center: vec3, direction: vec3, mag: number) {
    this._lastExplode = 1;
    const M = mat3.fromQuat(this._tmpMat, this.animRotation);
    for (let i = 0; i < this.curPosition.length; ++i) {
      // calculate closest point
      const disp = vec3.subtract(
        this._displacement,
        this.curPosition[i],
        center,
      );
      const t = vec3.dot(disp, direction);
      const P = vec3.scaleAndAdd(this._linePoint, center, direction, t);

      const weight = this.weights[i];

      // calculate ditance and force magnitude
      const d = vec3.subtract(this._velocity, this.curPosition[i], P);
      const scale = Math.min(10, (weight[3] * mag) / (1 + vec3.sqrLen(d)));
      if (scale < 0.01 || vec3.squaredLength(this.velocity[i]) > 100) {
        continue;
      }

      this.restPosition[i] = this.restRotation[i] = -1;

      // update linear velocity
      vec3.scaleAndAdd(this.velocity[i], this.velocity[i], d, scale);

      const extForce = vec3.transformMat3(this._tmpPos, weight as vec3, M);
      vec3.scaleAndAdd(
        this.velocity[i],
        this.velocity[i],
        extForce,
        -10 * scale,
      );

      // update angular velocity
      vec3.normalize(disp, disp);
      vec3.cross(this._angVelocity, direction, weight as vec3);
      vec3.scaleAndAdd(
        this.angularVelocity[i] as vec3,
        this.angularVelocity[i] as vec3,
        this._angVelocity,
        scale,
      );
      // vec3.scaleAndAdd(this.angularVelocity[i] as vec3, this.angularVelocity[i] as vec3, weight as vec3, scale)
    }
  }

  private _tmpPos = vec3.create();

  private _tmpPos2 = vec3.create();

  private _tmpMat = mat3.create();

  private _tmpMat2 = mat3.create();

  public applyPositionConstraints(dt: number) {
    const R0 = this._prevAnimRotation;
    const R1 = this.animRotation;
    const M0 = mat3.fromQuat(this._tmpMat, R0);
    const M1 = mat3.fromQuat(this._tmpMat2, R1);

    const invDT = 1 / Math.max(0.01, dt);
    const DR = invDT * vec4.distance(R0, R1);

    const tpos = K_POS_RECOVER * dt;
    for (let i = 0; i < this.nextPosition.length; ++i) {
      const C0 = vec3.transformMat3(this._tmpPos, this.centers[i], M0);
      const C1 = vec3.transformMat3(this._tmpPos2, this.centers[i], M1);
      const DC = vec3.distance(C0, C1);
      vec3.lerp(
        this.nextPosition[i],
        this.nextPosition[i],
        C1,
        tpos *
          Math.max(
            0.25,
            1 / (1 + 0.001 * vec3.sqrDist(C1, this.nextPosition[i])),
          ),
      );

      if (this.restPosition[i] < 0) {
        this.restPosition[i] = Math.min(0, this.restPosition[i] + dt);
      } else if (
        this.restPosition[i] > 0 ||
        (vec3.distance(this.nextPosition[i], C1) < 1.5 + DC &&
          vec3.length(this.velocity[i]) < 0.01 + invDT * DC)
      ) {
        vec3.copy(this.nextPosition[i], C1);
        vec3.copy(this.curPosition[i], C1);
        vec3.set(this.velocity[i], 0, 0, 0);
        this.restPosition[i] = 1;
      }
    }

    const trot = K_ROT_RECOVER * dt;
    for (let i = 0; i < this.curRotation.length; ++i) {
      quat.lerp(this.nextRotation[i], this.nextRotation[i], R1, trot);
      quat.normalize(this.nextRotation[i], this.nextRotation[i]);
      if (this.restRotation[i] < 0) {
        this.restRotation[i] = Math.min(0, this.restRotation[i] + dt);
      }

      if (
        this.restRotation[i] > 0 ||
        (vec4.distance(this.nextRotation[i], R1) < 0.01 + DR &&
          vec4.sqrLen(this.angularVelocity[i]) < 0.01 + invDT * DR)
      ) {
        quat.copy(this.nextRotation[i], R1);
        quat.copy(this.curRotation[i], R1);
        quat.set(this.angularVelocity[i], 0, 0, 0, 0);
        this.restRotation[i] = 1;
      }
    }
  }

  private _tmpRot = quat.create();

  private applyWaveForce(t: number) {
    const tx = 0.001 * t; // 0.1 * t
    const ty = 0; // 0.01 * t
    const tz = 0; // 0.02 * t
    const tw = 0.00001 * t; // 0.5 * t
    const S = NOISE_SCALE;

    const M = Math.cos(WAVE_FREQ * t);

    const MR = mat3.fromQuat(this._tmpMat, this.animRotation);

    for (let i = 0; i < this.curPosition.length; ++i) {
      const [cx, cy, cz] = this.centers[i];
      const n =
        NOISE_MAG *
        (M * noise(tx + S * cx, ty + S * cy, tz + S * cz, tw) -
          this._lastExplode -
          0.05);
      if (n > 0) {
        const rotDir = vec3.transformMat3(
          this._tmpPos,
          this.weights[i] as vec3,
          MR,
        );
        vec3.scaleAndAdd(this.velocity[i], this.velocity[i], rotDir, -n);

        const omega = quat.mul(
          this._tmpRot,
          this.animRotation,
          this.weights[i],
        );
        vec4.scaleAndAdd(
          this.angularVelocity[i],
          this.angularVelocity[i],
          omega,
          0.0025 * n,
        );
        this.restPosition[i] = -1;
        this.restRotation[i] = -1;
      }
    }
  }

  private _prevAnimRotation = quat.identity(quat.create());

  public update(t: number, dt: number) {
    this._lastExplode = Math.max(0, this._lastExplode - 0.003 * dt);
    this.applyWaveForce(t);
    this.preintegrate(dt);
    this.applyPositionConstraints(dt);
    this.postintegrate(dt);
    this.updateTransforms();
    quat.copy(this._prevAnimRotation, this.animRotation);
  }
}
