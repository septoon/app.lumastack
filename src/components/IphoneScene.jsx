import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { DEVICE_MODELS } from "./iphoneConfig";
import { containRect, createResourcePool } from "../phoneResources";
import { createScreenLoader } from "../screenLoader";
import { animateScreenChange, samplePhoneFloat } from "../phoneMotion";
import { prepareDeviceModel } from "../deviceModel";

function emptyDisplay(ratio) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(1024 * ratio);
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#191a24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#c2c9ff';
  ctx.textAlign = 'center';
  ctx.font = '500 28px sans-serif';
  ctx.fillText('Инженер', canvas.width / 2, canvas.height / 2);
  return canvas;
}

async function prepareTexture(url, ratio, gl, signal) {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.decoding = 'async';
  await new Promise((resolve, reject) => {
    const cleanup = () => { clearTimeout(timeout); signal.removeEventListener('abort', abort); image.onload = image.onerror = null; };
    const abort = () => { cleanup(); image.src = ''; reject(new Error('Screen preparation aborted')); };
    const timeout = setTimeout(abort, 12000);
    signal.addEventListener('abort', abort, { once: true });
    image.onload = () => { cleanup(); resolve(); };
    image.onerror = () => { cleanup(); reject(new Error(`Screen unavailable: ${url}`)); };
    if (signal.aborted) { abort(); return; }
    image.src = url;
  });
  await image.decode();
  if (signal.aborted) throw new Error('Screen preparation aborted');
  const canvas = emptyDisplay(ratio);
  // Cap GPU memory and preserve the COMPLETE screenshot, including tablet uploads.
  const rect = containRect(image.naturalWidth, image.naturalHeight, canvas.width, canvas.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#191a24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  return uploadTexture(canvas, gl);
}

function uploadTexture(canvas, gl) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true; // Screen's exported UVs run top-to-bottom.
  texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  try { gl.initTexture(texture); }
  catch (error) { texture.dispose(); throw error; }
  return texture;
}

