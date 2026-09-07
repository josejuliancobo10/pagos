const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace specific onclicks
adminJs = adminJs.replace(/onclick="copyClientLink\('\$\{client\.access_code\}', '\$\{escapeHtml\(client\.name\)\}'\)"/g, 'data-action="copy" data-code="${client.access_code}" data-name="${escapeHtml(client.name)}"');
adminJs = adminJs.replace(/onclick="retryPayment\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)"/g, 'data-action="retry" data-id="${client.id}" data-name="${escapeHtml(client.name)}"');
adminJs = adminJs.replace(/onclick="cancelSubscriptionAdmin\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)"/g, 'data-action="cancel" data-id="${client.id}" data-name="${escapeHtml(client.name)}"');
adminJs = adminJs.replace(/onclick="openEditModal\(\$\{client\.id\}\)"/g, 'data-action="edit" data-id="${client.id}"');
adminJs = adminJs.replace(/onclick="deleteClient\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)"/g, 'data-action="delete" data-id="${client.id}" data-name="${escapeHtml(client.name)}"');

// 2. Add event delegation to DOMContentLoaded
const delegationCode = "    const tbody = document.getElementById('clientsTableBody');\n" +
"    if (tbody) {\n" +
"        tbody.addEventListener('click', (e) => {\n" +
"            const btn = e.target.closest('button[data-action]');\n" +
"            if (!btn) return;\n" +
"            \n" +
"            const action = btn.getAttribute('data-action');\n" +
"            const id = btn.getAttribute('data-id');\n" +
"            const name = btn.getAttribute('data-name');\n" +
"            const code = btn.getAttribute('data-code');\n" +
"            \n" +
"            if (action === 'copy') copyClientLink(code, name);\n" +
"            if (action === 'edit') openEditModal(parseInt(id));\n" +
"            if (action === 'delete') deleteClient(parseInt(id), name);\n" +
"            if (action === 'retry') retryPayment(parseInt(id), name);\n" +
"            if (action === 'cancel') cancelSubscriptionAdmin(parseInt(id), name);\n" +
"        });\n" +
"    }\n";

// Insert it into the DOMContentLoaded block if not already there
if (!adminJs.includes("tbody.addEventListener('click'")) {
    adminJs = adminJs.replace(/fetchClients\(\);\n\s*\}/, "fetchClients();\n" + delegationCode + "\n}");
}

// 3. Fix calendar add event button
const calendarDelegation = "    const btnAddEvent = document.getElementById('btnAddEvent');\n" +
"    if (btnAddEvent) {\n" +
"        btnAddEvent.addEventListener('click', () => openEventModal());\n" +
"    }\n";

if (!adminJs.includes("btnAddEvent.addEventListener('click'")) {
    adminJs = adminJs.replace(/if\(f\) f\.addEventListener\('submit', saveEvent\);\n\s*\}/, "if(f) f.addEventListener('submit', saveEvent);\n" + calendarDelegation + "\n}");
}

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js refactored to use event delegation");

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
adminHtml = adminHtml.replace(/<button onclick="openEventModal\(\)" class="bg-primary hover:bg-\[\#3d0291\] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">/, '<button id="btnAddEvent" class="bg-primary hover:bg-[#3d0291] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">');

const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/, '<script src="/js/admin.js?v=' + version + '"></script>');
fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched for event delegation");
