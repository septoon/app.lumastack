import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FRONT_ROTATION_Y, SCREEN_TEXTURES } from "./iphoneConfig";

const HERO_SCREEN_ANCHORS = [
  { id: "requests", u: 0.67, v: 0.72 },
  { id: "route", u: 0.34, v: 0.455 },
  { id: "report", u: 0.66, v: 0.22 },
];

function ResponsiveCamera({ mode }) {
  const { camera, invalidate, size } = useThree();

  useEffect(() => {
    const mobile = size.width <= 700;
    const tablet = size.width <= 1080;
    const z = mode === "hero"
      ? mobile ? 3.15 : tablet ? 2.7 : 2.35
      : mobile ? 4.7 : tablet ? 4.45 : 4.2;
    camera.position.set(0, 0, z);
    camera.fov = mode === "hero"
      ? mobile ? 46 : tablet ? 44 : 48
      : mobile ? 30 : tablet ? 29 : 27;
    camera.near = 0.1;
    camera.far = 100;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, mode, size.height, size.width]);

  return null;
}

const IphoneScene = forwardRef(function IphoneScene(
  { mode, initialScreen = 0, onAnchorsChange, onReady },
  ref,
) {
  const { scene: sourceScene } = useGLTF("/models/iphone.glb");
  const textures = useTexture(SCREEN_TEXTURES);
  const { gl, invalidate } = useThree();
  const { model, screen } = useMemo(() => {
    const clonedModel = sourceScene.clone(true);
    const screenMesh = clonedModel.getObjectByName("Screen");
    if (!screenMesh?.isMesh || !screenMesh.geometry) {
      throw new Error("GLB Screen mesh not found");
    }
    return { model: clonedModel, screen: screenMesh };
  }, [sourceScene]);
  const groupRef = useRef(null);
  const screenMaterialRef = useRef(null);
  const activeScreenRef = useRef(initialScreen);
  const projectionPointRef = useRef(new THREE.Vector3());
  const screenAnchors = useMemo(() => {
    screen.geometry.computeBoundingBox();
    const bounds = screen.geometry.boundingBox;
    if (!bounds) return [];

    return HERO_SCREEN_ANCHORS.map(({ id, u, v }) => ({
      id,
      point: new THREE.Vector3(
        THREE.MathUtils.lerp(bounds.min.x, bounds.max.x, u),
        THREE.MathUtils.lerp(bounds.min.y, bounds.max.y, v),
        (bounds.min.z + bounds.max.z) / 2,
      ),
    }));
  }, [screen]);

  useFrame(({ camera, size }) => {
    if (mode !== "hero" || !onAnchorsChange || !groupRef.current) return;

    groupRef.current.updateWorldMatrix(true, true);
    const positions = {};
    const projectedPoint = projectionPointRef.current;

    screenAnchors.forEach(({ id, point }) => {
      projectedPoint.copy(point);
      screen.localToWorld(projectedPoint);
      projectedPoint.project(camera);
      positions[id] = {
        x: (projectedPoint.x * 0.5 + 0.5) * size.width,
        y: (-projectedPoint.y * 0.5 + 0.5) * size.height,
        visible: projectedPoint.z >= -1 && projectedPoint.z <= 1,
      };
    });

    onAnchorsChange(positions);
  });

  useEffect(() => {
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      // The exported Screen UVs run top-to-bottom opposite to these external
      // PNGs. A live GLB render confirms that flipY must stay enabled.
      texture.flipY = true;
      texture.anisotropy = maxAnisotropy;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    });

    // The raw GLB identifies material 15 as ScreenMaterial. GLTFLoader may
    // omit that source name on the runtime material, so Screen remains the
    // authoritative target and receives its own display-only material.
    const exportedMaterialName = screen.material?.name || "ScreenMaterial";

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: textures[activeScreenRef.current],
      side: THREE.FrontSide,
      toneMapped: false,
    });
    screenMaterial.name = "ScreenMaterial.Runtime";
    screenMaterialRef.current = screenMaterial;
    screen.material = screenMaterial;
    screen.renderOrder = 2;

    invalidate();
    onReady?.({
      screenName: screen.name,
      geometryName: screen.geometry.name || "ScreenGeometry",
      materialName: exportedMaterialName,
      flipY: textures[0].flipY,
    });

    return () => {
      screenMaterial.dispose();
      screenMaterialRef.current = null;
    };
  }, [gl, invalidate, onReady, screen, textures]);

  useImperativeHandle(ref, () => ({
    setPose({ rotationX, rotationY, rotationZ, scale, x, y, z }) {
      const group = groupRef.current;
      if (!group) return;
      if (rotationX != null) group.rotation.x = rotationX;
      if (rotationY != null) group.rotation.y = rotationY;
      if (rotationZ != null) group.rotation.z = rotationZ;
      if (scale != null) group.scale.setScalar(scale);
      if (x != null) group.position.x = x;
      if (y != null) group.position.y = y;
      if (z != null) group.position.z = z;
      invalidate();
    },
    setScreen(index) {
      const next = Math.max(0, Math.min(textures.length - 1, index));
      activeScreenRef.current = next;
      const material = screenMaterialRef.current;
      if (!material || material.map === textures[next]) return;
      material.map = textures[next];
      material.needsUpdate = true;
      invalidate();
    },
  }), [invalidate, textures]);

  const scale = mode === "hero" ? 14.3 : 12.65;

  return (
    <>
      <ResponsiveCamera mode={mode} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 5, 6]} intensity={2.4} color="#fff8ed" />
      <directionalLight position={[-5, 1, 4]} intensity={1.45} color="#b8dcca" />
      <directionalLight position={[1, 4, -5]} intensity={2.1} color="#d4e7ff" />
      <Environment background={false} resolution={128} frames={1} environmentIntensity={0.8}>
        <Lightformer form="rect" intensity={4.2} color="#fff7ed" position={[0, 4, 5]} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#a7d5be" position={[-4, 1, 3]} rotation={[0, Math.PI / 3, 0]} scale={[3, 5, 1]} />
        <Lightformer form="rect" intensity={3.5} color="#c8dcff" position={[4, 2, -4]} rotation={[0, -Math.PI / 3, 0]} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={2.4} color="#ffffff" position={[0, -4, 2]} scale={2} />
      </Environment>
      <group
        ref={groupRef}
        rotation={[0, FRONT_ROTATION_Y, 0]}
        scale={scale}
      >
        <primitive object={model} />
      </group>
    </>
  );
});

useGLTF.preload("/models/iphone.glb");
SCREEN_TEXTURES.forEach((path) => useTexture.preload(path));

export default IphoneScene;
