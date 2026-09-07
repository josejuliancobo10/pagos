const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(/window\.handleTableClick = function\(btn\) \{/, `window.handleTableClick = function(btn) {
    try {`);
adminJs = adminJs.replace(/if \(action === 'cancel'\) \{\s*if \(typeof cancelSubscriptionAdmin === 'function'\) cancelSubscriptionAdmin\(parseInt\(id\), name\);\s*\}/, `if (action === 'cancel') {
        if (typeof cancelSubscriptionAdmin === 'function') cancelSubscriptionAdmin(parseInt(id), name);
    }
    } catch (err) {
        alert("CRITICAL ERROR IN CLICK HANDLER: " + err.message);
    }`);

fs.writeFileSync('public/js/admin.js', adminJs);
