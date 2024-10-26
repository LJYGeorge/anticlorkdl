import { chromium } from '@playwright/test';
import { getBrowserFingerprint } from './browserFingerprint.js';
import { getEvaluationContext } from './evaluationContext.js';
import { getNetworkConfig } from './networkBehavior.js';

export async function createStealthBrowser(config) {
  const fingerprint = getBrowserFingerprint(config.browserProfile);
  const networkConfig = getNetworkConfig();
  
  // 启动配置
  const launchOptions = {
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--disable-web-security',
      '--disable-gpu',
      `--window-size=${fingerprint.screen.width},${fingerprint.screen.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-remote-fonts',
      '--disable-domain-reliability',
      '--disable-component-extensions-with-background-pages',
      '--disable-client-side-phishing-detection',
      '--disable-default-apps',
      '--disable-breakpad',
      '--disable-sync',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain',
      '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'
    ]
  };

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    userAgent: config.userAgent,
    viewport: {
      width: fingerprint.screen.width,
      height: fingerprint.screen.height
    },
    colorScheme: 'light',
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    javaScriptEnabled: true,
    locale: config.locale || 'en-US',
    timezoneId: config.timezone || 'America/New_York',
    geolocation: config.geolocation,
    permissions: ['geolocation'],
    extraHTTPHeaders: networkConfig.headers.additional
  });

  // 注入反检测脚本
  await context.addInitScript({
    content: `
      ${getEvaluationContext()}
      
      // 随机化 WebGL 参数
      const randomizeWebGL = () => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) return;
        
        const getParameter = gl.getParameter.bind(gl);
        gl.getParameter = function(parameter) {
          if (parameter === 37445) {
            return '${fingerprint.webgl.vendor}';
          }
          if (parameter === 37446) {
            return '${fingerprint.webgl.renderer}';
          }
          return getParameter(parameter);
        };
      };
      
      // 添加 Canvas 噪点
      const addCanvasNoise = () => {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type) {
          const context = this.getContext('2d');
          if (context && ${fingerprint.canvas.useNoise}) {
            const imageData = context.getImageData(0, 0, this.width, this.height);
            const pixels = imageData.data;
            for (let i = 0; i < pixels.length; i += 4) {
              const noise = Math.random() * ${fingerprint.canvas.noise};
              pixels[i] = pixels[i] * (1 + noise);
              pixels[i + 1] = pixels[i + 1] * (1 + noise);
              pixels[i + 2] = pixels[i + 2] * (1 + noise);
            }
            context.putImageData(imageData, 0, 0);
          }
          return originalToDataURL.apply(this, arguments);
        };
      };
      
      // 模拟人类行为
      const simulateHumanBehavior = () => {
        // 随机鼠标移动
        let lastX = 0, lastY = 0;
        document.addEventListener('mousemove', function(e) {
          const now = Date.now();
          const velocity = Math.sqrt(
            Math.pow(e.clientX - lastX, 2) + 
            Math.pow(e.clientY - lastY, 2)
          ) / (now - lastTime);
          
          // 检测不自然的鼠标移动
          if (velocity > 10) {
            e.stopPropagation();
            return;
          }
          
          lastX = e.clientX;
          lastY = e.clientY;
          lastTime = now;
        }, true);
        
        // 随机滚动行为
        let lastScrollTime = Date.now();
        window.addEventListener('scroll', function(e) {
          const now = Date.now();
          const scrollVelocity = Math.abs(
            window.scrollY - lastScrollY
          ) / (now - lastScrollTime);
          
          // 检测不自然的滚动
          if (scrollVelocity > 5) {
            e.stopPropagation();
            return;
          }
          
          lastScrollY = window.scrollY;
          lastScrollTime = now;
        }, true);
      };
      
      // 执行所有反检测措施
      randomizeWebGL();
      addCanvasNoise();
      simulateHumanBehavior();
    `
  });

  return { browser, context };
}

export async function setupNetworkInterception(page, config) {
  await page.route('**/*', async (route) => {
    const request = route.request();
    
    // 随机化请求头顺序
    const headers = { ...request.headers() };
    const orderedHeaders = {};
    Object.keys(headers)
      .sort(() => Math.random() - 0.5)
      .forEach(key => {
        orderedHeaders[key] = headers[key];
      });

    // 添加随机延迟
    await new Promise(resolve => 
      setTimeout(resolve, Math.random() * 100 + 50)
    );

    // 继续请求
    await route.continue({
      headers: orderedHeaders
    });
  });
}