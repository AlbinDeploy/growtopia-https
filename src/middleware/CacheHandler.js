const fs = require('fs');
const path = require('path');

const CacheHandler = (req, res, next) => {
    if (req.path.startsWith('/cache/')) {
        // Remove any compression-related headers
        res.removeHeader('Content-Encoding');
        res.removeHeader('Transfer-Encoding');

        // Try to get the actual file size for Content-Length
        const filePath = path.join(__dirname, '..', '..', 'public', req.path);
        let fileSize = null;
        try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                fileSize = stats.size;
            }
        } catch (err) {
            // File might not exist yet, that's okay
        }

        // Setting response headers
        const headers = {
            'Accept-Ranges': 'bytes',
            'Alt-Svc': 'quic=":443"; ma=93600; v="43"',
            'Cache-Control': 'max-age=31526583',
            'Content-Type': 'application/octet-stream',
            'Server': 'nginx',
            'ServerId': '02',
            'ServerLocation': 'apac',
            'X-Cache-Status': 'MISS',
            'Last-Modified': new Date().toUTCString(),
            'X-OpenStack-Request-Id': 'tx' + Math.random().toString(36).substring(2),
            'X-Timestamp': (Date.now() / 1000).toString(),
            'X-Trans-Id': 'tx' + Math.random().toString(36).substring(2)
        };

        // Set Content-Length if we know the file size
        // This helps the client know the full download size and prevents stuck downloads
        if (fileSize !== null) {
            headers['Content-Length'] = fileSize;
        }

        res.set(headers);

        // Set dynamic expiration date (1 year from now)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        res.set('Expires', expirationDate.toUTCString());
    }
    next();
};

module.exports = CacheHandler;
