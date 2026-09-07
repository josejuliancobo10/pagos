const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(
    /function copyClientLink\(btn\) \{[\s\S]*?var code = btn\.getAttribute\('data-code'\);[\s\S]*?var clientName = btn\.getAttribute\('data-name'\);/,
    `function copyClientLink(btnOrCode, optionalName) {
    var code = typeof btnOrCode === 'string' ? btnOrCode : btnOrCode.getAttribute('data-code');
    var clientName = typeof btnOrCode === 'string' ? optionalName : btnOrCode.getAttribute('data-name');`
);

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('copyClientLink handles both now.');
