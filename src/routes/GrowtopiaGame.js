// importing the necessary modules
const path = require('path');
const cnf = require(path.join(__dirname, '..', '..', 'Config.js'));
const express = require('express');
const router = express.Router();

// === Maintenance & Update Settings ===
// Set MAINTENANCE_MODE = true to show maintenance message to players
const MAINTENANCE_MODE = false;

// Set UPDATE_REQUIRED = true to force players to update their client
const UPDATE_REQUIRED = false;
const REQUIRED_VERSION = "5.48"; // example version

router.post('/server_data.php', function (req, res) {
    let content = `server|${cnf.server_ip}
port|${cnf.server_port}
type|1
loginurl|${cnf.loginurl}
type2|${cnf.type2 ? "1" : "0"}
meta|${cnf.meta}`;

    if (MAINTENANCE_MODE) {
        content += `
#maint|Server is under maintenance. We will be back online shortly. Thank you for your patience!`;
    }

    if (UPDATE_REQUIRED) {
        content += `
#maint|Update is now available for your device!
error|1000|Update is now available for your device. (Required ${REQUIRED_VERSION} or higher)`;
    }

    content += `
RTENDMARKERBS1001`;

    res.send(content);
});

// exporting the router
module.exports = router;