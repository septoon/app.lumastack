export const FRONT_ROTATION_Y = Math.PI;
export const HALF_TURN = Math.PI;
export const FULL_TURN = Math.PI * 2;

// scene.glb is the compressed source iPhone, NOT an Android model.
export const DEVICE_MODELS = {
  ios: { url: '/models/iphone.glb', screen: 'Screen', front: Math.PI, ratio: 7.1275 / 15.403 },
  android: { url: '/models/samsung.glb', screen: 'Screen_Screen_0', front: Math.PI, planarUV: true },
};
