const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace inline onclicks with classes
adminJs = adminJs.replace(/onclick="copyClientLink\(this\)"/g, 'class="btn-copy p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center"');
adminJs = adminJs.replace(/onclick="retryPayment\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)"/g, 'data-id="${client.id}" class="btn-retry p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors inline-flex items-center"');
adminJs = adminJs.replace(/onclick="cancelSubscriptionAdmin\(\$\{client\.id\}, '\$\{escapeHtml\(client\.name\)\}'\)"/g, 'data-id="${client.id}" class="btn-cancel p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center"');
adminJs = adminJs.replace(/onclick="openEditModal\(\$\{client\.id\}\)"/g, 'data-id="${client.id}" class="btn-edit px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors inline-flex items-center gap-2"');

// Wait! In the copy button replace I replaced 'class=' with the full class list? 
// The original was: class="p-2 text-slate-400... 
// So if I replace `onclick="copyClientLink(this)" class="p-2 text-slate-400..."` it will duplicate classes if I am not careful.
