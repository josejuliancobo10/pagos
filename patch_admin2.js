const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

const target = `document.addEventListener('DOMContentLoaded', () => {
    fetchMetrics();
    fetchClients();
});`;

const replacement = `document.addEventListener('DOMContentLoaded', () => {
    if (adminPass) {
        document.getElementById('adminLockScreen').style.display = 'none';
        fetchMetrics();
        fetchClients();
    } else {
        showAdminLock();
    }
});`;

// Try exact replace or fallback to regex
if (js.includes("fetchMetrics();")) {
  js = js.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?\}\);/, replacement);
}

// Ensure the lock screen hides the content behind it in the HTML by setting the background to solid or hiding the main container
let html = fs.readFileSync('public/admin.html', 'utf8');
html = html.replace('bg-surface/85 backdrop-blur-sm', 'bg-[#F8FAFC]'); // solid background so they can't see the tables behind it!
fs.writeFileSync('public/admin.html', html);

fs.writeFileSync('public/js/admin.js', js);
