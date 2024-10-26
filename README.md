# Website Resource Crawler

A modern web application for crawling and downloading website resources with configurable options and real-time progress tracking.

## Features

- 🚀 Modern UI with real-time progress tracking
- 📊 Resource statistics and type breakdown
- 🎯 Configurable crawling options
- 💾 Automatic resource downloading
- 📝 Real-time console logging
- 🔒 Anti-detection measures built-in

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Deployment Guide

### Prerequisites

- Node.js 18+ and npm 9+
- wget installed on the server
- Sufficient storage space for downloaded resources

### Server Deployment Steps

1. Build the project:
```bash
npm run build
```

2. Set up environment variables:
```bash
CRAWLER_SAVE_PATH=/path/to/save/resources
CRAWLER_MAX_CONCURRENT=5
```

3. Configure server storage:
```bash
# Create storage directory
mkdir -p /path/to/save/resources
# Set permissions
chmod 755 /path/to/save/resources
```

## FAQ

### General Questions

**Q: Where are the downloaded resources saved?**
A: Resources are saved in timestamped directories under the configured save path. By default, this is `/website_backup_[timestamp]` in the project directory.

**Q: Can I crawl any website?**
A: While technically possible, you should:
- Respect robots.txt rules
- Have permission to crawl the site
- Be mindful of rate limits
- Avoid crawling sensitive or protected content

**Q: How do I ensure resources are saved locally?**
A: The crawler automatically saves resources locally when:
1. "Download Resources" is enabled in settings
2. The save directory has proper write permissions
3. Sufficient disk space is available

### Technical Questions

**Q: How do I handle SSL/TLS certificates?**
A: The crawler automatically handles most certificates. For self-signed certificates, add them to your system's trust store.

**Q: What's the maximum crawl depth?**
A: The default maximum depth is 2 levels. You can adjust this up to 10 levels in the configuration panel. Higher depths may significantly increase crawl time.

**Q: How does anti-detection work?**
A: The crawler implements several measures:
- Random user agent rotation
- Geolocation spoofing
- Header customization
- Browser fingerprint randomization

### Troubleshooting

**Q: The crawler seems stuck**
A: Common solutions:
1. Check network connectivity
2. Verify target site is accessible
3. Ensure sufficient system resources
4. Check console for error messages
5. Try reducing max depth or resource types

**Q: Resources aren't downloading**
A: Verify:
1. wget is installed (`which wget`)
2. Write permissions exist
3. Disk space is available
4. "Download Resources" is enabled

**Q: High memory usage**
A: Try:
1. Reduce maximum crawl depth
2. Limit resource types
3. Enable incremental downloading
4. Increase system swap space

### Best Practices

1. **Resource Management**
   - Regularly clean up old crawl directories
   - Monitor disk space usage
   - Use appropriate depth limits

2. **Performance Optimization**
   - Enable only needed resource types
   - Use reasonable depth limits
   - Schedule large crawls during off-peak hours

3. **Legal Compliance**
   - Review target site's terms of service
   - Respect robots.txt directives
   - Maintain reasonable crawl rates
   - Store data securely

## Advanced Configuration

### Custom Headers

```javascript
{
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1'
}
```

### Resource Filters

```javascript
{
  includeImages: true,
  includeStyles: true,
  includeScripts: true,
  excludePatterns: [
    '*analytics*',
    '*tracking*'
  ]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.