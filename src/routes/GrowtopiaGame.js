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
type2|${cnf.type2 ? "1" : "0"}`;

    // Add beta servers (up to 3)
    if (cnf.beta_servers && cnf.beta_servers.length > 0) {
        cnf.beta_servers.forEach((beta, index) => {
            const num = index + 1;
            content += `
beta_server${num}|${beta.server}
beta_loginurl${num}|${beta.loginurl}
beta_port${num}|${beta.port}
beta_type${num}|${beta.type}`;
        });
    }

    content += `
meta|${cnf.meta}`;

    // Maintenance message
    if (cnf.maintenance_mode) {
        content += `
#maint|Server is under maintenance. We will be back online shortly. Thank you for your patience!`;
    }

    // Update required / error
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