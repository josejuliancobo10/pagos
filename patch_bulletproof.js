const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Update renderClientsTable to use data-* attributes
adminJs = adminJs.replace(
    /onclick="copyClientLink\('\$\{client\.access_code\}', '\$\{escapeHtml\(client\.name\)\}'\)"/g,
    `onclick="copyClientLink(this)" data-code="\${client.access_code}" data-name="\${escapeHtml(client.name)}"`
);

adminJs = adminJs.replace(
    /onclick="openEditModal\(\$\{client\.id\}\)"/g,
    `onclick="openEditModal(this)" data-id="\${client.id}"`
);

// Update copyClientLink to use the button element
adminJs = adminJs.replace(
    /function copyClientLink\(code, clientName\) \{/,
    `function copyClientLink(btn) {
    var code = btn.getAttribute('data-code');
    var clientName = btn.getAttribute('data-name');`
);

// Update openEditModal to use the button element
adminJs = adminJs.replace(
    /function openEditModal\(clientId\) \{/,
    `function openEditModal(btn) {
    var clientId = parseInt(btn.getAttribute('data-id'), 10);`
);

// Update openEventModal to remove default param
adminJs = adminJs.replace(
    /function openEventModal\(calEvent = null\) \{/,
    `function openEventModal(calEvent) {`
);

// Remove arrow function for fallbackCopy
adminJs = adminJs.replace(
    /const fallbackCopy = \(\) => \{/,
    `var fallbackCopy = function() {`
);

fs.writeFileSync('public/js/admin.js', adminJs, 'utf8');
console.log('Bulletproof JS applied.');
