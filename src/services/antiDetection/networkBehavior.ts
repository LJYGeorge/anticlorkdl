export function getNetworkConfig() {
  return {
    // 随机化请求头顺序
    headers: {
      randomize: true,
      additional: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1'
      }
    },
    // 模拟真实网络行为
    timing: {
      navigationStart: Date.now(),
      requestStart: Date.now() + Math.random() * 100,
      responseStart: Date.now() + Math.random() * 200,
      responseEnd: Date.now() + Math.random() * 300
    },
    // 模拟真实的资源加载顺序
    resourcePriority: {
      html: 'VeryHigh',
      css: 'High',
      script: 'Medium',
      image: 'Low',
      font: 'Low'
    }
  };
}