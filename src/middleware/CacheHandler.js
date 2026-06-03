const express = require('express');

const CacheHandler = (req, res, next) => {
    if (req.path.startsWith('/cache/')) {
        // Remove compression for cache files (important for speed)
        res.removeHeader('Content-Encoding');
        res.removeHeader('Transfer-Encoding');

        // Strong caching headers for fast repeated downloads
        res.set({
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000, immutable',  // 1 year, immutable
            'Content-Type': 'application/octet-stream',
            'Server': 'nginx',
            'X-Cache-Status': 'HIT',
            'Last-Modified': new Date().toUTCString(),
        });

        // Set long expiration
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        res.set('Expires', expirationDate.toUTCString());
    }
    next();
};

module.exports = CacheHandler;