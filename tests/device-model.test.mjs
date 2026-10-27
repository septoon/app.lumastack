import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { prepareDeviceModel } from '../src/deviceModel.js';
import { DEVICE_MODELS } from '../src/components/iphoneConfig.js';

// Decode the real geometry and transforms, excluding image decoding (a browser API).
async function geometryOnly(path) {
  const bytes = fs.readFileSync(path);
  const length = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + length));
  const offset = 20 + length;
  const bin = bytes.subarray(offset + 8, offset + 8 + bytes.readUInt32LE(offset));
  json.buffers = [{ uri: `data:application/octet-stream;base64,${bin.toString('base64')}`, byteLength: bin.length }];
  json.materials = json.materials.map(material => ({ name: material.name, doubleSided: material.doubleSided }));
  json.images = []; json.textures = []; json.extensionsUsed = [];
  globalThis.ProgressEvent ??= class { constructor(type, init) { Object.assign(this, init); } };
  return (await new GLTFLoader().parseAsync(JSON.stringify(json), '')).scene;
}
for (const platform of ['ios', 'android']) test(`${platform}: real GLB keeps hardware, faces camera and maps the display upright`, async () => {
  const config = DEVICE_MODELS[platform];
  const source = await geometryOnly(`public${config.url}`);
  const result = prepareDeviceModel(source, config);
  const view = new THREE.Group(); view.rotation.y = config.front; view.add(result.model); view.updateMatrixWorld(true);
  const size = new THREE.Box3().setFromObject(view).getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.y - 2.65) < 0.001);
  assert.ok(size.x / size.y > 0.4 && size.x / size.y < 0.52);
  let originalMeshes = 0, meshes = 0;
  source.traverse(node => { if (node.isMesh) originalMeshes++; });
  view.traverse(node => { if (node.isMesh) meshes++; });
  assert.equal(meshes, originalMeshes);
  const screenBox = new THREE.Box3().setFromObject(result.screen);
  assert.ok(screenBox.getCenter(new THREE.Vector3()).z > 0, 'display is on the camera-facing side');
  const pos = result.screen.geometry.attributes.position;
  const uv = result.screen.geometry.attributes.uv;
  let top = -Infinity, bottom = Infinity, topV, bottomV;
  let left = Infinity, right = -Infinity, leftU, rightU;
  for (let i = 0; i < pos.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(result.screen.matrixWorld);
    if (p.y > top) { top = p.y; topV = uv.getY(i); }
    if (p.y < bottom) { bottom = p.y; bottomV = uv.getY(i); }
    if (p.x < left) { left = p.x; leftU = uv.getX(i); }
    if (p.x > right) { right = p.x; rightU = uv.getX(i); }
  }
  assert.ok(topV > 0.98 && bottomV < 0.02, 'top of image maps to top of screen');
  assert.ok(leftU < 0.03 && rightU > 0.97, 'text is not mirrored');
  const hit = new THREE.Raycaster(new THREE.Vector3(0, 0, 5), new THREE.Vector3(0, 0, -1)).intersectObject(result.screen);
  assert.ok(hit.length, 'display has front-facing triangles at its center');
  result.dispose();
});
