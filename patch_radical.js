const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. We will expose a global function specifically for the table click
const globalHandler = `
window.handleTableClick = function(btn) {
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const code = btn.getAttribute('data-code');
    
    if (action === 'copy') {
        if (typeof copyClientLink === 'function') copyClientLink(code, name);
    }
    if (action === 'edit') {
        if (typeof openEditModal === 'function') openEditModal(parseInt(id));
    }
    if (action === 'delete') {
        if (typeof deleteClient === 'function') deleteClient(parseInt(id), name);
    }
    if (action === 'retry') {
        if (typeof retryPayment === 'function') retryPayment(parseInt(id), name);
    }
    if (action === 'cancel') {
        if (typeof cancelSubscriptionAdmin === 'function') cancelSubscriptionAdmin(parseInt(id), name);
    }
};
`;

if (!adminJs.includes('window.handleTableClick')) {
    adminJs = adminJs + '\n' + globalHandler;
}

// 2. Remove the DOMContentLoaded listener logic for tbody that might be failing
adminJs = adminJs.replace(/const tbody = document\.getElementById\('clientsTableBody'\);\s*if \(tbody\) \{\s*tbody\.addEventListener\('click', \(e\) => \{[\s\S]*?\}\);\s*\}/, '');

// 3. Remove the DOMContentLoaded listener for btnAddEvent
adminJs = adminJs.replace(/const btnAddEvent = document\.getElementById\('btnAddEvent'\);\s*if \(btnAddEvent\) \{\s*btnAddEvent\.addEventListener\('click', \(\) => openEventModal\(\)\);\s*\}/, '');

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js patched radically");

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

// 4. Bind onclick DIRECTLY on tbody in HTML
adminHtml = adminHtml.replace(/<tbody id="clientsTableBody" class="divide-y divide-outline-variant text-xs text-on-surface">/, '<tbody id="clientsTableBody" class="divide-y divide-outline-variant text-xs text-on-surface" onclick="window.handleTableClick(event.target.closest(\'button[data-action]\'))">');

// 5. Restore onclick to the Add Event button
adminHtml = adminHtml.replace(/<button id="btnAddEvent" class="bg-primary hover:bg-\[\#3d0291\] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">/, '<button id="btnAddEvent" onclick="if(typeof openEventModal === \'function\') openEventModal();" class="bg-primary hover:bg-[#3d0291] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">');


const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched radically");