const IphoneScene = forwardRef(function IphoneScene({ platform = 'ios', image, images = [], mode, pointer, active, displayed, reducedMotion, onReady, onScreenReady }, ref) {
  const config = DEVICE_MODELS[platform];
  const { scene: source } = useGLTF(config.url);
  const { gl, invalidate, size, camera } = useThree();
  const regress = useThree(state => state.performance.regress);
  const rig = useRef();
  const platformRig = useRef();
  const initiallyDisplayed = useRef(displayed);
  const platformTimeline = useRef();
  const tilt = useRef();
  const floating = useRef();
  const floatTime = useRef(0);
  const timeline = useRef();
  const compiled = useRef(false);
  const hasDisplay = useRef(false);
  const notified = useRef(false);
  const shown = useRef(null);
  const shownImage = useRef(null);
  const shownStep = useRef(0);
  const callbacks = useRef({ onReady, onScreenReady });
  callbacks.current = { onReady, onScreenReady };
  const resources = useRef();
  const pose = useRef({ progress: 0 });
  const prepared = useMemo(() => prepareDeviceModel(source, config), [source, config]);
  const { model, screen, ratio } = prepared;

  useEffect(() => {
    const placeholder = uploadTexture(emptyDisplay(ratio), gl);
    const material = new THREE.MeshBasicMaterial({ map: placeholder, toneMapped: false, side: screen.material.side });
    screen.material = material;
    const pool = createResourcePool((url, signal) => prepareTexture(url, ratio, gl, signal), 6);
    resources.current = { pool, material, placeholder };
    invalidate();
    compiled.current = false;
    hasDisplay.current = false;
    notified.current = false;
    shown.current = null;
    shownImage.current = null;
    shownStep.current = 0;
    // Compile the physical model before revealing it or switching platforms.
    gl.compile(model, camera);
    compiled.current = true;
    return () => {
      timeline.current?.kill();
      resources.current = null;
      pool.dispose();
      placeholder.dispose();
      material.dispose();
      prepared.dispose();
    };
  }, [gl, invalidate, model, screen, ratio, camera]);

  useEffect(() => {
    const group = platformRig.current;
    platformTimeline.current?.kill();
    if (displayed) {
      group.visible = true;
      group.position.x = 0.55;
      group.rotation.y = -0.5;
      group.scale.setScalar(0.92);
      platformTimeline.current = gsap.timeline({ onUpdate: invalidate })
        .to(group.position, { x: 0, duration: 0.6, ease: 'power3.out' }, 0)
        .to(group.rotation, { y: 0, duration: 0.6, ease: 'power3.out' }, 0)
        .to(group.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power3.out' }, 0);
    } else if (group.visible) {
      platformTimeline.current = gsap.timeline({ onUpdate: invalidate, onComplete: () => { group.visible = false; invalidate(); } })
        .to(group.position, { x: -0.7, duration: 0.3, ease: 'power2.in' }, 0)
        .to(group.rotation, { y: 1.55, duration: 0.3, ease: 'power2.in' }, 0)
        .to(group.scale, { x: 0.82, y: 0.82, z: 0.82, duration: 0.3 }, 0);
    }
    return () => platformTimeline.current?.kill();
  }, [displayed, invalidate]);

  const imageKey = image?.imageUrl;
  const metadataKey = JSON.stringify(image);
  useEffect(() => {
    const state = resources.current;
    if (!state) return;
    timeline.current?.kill();
    const settle = () => {
      timeline.current = gsap.timeline({ onUpdate: invalidate })
        .to(rig.current.rotation, { y: 0, x: 0, z: 0, duration: reducedMotion ? 0 : 0.28, overwrite: true }, 0)
        .to(rig.current.position, { x: 0, y: 0, duration: reducedMotion ? 0 : 0.28, overwrite: true }, 0);
    };
    const markDisplayReady = () => {
      hasDisplay.current = true;
      if (compiled.current && !notified.current) { notified.current = true; callbacks.current.onReady?.(); }
    };
    if (!imageKey) {
      state.material.map = state.placeholder;
      shown.current = null;
      shownImage.current = null;
      state.pool.pin(null);
      callbacks.current.onScreenReady?.(null, imageKey);
      markDisplayReady();
      settle();
      invalidate();
      return;
    }
    state.pool.pin(shown.current, imageKey);
    const selection = createScreenLoader(url => state.pool.prepare(url), (selected, texture, isCurrent) => {
      if (resources.current !== state) return;
      const apply = () => {
        if (!isCurrent()) return;
        state.material.map = texture;
        state.pool.pin(imageKey);
        shown.current = imageKey;
        shownImage.current = image;
        shownStep.current = image.presentationStep ?? 0;
        callbacks.current.onScreenReady?.(image, imageKey);
        markDisplayReady();
        invalidate();
      };
      if (!shown.current || (shown.current === imageKey && shownStep.current === (image.presentationStep ?? 0)) || reducedMotion || !active || mode === 'chapter') { apply(); settle(); return; }
      timeline.current = animateScreenChange({ group: rig.current, apply, invalidate });
      regress();
    }, () => { callbacks.current.onScreenReady?.(shownImage.current, imageKey); markDisplayReady(); settle(); });
    selection.select(image);
    return () => { selection.dispose(); timeline.current?.kill(); gsap.killTweensOf(rig.current?.rotation); gsap.killTweensOf(rig.current?.position); };
  }, [imageKey, metadataKey, platform, reducedMotion, active, mode, invalidate, regress, camera, size.width, size.height]);

  // Only neighbors, sequentially; bounded GPU cache, not every admin upload.
  const urls = JSON.stringify(images.map(item => item.imageUrl));
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const pool = resources.current?.pool;
    const list = JSON.parse(urls);
    const index = list.indexOf(imageKey);
    (async () => {
      for (const url of list.slice(Math.max(0, index), Math.max(0, index) + 3)) {
        if (cancelled || !pool) break;
        await pool.prepare(url).catch(() => {});
      }
    })();
    return () => { cancelled = true; };
  }, [urls, imageKey, active]);

  useEffect(() => {
    // Fit the entire device in both axes even in a narrow/landscape container.
    camera.position.set(0, 0, Math.max(4.6, 2.1 / (size.width / size.height)));
    camera.fov = 40;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useImperativeHandle(ref, () => ({
    setProgress(progress) { pose.current.progress = progress; invalidate(); },
  }), [invalidate]);

  useFrame((_, delta) => {
    if (!active || !tilt.current) return;
    if (!reducedMotion && displayed) {
      floatTime.current += Math.min(delta, 0.05);
      const pose = samplePhoneFloat(floatTime.current, size.width < 400);
      floating.current.position.set(pose.x, pose.y, pose.z);
      floating.current.rotation.set(pose.rotationX, pose.rotationY, pose.rotationZ);
      invalidate();
    }
    const pointerPose = pointer.current;
    const x = reducedMotion ? 0 : pointerPose.y * 0.055;
    const y = reducedMotion ? 0 : pointerPose.x * 0.16;
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, x, 8, Math.min(delta, 0.05));
    tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, y, 8, Math.min(delta, 0.05));
    const p = reducedMotion ? 0 : pose.current.progress;
    tilt.current.position.y = mode === 'hero' ? -p * 0.12 : 0;
    tilt.current.rotation.z = mode === 'hero' ? -0.045 + p * 0.07 : -0.025;
    if (Math.abs(tilt.current.rotation.x - x) + Math.abs(tilt.current.rotation.y - y) > 0.0001) invalidate();
  });

  return <group ref={platformRig} visible={initiallyDisplayed.current}><group ref={floating}><group ref={tilt}><group ref={rig}><group rotation-y={config.front}><primitive object={model} dispose={null} /></group></group></group></group></group>;
});

export function StudioLights() {
  return <>
    <ambientLight intensity={0.8} />
    <directionalLight position={[4, 5, 6]} intensity={2.4} color="#fff8ed" />
    <directionalLight position={[-5, 1, 4]} intensity={1.45} color="#c2c9ff" />
    <Environment background={false} resolution={64} frames={1} environmentIntensity={0.8}>
      <Lightformer form="rect" intensity={4} position={[0, 4, 5]} scale={[5, 5, 1]} />
      <Lightformer form="rect" intensity={3} color="#c2c9ff" position={[-4, 1, 3]} rotation={[0, Math.PI / 3, 0]} scale={[3, 5, 1]} />
      <Lightformer form="rect" intensity={3} color="#b1ccff" position={[4, 2, -4]} rotation={[0, -Math.PI / 3, 0]} scale={[3, 5, 1]} />
    </Environment>
  </>;
}

export default IphoneScene;
