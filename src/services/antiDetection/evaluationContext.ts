export function getEvaluationContext() {
  return `
    // Override property descriptors
    const overridePropertyDescriptor = (obj, prop, valueFactory) => {
      Object.defineProperty(obj, prop, {
        get: () => valueFactory(),
        enumerable: true,
        configurable: true
      });
    };

    // Override navigator properties
    const originalNavigator = navigator;
    const navigatorHandler = {
      get: (target, prop) => {
        if (prop === 'webdriver') return undefined;
        if (prop === 'plugins') return [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'chrome-pdf-viewer' },
          { name: 'Native Client', filename: 'native-client' }
        ];
        return target[prop];
      }
    };
    window.navigator = new Proxy(originalNavigator, navigatorHandler);

    // Override permissions
    const originalPermissions = window.Permissions;
    window.Permissions = new Proxy(originalPermissions, {
      get: (target, prop) => {
        if (prop === 'query') {
          return async () => ({ state: 'prompt' });
        }
        return target[prop];
      }
    });

    // Override WebGL
    const getParameterProxyHandler = {
      apply: (target, thisArg, args) => {
        const param = args[0];
        const vendorStrings = {
          0x1F00: 'Mesa DRI Intel(R) HD Graphics 520 (Skylake GT2)',
          0x1F01: 'Mesa',
          0x9245: 'WebKit',
          0x9246: 'WebKit WebGL'
        };
        return vendorStrings[param] || target.apply(thisArg, args);
      }
    };

    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = new Proxy(
      originalGetParameter,
      getParameterProxyHandler
    );
  `;
}