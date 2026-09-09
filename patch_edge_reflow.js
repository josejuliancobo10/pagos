const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

const reflowHack = `
    // Force complete reflow to fix Edge hit-testing bug with dynamic innerHTML
    tbody.style.display = 'none';
    void tbody.offsetHeight;
    tbody.style.display = '';
}
`;

// Replace the end of renderClientsTable
adminJs = adminJs.replace(/\s*\}\s*function fetchMetrics\(\) \{/, reflowHack + '\n\nasync function fetchMetrics() {');

// Just to be sure the regex works, let's do it safer:
adminJs = adminJs.replace(/tbody\.innerHTML = clients\.map\([\s\S]*?\}\s*//g, function(match) {
    // Wait, regex might be brittle. Let's do a direct replace of the end of renderClientsTable.
    return match;
});
