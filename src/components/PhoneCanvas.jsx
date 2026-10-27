import { Component, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, View } from '@react-three/drei';

export const SharedPhoneCanvas = createContext(null);

export class SceneErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function ContextEvents({ onLost }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onLost, { once: true });
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl, onLost]);
  return null;
}

function ClearViews() {
  const invalidate = useThree(state => state.invalidate);
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  useEffect(() => {
    // A demand canvas must follow the DOM even while the models are paused.
    const refresh = () => invalidate();
    window.addEventListener('scroll', refresh, { passive: true });
    return () => window.removeEventListener('scroll', refresh);
  }, [invalidate]);
  return null;
}

// Each chapter uses a scissored View in ONE renderer, with its own scene/camera.
export default function PhoneCanvas({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const enable = useCallback(() => setEnabled(true), []);
  const fail = useCallback(() => setFailed(true), []);
  const context = useMemo(() => ({ enable, failed }), [enable, failed]);
  return <SharedPhoneCanvas.Provider value={context}>
    {children}
    {enabled && !failed && <SceneErrorBoundary onError={fail}>
      <Canvas className="feature-phone-canvas" frameloop="demand" dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
        onCreated={({ gl }) => gl.setClearColor(0, 0)}>
        <ContextEvents onLost={fail} /><AdaptiveDpr /><ClearViews /><View.Port />
      </Canvas>
    </SceneErrorBoundary>}
  </SharedPhoneCanvas.Provider>;
}
