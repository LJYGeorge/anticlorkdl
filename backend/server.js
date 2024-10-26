import express from 'express';
import { chromium } from '@playwright/test';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createStealthBrowser, setupNetworkInterception } from './services/antiDetection.js';
import { getDeviceUserAgent } from './utils/userAgents.js';
import { getLocationCoords } from './utils/locations.js';
import cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// 存储SSE客户端连接
const clients = new Set();

// 资源存储路径
const SAVE_DIR = process.env.CRAWLER_SAVE_PATH || path.join(__dirname, 'downloads');

// 确保下载目录存在
fs.mkdirSync(SAVE_DIR, { recursive: true });

// 工具函数：创建本地路径
function createLocalPath(resourceUrl, baseDir) {
  try {
    const urlObj = new URL(resourceUrl);
    const localPath = path.join(baseDir, urlObj.hostname, urlObj.pathname);
    const dir = path.dirname(localPath);
    
    fs.mkdirSync(dir, { recursive: true });
    return localPath;
  } catch (error) {
    console.error('Error creating local path:', error);
    return null;
  }
}

// 工具函数：修改HTML中的资源路径
function updateResourcePaths(html, resources) {
  const $ = cheerio.load(html);
  
  $('img').each((_, elem) => {
    const src = $(elem).attr('src');
    if (src) {
      const resource = resources.find(r => r.url === src);
      if (resource) {
        $(elem).attr('src', resource.localPath);
      }
    }
  });

  $('link[rel="stylesheet"]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (href) {
      const resource = resources.find(r => r.url === href);
      if (resource) {
        $(elem).attr('href', resource.localPath);
      }
    }
  });

  $('script').each((_, elem) => {
    const src = $(elem).attr('src');
    if (src) {
      const resource = resources.find(r => r.url === src);
      if (resource) {
        $(elem).attr('src', resource.localPath);
      }
    }
  });

  return $.html();
}

// 爬虫状态端点
app.get('/api/crawl-status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const clientId = Date.now();
  clients.add(res);
  
  req.on('close', () => {
    clients.delete(res);
  });
});

// 爬虫主端点
app.post('/api/crawl', async (req, res) => {
  const { url, config } = req.body;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const crawlDir = path.join(SAVE_DIR, `crawl_${timestamp}`);
  const resources = new Set();

  try {
    const { browser, context } = await createStealthBrowser({
      browserProfile: config.antiDetection.browserProfile,
      userAgent: config.antiDetection.device === 'auto' 
        ? undefined 
        : getDeviceUserAgent(config.antiDetection.device),
      locale: 'en-US',
      timezone: 'America/New_York',
      geolocation: config.antiDetection.location !== 'auto'
        ? getLocationCoords(config.antiDetection.location)
        : undefined,
      proxy: config.proxy.enabled ? {
        server: `${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`,
        username: config.proxy.username,
        password: config.proxy.password
      } : undefined
    });

    try {
      const page = await context.newPage();
      await setupNetworkInterception(page, config);

      page.on('request', async request => {
        const resourceUrl = request.url();
        if (resourceUrl === url) return;

        const resourceType = request.resourceType();
        
        if (
          (resourceType === 'image' && !config.includeImages) ||
          (resourceType === 'stylesheet' && !config.includeStyles) ||
          (resourceType === 'script' && !config.includeScripts)
        ) {
          return;
        }

        const localPath = createLocalPath(resourceUrl, crawlDir);
        if (!localPath) return;

        const resource = {
          url: resourceUrl,
          type: resourceType,
          status: 'downloading',
          size: 0,
          localPath
        };

        resources.add(resource);
        
        clients.forEach(client => {
          client.write(`data: ${JSON.stringify({ resource })}\n\n`);
        });
      });

      page.on('requestfinished', async request => {
        const response = await request.response();
        if (!response) return;

        const resourceUrl = request.url();
        const resource = Array.from(resources).find(r => r.url === resourceUrl);
        if (!resource) return;

        try {
          const buffer = await response.body();
          resource.size = buffer.length;
          resource.status = 'downloaded';

          if (config.downloadResources) {
            await fs.promises.writeFile(resource.localPath, buffer);
          }

          clients.forEach(client => {
            client.write(`data: ${JSON.stringify({ resource })}\n\n`);
          });
        } catch (error) {
          console.error(`Failed to process resource ${resourceUrl}:`, error);
          resource.status = 'error';
          resource.error = error.message;
        }
      });

      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response.ok()) {
        throw new Error(`Failed to load page: ${response.statusText()}`);
      }

      let html = await page.content();
      
      if (config.downloadResources) {
        html = updateResourcePaths(html, Array.from(resources));
        const indexPath = path.join(crawlDir, 'index.html');
        await fs.promises.writeFile(indexPath, html);
      }

      res.json({ 
        success: true,
        savePath: crawlDir,
        resourceCount: resources.size
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Crawling error:', error);
    res.status(500).json({ 
      error: error.message 
    });
    
    clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    });
  } finally {
    clients.forEach(client => client.end());
    clients.clear();
  }
});

// 代理测试端点
app.post('/api/proxy/test', async (req, res) => {
  const config = req.body;
  try {
    const browser = await chromium.launch({
      proxy: {
        server: `${config.protocol}://${config.host}:${config.port}`,
        username: config.username,
        password: config.password
      }
    });
    
    const page = await browser.newPage();
    const ipCheckResponse = await page.goto('https://api.ipify.org?format=json');
    const ipData = await ipCheckResponse.json();
    
    await browser.close();
    
    res.json({
      isValid: true,
      ip: ipData.ip,
      lastChecked: new Date()
    });
  } catch (error) {
    res.status(500).json({
      isValid: false,
      error: error.message,
      lastChecked: new Date()
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});