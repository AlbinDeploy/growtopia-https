// importing the necessary modules
const path = require('path');
const cnf = require(path.join(__dirname, '..', '..', 'Config.js'));
const express = require('express');
const router = express.Router();

router.post('/server_data.php', function (req, res) {
    let content = `server|${cnf.server_ip}
port|${cnf.server_port}
type|1
loginurl|${cnf.loginurl}
type2|${cnf.type2 ? "1" : "0"}
meta|${cnf.meta}`;

    // Maintenance Mode
    if (cnf.maintenance_mode) {
        content += `
#maint|Server is under maintenance. We will be back online shortly. Thank you for your patience!`;
    }

    // Force Update
    if (cnf.update_required) {
        content += `
#maint|Update is now available for your device!
error|1000|Update is now available for your device. (Required ${cnf.required_version} or higher)`;
    }

    content += `
RTENDMARKERBS1001`;

    res.send(content);
});

// exporting the router
module.exports = router;