const desktopAgents = {
  windows: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0'
  ],
  mac: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
  ],
  linux: [
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0'
  ]
};

const mobileAgents = {
  ios: [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPod touch; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  ],
  android: [
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 14; OnePlus 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  ]
};

const tvAgents = [
  'Mozilla/5.0 (SMART-TV; LINUX; Tizen 7.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/7.0 TV Safari/537.36',
  'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CrKey/1.54.248666'
];

const consoleAgents = [
  'Mozilla/5.0 (PlayStation; PlayStation 5/4.50) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (Nintendo Switch; WifiWebAuthApplet) AppleWebKit/601.6 (KHTML, like Gecko) NF/4.0.0.5.10 NintendoBrowser/5.1.0.13343',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox Series X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/44.18363.8131'
];

export function getDeviceUserAgent(deviceType) {
  if (deviceType === 'auto') {
    return getRandomUserAgent();
  }

  if (deviceType.startsWith('desktop-')) {
    const os = deviceType.split('-')[1];
    const agents = desktopAgents[os] || desktopAgents.windows;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  if (deviceType.startsWith('mobile-') || deviceType.startsWith('tablet-')) {
    const os = deviceType.split('-')[1];
    const agents = mobileAgents[os] || mobileAgents.android;
    return agents[Math.floor(Math.random() * agents.length)];
  }

  if (deviceType === 'tv-smart') {
    return tvAgents[Math.floor(Math.random() * tvAgents.length)];
  }

  if (deviceType === 'console-gaming') {
    return consoleAgents[Math.floor(Math.random() * consoleAgents.length)];
  }

  return getRandomUserAgent();
}

export function getRandomUserAgent() {
  const allAgents = [
    ...Object.values(desktopAgents).flat(),
    ...Object.values(mobileAgents).flat(),
    ...tvAgents,
    ...consoleAgents
  ];
  return allAgents[Math.floor(Math.random() * allAgents.length)];
}

export function generateFingerprint() {
  return {
    userAgent: getRandomUserAgent(),
    platform: ['Win32', 'MacIntel', 'Linux x86_64'][Math.floor(Math.random() * 3)],
    screenResolution: [
      [1920, 1080],
      [2560, 1440],
      [3840, 2160],
      [1366, 768],
      [1440, 900]
    ][Math.floor(Math.random() * 5)],
    colorDepth: [24, 30, 48][Math.floor(Math.random() * 3)],
    hardwareConcurrency: [4, 8, 12, 16][Math.floor(Math.random() * 4)]
  };
}