const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Add adminPass function and handleAdminLogin
const newJsTop = `
let adminPass = localStorage.getItem('adminPass') || '';

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPasswordInput').value;
    adminPass = pass;
    localStorage.setItem('adminPass', pass);
    document.getElementById('adminLockScreen').style.display = 'none';
    loadMetrics();
    loadClients();
}

function showAdminLock() {
    document.getElementById('adminLockScreen').style.display = 'flex';
    document.getElementById('adminPasswordInput').value = '';
    localStorage.removeItem('adminPass');
}

// Intercept fetch wrapper
async function adminFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers['x-admin-password'] = adminPass;
    
    const res = await fetch(url, options);
    if (res.status === 401) {
        document.getElementById('adminLockErrorMsg').classList.remove('hidden');
        showAdminLock();
        throw new Error('No autorizado');
    }
    return res;
}
`;

js = newJsTop + '\n' + js;

// 2. Replace all `fetch('/api/metrics'` and `fetch('/api/clients'` with `adminFetch(...)`
js = js.replace(/await fetch\(/g, 'await adminFetch(');
js = js.replace(/fetch\(/g, 'adminFetch('); // Just in case

// 3. Prevent init loading if no pass
js = js.replace(/loadMetrics\(\);\s*loadClients\(\);/g, `
    if (adminPass) {
        document.getElementById('adminLockScreen').style.display = 'none';
        loadMetrics();
        loadClients();
    } else {
        showAdminLock();
    }
`);

fs.writeFileSync('public/js/admin.js', js);
