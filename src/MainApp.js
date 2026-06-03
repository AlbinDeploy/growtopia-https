// importing required modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const bodyParser = require('body-parser');

// creating an express app
const app = express();

// ==================== FINAL HIGH-PERFORMANCE CACHE SERVER ====================
// This handler runs BEFORE almost everything else for /cache requests
// It uses raw fs streaming to achieve maximum download speed
app.use((req, res, next) => {
    if (!req.url.startsWith('/cache/')) {
        return next();
    }

    // Build safe file path
    const requestedPath = req.url.replace('/cache/', '');
    const filePath = path.join(__dirname, '..', 'public', 'cache', requestedPath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '..', 'public', 'cache'))) {
        return res.status(403).end();
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404).end();
        }

        // Set optimal headers for fast caching
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
        res.setHeader('Last-Modified', stats.mtime.toUTCString());
        res.setHeader('X-Cache-Status', 'HIT');
        res.setHeader('Server', 'nginx');

        // Remove any compression headers
        res.removeHeader('Content-Encoding');
        res.removeHeader('Transfer-Encoding');

        // Stream the file (most efficient way)
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);

        stream.on('error', () => {
            if (!res.headersSent) res.status(500).end();
        });
    });
});

// ==================== NORMAL MIDDLEWARE (only for non-cache routes) ====================
app.use(require(path.join(__dirname, 'middleware', 'DefaultHeader.js')));
app.use(require(path.join(__dirname, 'middleware', 'Compression.js')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(require(path.join(__dirname, 'middleware', 'CacheHandler.js')));

// security middlewares
app.use(require(path.join(__dirname,'security', 'IPBlacklist.js')));
app.use(require(path.join(__dirname,'security', 'RequestSizeLimiter.js')));
app.use(require(path.join(__dirname,'security', 'RateLimiter.js')));
app.use(require(path.join(__dirname,'security', 'XssProtection.js')));

// routes
app.use('/', require(path.join(__dirname,'routes', 'IndexRoute.js')));
app.use('/player', require(path.join(__dirname,'routes', 'PlayerSupport.js')));
app.use('/growtopia', require(path.join(__dirname,'routes', 'GrowtopiaGame.js')));

// general static (non-cache)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 404
app.use((req, res) => {
    res.sendStatus(200);
});

// error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(200).send('Internal Server Error');
});

module.exports = app;