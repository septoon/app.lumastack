import {
  Component,
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import IphoneScene from "./IphoneScene";
import { SCREEN_TEXTURES } from "./iphoneConfig";

const MIN_LOADING_STATE_MS = 320;

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGL2RenderingContext && canvas.getContext("webgl2")
      || window.WebGLRenderingContext && canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

const Iphone3D = forwardRef(function Iphone3D(
  { mode, fallbackScreen = 0, onAnchorsChange, onReady, onUnavailable, className = "" },
  ref,
) {
  const canRender = useMemo(() => detectWebGL(), []);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!canRender);
  const [maxDpr, setMaxDpr] = useState(() => (window.innerWidth <= 700 ? 1.5 : 2));
  const onReadyRef = useRef(onReady);
  const revealFramesRef = useRef([]);
  const revealTimerRef = useRef(null);
  const scenePreparedRef = useRef(false);
  const loadingStartedAtRef = useRef(Date.now());

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const onResize = () => setMaxDpr(window.innerWidth <= 700 ? 1.5 : 2);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!canRender) onUnavailable?.();
  }, [canRender, onUnavailable]);

  useEffect(() => () => {
    revealFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
  }, []);

  const markUnavailable = () => {
    setFailed(true);
    onUnavailable?.();
  };

  const fallback = SCREEN_TEXTURES[fallbackScreen] || SCREEN_TEXTURES[0];
  const handleSceneReady = useCallback((details) => {
    if (scenePreparedRef.current) return;
    scenePreparedRef.current = true;
    onReadyRef.current?.(details);

    const poseFrame = window.requestAnimationFrame(() => {
      const revealFrame = window.requestAnimationFrame(() => {
        const elapsed = Date.now() - loadingStartedAtRef.current;
        const remaining = Math.max(0, MIN_LOADING_STATE_MS - elapsed);
        revealTimerRef.current = window.setTimeout(() => setReady(true), remaining);
      });
      revealFramesRef.current.push(revealFrame);
    });
    revealFramesRef.current.push(poseFrame);
  }, []);
  const statusClass = failed
    ? "has-3d-fallback"
    : ready
      ? "is-3d-ready"
      : "is-3d-loading";

  return (
    <div
      className={`iphone-canvas-shell ${statusClass} ${className}`.trim()}
      aria-busy={!ready && !failed}
    >
      <div className="iphone-model-loader" aria-hidden="true">
        {/* <span className="iphone-model-loader-device">
          <span />
        </span> */}
        <span className="iphone-model-loader-label">Загрузка</span>
      </div>
      <img className="iphone-canvas-fallback" src={fallback} alt="" aria-hidden="true" />
      {!failed ? (
        <SceneErrorBoundary onError={markUnavailable}>
          <Canvas
            className="iphone-canvas"
            aria-hidden="true"
            dpr={[1, maxDpr]}
            frameloop="demand"
            camera={{ position: [0, 0, 4.2], fov: 28, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              const canvas = gl.domElement;
              const onLost = (event) => {
                event.preventDefault();
                markUnavailable();
              };
              canvas.addEventListener("webglcontextlost", onLost, { once: true });
            }}
          >
            <Suspense fallback={null}>
              <IphoneScene
                ref={ref}
                mode={mode}
                initialScreen={fallbackScreen}
                onAnchorsChange={onAnchorsChange}
                onReady={handleSceneReady}
              />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>
      ) : null}
    </div>
  );
});

export default Iphone3D;
