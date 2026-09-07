const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace window.copyClientLink = function(code, clientName) { ... } with function copyClientLink(code, clientName) { ... }
adminJs = adminJs.replace(/window\.copyClientLink = function\s*\((.*?)\)\s*\{/, 'function copyClientLink($1) {');

// Replace window.openEditModal = function(clientId) { ... } with function openEditModal(clientId) { ... }
adminJs = adminJs.replace(/window\.openEditModal = function\s*\((.*?)\)\s*\{/, 'function openEditModal($1) {');

// Replace window.closeEditModal = function() { ... }
adminJs = adminJs.replace(/window\.closeEditModal = function\s*\(\)\s*\{/, 'function closeEditModal() {');

// Replace window.handleUpdateClient = async function(event) { ... }
adminJs = adminJs.replace(/window\.handleUpdateClient = async function\s*\((.*?)\)\s*\{/, 'async function handleUpdateClient($1) {');

// Replace window.openEventModal = function(calEvent = null) { ... }
adminJs = adminJs.replace(/window\.openEventModal = function\s*\((.*?)\)\s*\{/, 'function openEventModal($1) {');

fs.writeFileSync('public/js/admin.js', adminJs);

console.log("Functions reverted to standard declarations.");

// Let's also bust the cache in admin.html just to be sure.
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml);
console.log("Cache busted in admin.html");
