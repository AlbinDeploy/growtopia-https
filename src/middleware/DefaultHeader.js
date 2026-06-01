// main function
const RequestLogger = async (req, res, next) => {
    // Setting the headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );

    // Base headers for all requests
    const headers = {
        'Server': 'nginx',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Expires': '-1',
        'Pragma': 'no-cache',
        'ETag': ''
    };

    // Only set Transfer-Encoding chunked for non-cache routes
    // Cache routes need Content-Length for proper file downloads
    if (!req.path.startsWith('/cache/')) {
        headers['Transfer-Encoding'] = 'chunked';
    }

    res.set(headers);

    // Longer timeout for cache/download routes (120s), normal for others (30s)
    if (req.path.startsWith('/cache/')) {
        req.setTimeout(120000);
        res.setTimeout(120000);
    } else {
        req.setTimeout(30000);
        res.setTimeout(30000);
    }

    // passing the request to the next handler
    next();
};

// exporting the middleware
module.exports = RequestLogger;
