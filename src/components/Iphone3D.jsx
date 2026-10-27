import { Suspense, forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerspectiveCamera, View } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IphoneScene, { StudioLights } from "./IphoneScene";
import { DeviceScreen } from "./ProductPreview";
import { ContextEvents, SceneErrorBoundary, SharedPhoneCanvas } from "./PhoneCanvas";
import { useSite } from "../SiteContent";
import { useReducedMotion } from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const Iphone3D = forwardRef(function Iphone3D({ platform = 'ios', image: requestedImage, images = [], mode = 'showcase', onScreenReady, className = '' }, ref) {
  const shared = useContext(SharedPhoneCanvas);
  const image = useMemo(() => requestedImage, [JSON.stringify(requestedImage)]);
  const { screenshots } = useSite();
  const root = useRef(null);
  const history = useRef({});
  history.current[platform] = { image, images };
  const [preparedScreens, setPreparedScreens] = useState({});
  const models = useRef({});
  const pointer = useRef({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const [near, setNear] = useState(mode === 'hero');
  const [active, setActive] = useState(mode === 'hero');
  const [visible, setVisible] = useState(!document.hidden);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState({});
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState([platform]);
  const [displayed, setDisplayed] = useState(null);
  const [shown, setShown] = useState(null);
  const [maxDpr, setMaxDpr] = useState(window.innerWidth <= 700 ? 1.25 : 1.75);
  const progress = useRef(0);
  const failScene = useCallback(() => setFailed(true), []);
  const handleReady = useCallback(id => setReady(previous => previous[id] ? previous : { ...previous, [id]: true }), []);
  const handleError = useCallback(id => setErrors(previous => ({ ...previous, [id]: true })), []);
  const onScreen = useCallback((id, next, requestedUrl) => {
    const screen = next ? { ...next, platform: id } : null;
    setPreparedScreens(previous => ({ ...previous, [id]: { ...screen, requestedUrl } }));
    if (id !== platform) return;
    setShown(screen);
    onScreenReady?.(screen);
  }, [platform, onScreenReady]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setNear(true); setActive(true); return; }
    const observer = new IntersectionObserver(entries => {
      const intersects = entries.some(entry => entry.isIntersecting);
      if (intersects) setNear(true);
      setActive(intersects);
    }, { rootMargin: '120px' });
    observer.observe(root.current);
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    if (near && !reduced) shared?.enable();
  }, [near, reduced, shared]);

  useEffect(() => {
    const resize = () => setMaxDpr(window.innerWidth <= 700 ? 1.25 : 1.75);
    window.addEventListener('resize', resize, { passive: true });
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    setMounted(previous => previous.includes(platform) ? previous : [...previous, platform]);
    // Keep the previous model on screen until the next model has compiled.
    if (ready[platform] && (preparedScreens[platform]?.requestedUrl === image?.imageUrl || !image)) setDisplayed(platform);
    if (errors[platform]) onScreenReady?.(image || null);
  }, [platform, ready, errors, image, preparedScreens, onScreenReady]);

  useEffect(() => {
    if (reduced) { setReady({}); setPreparedScreens({}); setDisplayed(null); }
  }, [reduced]);

  useEffect(() => {
    if (!ready[platform] || reduced || mode !== 'hero') return;
    // Prepare the other GLB only after the primary scene has become usable.
    const warm = () => setMounted(['ios', 'android']);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 2200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 1200);
    return () => window.clearTimeout(id);
  }, [ready, platform, reduced, mode]);

  useEffect(() => {
    if (!near || reduced || mode !== 'hero') return;
    const trigger = ScrollTrigger.create({
      trigger: root.current.closest('.product-hero') || root.current,
      start: 'top top', end: 'bottom top',
      onUpdate: self => {
        progress.current = self.progress;
        Object.values(models.current).forEach(model => model?.setProgress(self.progress));
      },
    });
    return () => trigger.kill();
  }, [near, reduced, mode]);

  useImperativeHandle(ref, () => ({
    setProgress(value) { Object.values(models.current).forEach(model => model?.setProgress(value)); },
  }), []);

  const fallback = reduced || failed || errors[platform] || shared?.failed;
  useEffect(() => {
    if (fallback) onScreenReady?.(image ? { ...image, platform } : null);
  }, [fallback, image, platform, onScreenReady]);
  const sceneReady = ready[displayed] && !fallback;
  const tilt = event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointer.current = { x: (event.clientX - rect.left) / rect.width * 2 - 1, y: (event.clientY - rect.top) / rect.height * 2 - 1 };
    models.current[displayed]?.setProgress(progress.current);
  };
  const reset = () => {
    pointer.current = { x: 0, y: 0 };
    models.current[displayed]?.setProgress(progress.current);
  };
  const fallbackImage = shown && shown.platform === platform ? shown : image;
  const scene = <>
    <Suspense fallback={null}><StudioLights /></Suspense>
    {mounted.map(id => {
      const cached = history.current[id];
      const screens = id === platform ? images : screenshots(id);
      const selected = id === platform ? image : (screens.find(item => item.id === cached?.image?.id) || screens[0]);
      return <SceneErrorBoundary key={id} onError={() => handleError(id)}><Suspense fallback={null}>
        <IphoneScene ref={value => { models.current[id] = value; }} platform={id}
          image={selected} images={screens} mode={mode} pointer={pointer}
          active={active && visible && displayed === id} displayed={displayed === id}
          reducedMotion={reduced} onReady={() => handleReady(id)}
          onScreenReady={(next, requestedUrl) => onScreen(id, next, requestedUrl)} />
      </Suspense></SceneErrorBoundary>;
    })}
  </>;
  return <div ref={root} className={`phone-presentation ${sceneReady ? 'is-ready' : 'is-fallback'} ${className}`} onPointerMove={tilt} onPointerLeave={reset} role="img" aria-label={image?.altText || image?.title || 'Приложение «Инженер»'} data-device-platform={displayed} data-device-ready={Boolean(sceneReady)} data-screen-url={shown?.imageUrl || ""}>
    {!sceneReady && <div className="phone-static-fallback" aria-hidden="true">
      {fallbackImage ? <DeviceScreen image={fallbackImage} platform={platform} loading="eager" /> : <div className="phone-empty"><img src="/assets/app-icon.webp" width="64" height="64" alt="" /><span>Скриншоты пока не добавлены</span></div>}
    </div>}
    {near && !reduced && !failed && !shared?.failed && (shared ? (
      <View className="phone-shared-view" index={1}>
        <PerspectiveCamera makeDefault position={[0, 0, 4.8]} fov={40} near={0.1} far={30} />
        <group visible={Boolean(sceneReady)}>{scene}</group>
      </View>
    ) : <SceneErrorBoundary onError={failScene}><Canvas
      className="phone-webgl" frameloop="demand" dpr={[1, maxDpr]}
      camera={{ position: [0, 0, 4.8], fov: 40, near: 0.1, far: 30 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      onCreated={({ gl }) => gl.setClearColor(0, 0)}>
      <ContextEvents onLost={failScene} /><AdaptiveDpr />{scene}
    </Canvas></SceneErrorBoundary>)}
  </div>;
});

export default Iphone3D;
