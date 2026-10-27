import gsap from 'gsap';

export function samplePhoneFloat(time, compact = false) {
  const amplitude = compact ? 0.55 : 1;
  return {
    x: Math.sin(time * 0.43) * 0.025 * amplitude,
    y: Math.sin(time * 0.68) * 0.06 * amplitude,
    z: Math.cos(time * 0.37) * 0.018 * amplitude,
    rotationX: Math.sin(time * 0.51) * 0.028 * amplitude,
    rotationY: Math.sin(time * 0.39) * 0.06 * amplitude,
    rotationZ: Math.cos(time * 0.47) * 0.018 * amplitude,
  };
}

export function animateScreenChange({ group, apply, invalidate }) {
  return gsap.timeline({ onUpdate: invalidate })
    .to(group.rotation, { y: 1.47, x: -0.035, z: -0.035, duration: 0.24, ease: 'power2.inOut' })
    .call(apply)
    .to(group.rotation, { y: 0, x: 0, z: 0, duration: 0.38, ease: 'power3.out' });
}
