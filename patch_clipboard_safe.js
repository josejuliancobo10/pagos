const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

const oldFunc = `function copyClientLink(code, clientName) {
    const host = window.location.origin;
    const fullUrl = \`\${host}/?code=\${encodeURIComponent(code)}\`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
        showToast(\`¡Enlace copiado para \${clientName}! (\${code})\`);
    }).catch(() => {
        prompt('Copia este enlace de suscripción para el cliente:', fullUrl);
    });
}`;

const newFunc = `function copyClientLink(code, clientName) {
    const host = window.location.origin;
    const fullUrl = host + '/?code=' + encodeURIComponent(code);
    
    const fallbackCopy = () => {
        const el = document.createElement('textarea');
        el.value = fullUrl;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            showToast('¡Enlace copiado para ' + clientName + '! (' + code + ')');
        } catch(err) {
            prompt('Copia este enlace manualmente:', fullUrl);
        }
        document.body.removeChild(el);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullUrl).then(() => {
            showToast('¡Enlace copiado para ' + clientName + '! (' + code + ')');
        }).catch(() => fallbackCopy());
    } else {
        fallbackCopy();
    }
}`;

adminJs = adminJs.replace(oldFunc, newFunc);
fs.writeFileSync('public/js/admin.js', adminJs);
