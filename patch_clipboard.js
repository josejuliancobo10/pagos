const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Completely rewrite copyClientLink to use BOTH modern and legacy copy methods
const newCopyLink = `
window.copyClientLink = function(code, clientName) {
    try {
        const host = window.location.origin;
        const fullUrl = \`\${host}/?code=\${encodeURIComponent(code)}\`;
        
        // Legacy copy fallback (works everywhere)
        const fallbackCopy = () => {
            const el = document.createElement('textarea');
            el.value = fullUrl;
            document.body.appendChild(el);
            el.select();
            try {
                document.execCommand('copy');
                if (typeof showToast === 'function') showToast(\`¡Enlace copiado para \${clientName}!\`);
                else alert('Enlace copiado.');
            } catch (err) {
                prompt('Copia este enlace manualmente:', fullUrl);
            }
            document.body.removeChild(el);
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(fullUrl).then(() => {
                if (typeof showToast === 'function') showToast(\`¡Enlace copiado para \${clientName}!\`);
                else alert('Enlace copiado.');
            }).catch(e => {
                fallbackCopy();
            });
        } else {
            fallbackCopy();
        }
    } catch (err) {
        alert("Error copiando enlace: " + err.message);
    }
}
`;

// Replace the previous window.copyClientLink block
adminJs = adminJs.replace(/window\.copyClientLink = function\([\s\S]*?\}\s*?\n\s*(?=\n|\/\/)/, newCopyLink);


// Fix openEventModal to be global and robust
const newEventModal = `
window.openEventModal = function(calEvent = null) {
    try {
        const modal = document.getElementById('eventModal');
        if (!modal) return alert("Error: No se encontró la ventana del calendario.");
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        const select = document.getElementById('evClient');
        if (select) {
            select.innerHTML = '<option value="">-- Sin Cliente Específico --</option>';
            const clientsArray = window.allClients || (typeof allClients !== 'undefined' ? allClients : []);
            clientsArray.forEach(c => {
                select.innerHTML += \`<option value="\${c.id}">\${c.name}</option>\`;
            });
        }

        if (calEvent && calEvent.id) {
            document.getElementById('eventModalTitle').textContent = 'Editar Tarea/Gasto';
            document.getElementById('evId').value = calEvent.id || '';
            document.getElementById('evDate').value = calEvent.startStr || '';
            document.getElementById('evNotes').value = (calEvent.extendedProps && calEvent.extendedProps.notes) ? calEvent.extendedProps.notes : '';
            document.getElementById('evStatus').value = (calEvent.extendedProps && calEvent.extendedProps.status) ? calEvent.extendedProps.status : 'Pendiente';
            
            if (select) select.value = (calEvent.extendedProps && calEvent.extendedProps.client_id) ? calEvent.extendedProps.client_id : '';
            
            const btnDel = document.getElementById('btnDeleteEvent');
            if (btnDel) btnDel.classList.remove('hidden');
        } else {
            document.getElementById('eventModalTitle').textContent = 'Añadir Tarea/Gasto';
            const f = document.getElementById('eventForm');
            if (f) f.reset();
            document.getElementById('evId').value = '';
            
            const btnDel = document.getElementById('btnDeleteEvent');
            if (btnDel) btnDel.classList.add('hidden');
        }
    } catch (err) {
        alert("Error al abrir evento: " + err.message);
    }
}
`;

// Replace function openEventModal
adminJs = adminJs.replace(/function openEventModal\([\s\S]*?\}\s*?\n(?=\/\/|function|window)/, newEventModal);


fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js calendar and copy fixes applied");

// Modify admin.html to add a hardcoded version string to bust Vercel's edge cache FOR SURE
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html cache busted again");
