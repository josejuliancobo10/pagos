const fs = require('fs');

let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Replace the inline onclicks in renderClientsTable
const oldButtons = `<button onclick="copyClientLink('\${client.access_code}', '\${escapeHtml(client.name)}')" class="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center" title="Copiar Enlace de Suscripcin">
                        <span class="material-symbols-outlined text-[18px]">link</span>
                    </button>
                    \${statusLower.includes('fallo') ? \`
                        <button onclick="retryPayment(\${client.id}, '\${escapeHtml(client.name)}')" class="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors inline-flex items-center" title="Reintentar Cobro">
                            <span class="material-symbols-outlined text-[18px]">replay</span>
                        </button>
                    \` : ''}
                    \${statusLower === 'activo' ? \`
                        <button onclick="cancelSubscriptionAdmin(\${client.id}, '\${escapeHtml(client.name)}')" class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center" title="Cancelar Suscripcin (Detener cobros)">
                            <span class="material-symbols-outlined text-[18px]">cancel</span>
                        </button>
                    \` : ''}
                    <button onclick="openEditModal(\${client.id})" class="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center" title="Editar Suscripcin">
                        <span class="material-symbols-outlined text-[18px]">edit_document</span>
                    </button>
                    <button onclick="deleteClient(\${client.id}, '\${escapeHtml(client.name)}')" class="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center" title="Eliminar Registro">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>`;

const newButtons = `<button data-action="copy" data-code="\${client.access_code}" data-name="\${escapeHtml(client.name)}" class="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center" title="Copiar Enlace de Suscripcin">
                        <span class="material-symbols-outlined text-[18px]">link</span>
                    </button>
                    \${statusLower.includes('fallo') ? \`
                        <button data-action="retry" data-id="\${client.id}" data-name="\${escapeHtml(client.name)}" class="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors inline-flex items-center" title="Reintentar Cobro">
                            <span class="material-symbols-outlined text-[18px]">replay</span>
                        </button>
                    \` : ''}
                    \${statusLower === 'activo' ? \`
                        <button data-action="cancel" data-id="\${client.id}" data-name="\${escapeHtml(client.name)}" class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center" title="Cancelar Suscripcin (Detener cobros)">
                            <span class="material-symbols-outlined text-[18px]">cancel</span>
                        </button>
                    \` : ''}
                    <button data-action="edit" data-id="\${client.id}" class="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center" title="Editar Suscripcin">
                        <span class="material-symbols-outlined text-[18px]">edit_document</span>
                    </button>
                    <button data-action="delete" data-id="\${client.id}" data-name="\${escapeHtml(client.name)}" class="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center" title="Eliminar Registro">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>`;

adminJs = adminJs.replace(oldButtons, newButtons);

// 2. Add event delegation to DOMContentLoaded
const delegationCode = `
    const tbody = document.getElementById('clientsTableBody');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const code = btn.getAttribute('data-code');
            
            if (action === 'copy') copyClientLink(code, name);
            if (action === 'edit') openEditModal(parseInt(id));
            if (action === 'delete') deleteClient(parseInt(id), name);
            if (action === 'retry') retryPayment(parseInt(id), name);
            if (action === 'cancel') cancelSubscriptionAdmin(parseInt(id), name);
        });
    }
`;

// Insert it into the DOMContentLoaded block
adminJs = adminJs.replace(/fetchClients\(\);\n\s*\}/, `fetchClients();\n${delegationCode}\n}`);


// 3. Fix calendar add event button similarly in admin.html and admin.js
// Actually, let's just use addEventListener for the Add Event button in admin.js
const calendarDelegation = `
    const btnAddEvent = document.getElementById('btnAddEvent');
    if (btnAddEvent) {
        btnAddEvent.addEventListener('click', () => openEventModal());
    }
`;
adminJs = adminJs.replace(/if\(f\) f\.addEventListener\('submit', saveEvent\);\n\s*\}/, `if(f) f.addEventListener('submit', saveEvent);\n${calendarDelegation}\n}`);


fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js refactored to use event delegation");

// We need to modify admin.html to add id="btnAddEvent" to the "Aadir Tarea/Gasto" button, and remove onclick
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
adminHtml = adminHtml.replace(/<button onclick="openEventModal\(\)" class="bg-primary hover:bg-\[\#3d0291\] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">/, '<button id="btnAddEvent" class="bg-primary hover:bg-[#3d0291] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">');

// Cache bust
const version = Date.now();
adminHtml = adminHtml.replace(/<script src="\/js\/admin\.js(\?v=\d+)?"\><\/script>/, `<script src="/js/admin.js?v=${version}"></script>`);
fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched for event delegation");

