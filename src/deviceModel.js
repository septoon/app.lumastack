import * as THREE from 'three';

export function prepareDeviceModel(source, config) {
  const model = source.clone(true);
  const screen = model.getObjectByName(config.screen);
  if (!screen?.isMesh || !screen.geometry.attributes.uv) throw new Error(`Display mesh missing in ${config.url}`);
  model.updateMatrixWorld(true);
  const displayBox = new THREE.Box3().setFromObject(screen);
  const displaySize = displayBox.getSize(new THREE.Vector3());
  const ratio = displaySize.x / displaySize.y;
  let ownedGeometry;
  if (config.planarUV) {
    // Samsung's wallpaper UVs are an irregular atlas. Project the existing curved
    // display into its own front plane; preserve its edges and camera aperture.
    ownedGeometry = screen.geometry.clone();
    screen.geometry = ownedGeometry;
    const positions = ownedGeometry.attributes.position;
    const uv = ownedGeometry.attributes.uv;
    const point = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(screen.matrixWorld);
      uv.setXY(i, (displayBox.max.x - point.x) / displaySize.x, (point.y - displayBox.min.y) / displaySize.y);
    }
    uv.needsUpdate = true;
  }
  const bounds = new THREE.Box3().setFromObject(model);
  model.position.sub(bounds.getCenter(new THREE.Vector3()));
  const normalized = new THREE.Group();
  normalized.add(model);
  normalized.scale.setScalar(2.65 / bounds.getSize(new THREE.Vector3()).y);
  return { model: normalized, screen, ratio, dispose: () => ownedGeometry?.dispose() };
}
