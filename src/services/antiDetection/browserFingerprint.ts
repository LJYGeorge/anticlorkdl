import type { BrowserProfile } from '../../types/crawler';

export function getBrowserFingerprint(profile: BrowserProfile) {
  const fingerprints = {
    standard: {
      webgl: {
        vendor: 'Google Inc. (NVIDIA)',
        renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      },
      canvas: {
        noise: 0.1,
        useNoise: true,
      },
      screen: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      }
    },
    stealth: {
      webgl: {
        vendor: 'Intel Inc.',
        renderer: 'Intel Iris OpenGL Engine',
      },
      canvas: {
        noise: 0.2,
        useNoise: true,
      },
      screen: {
        width: 1440,
        height: 900,
        colorDepth: 30,
      }
    },
    maximum: {
      webgl: {
        vendor: 'Apple',
        renderer: 'Apple M1',
      },
      canvas: {
        noise: 0.3,
        useNoise: true,
      },
      screen: {
        width: 2560,
        height: 1600,
        colorDepth: 30,
      }
    }
  };

  return fingerprints[profile] || fingerprints.standard;
}