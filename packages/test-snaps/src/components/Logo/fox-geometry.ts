/* eslint-disable */

import { vec3 } from 'gl-matrix';
import { FOX_BOXES } from './fox-data';

export interface FoxBox {
  cx: number;
  cy: number;
  cz: number;
  bx: number;
  by: number;
  bz: number;
  bw: number;
  start: number;
  end: number;
}

const ab = vec3.create();
const ac = vec3.create();
const normal = vec3.create();
/**
 *
 * @param a
 * @param b
 * @param c
 */
function triNormal(a: vec3, b: vec3, c: vec3) {
  vec3.sub(ab, b, a);
  vec3.sub(ac, c, a);
  vec3.cross(normal, ab, ac);
  vec3.normalize(normal, normal);
  return normal;
}

// unpacks mesh data from the fox into a webgl-renderable array buffer
//
// output vertex format is 16-component float, 4 attributes:
//
//  position  = px, py, pz, 1
//  normal    = nx, ny, nz, 0
//  color     = r,  g,  b,  1
//  box index = cx, cy, cz, 0
//
/**
 *
 */
export function unpackFox() {
  const vbuffer: number[] = [];
  const ibuffer: number[] = [];

  const { colors, lo, hi, verts, centers, boundary } = FOX_BOXES;

  const boxes = FOX_BOXES.boxes.map((chunks, offset) => {
    const start = ibuffer.length;
    const [cx, cy, cz] = centers[offset];
    const [bx, by, bz] = boundary[offset];
    const bw = Math.hypot(bx, by, bz);
    for (const [material, polygons] of chunks) {
      for (const poly of polygons) {
        const [nx, ny, nz] = triNormal(
          verts[poly[0]] as any,
          verts[poly[1]] as any,
          verts[poly[2]] as any,
        );
        const [r, g, b] = colors[material];
        const basePtr = vbuffer.length / 16;
        for (const vertIndex of poly) {
          const [px, py, pz] = verts[vertIndex];
          vbuffer.push(
            px,
            py,
            pz,
            1,
            nx,
            ny,
            nz,
            0,
            r / 255,
            g / 255,
            b / 255,
            material === colors.length - 1 ? 1 : 0,
            cx,
            cy,
            cz,
            0,
          );
        }

        for (let i = 2; i < poly.length; ++i) {
          ibuffer.push(basePtr, basePtr + i - 1, basePtr + i);
        }
      }
    }
    return {
      cx,
      cy,
      cz,
      bx,
      by,
      bz,
      bw,
      start,
      end: ibuffer.length,
    };
  });

  return {
    vbuffer,
    ibuffer,
    boxes,
    lo: vec3.fromValues(lo[0], lo[1], lo[2]),
    hi: vec3.fromValues(hi[0], hi[1], hi[2]),
  };
}
