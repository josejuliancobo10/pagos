const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(/function copyClientLink\(code, clientName\) \{[\s\S]*?\}\n/m, `function copyClientLink(code, clientName) {
    const host = window.location.origin;
    const fullUrl = host + '/?code=' + encodeURIComponent(code);
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullUrl).then(() => {
            showToast('¡Enlace copiado para ' + clientName + '! (' + code + ')');
        }).catch(() => {
            prompt('Copia este enlace de suscripción para el cliente:', fullUrl);
        });
    } else {
        const el = document.createElement('textarea');
        el.value = fullUrl;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            showToast('¡Enlace copiado para ' + clientName + '! (' + code + ')');
        } catch(e) {
            prompt('Copia este enlace:', fullUrl);
        }
        document.body.removeChild(el);
    }
}
`);

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("copyClientLink fixed");
