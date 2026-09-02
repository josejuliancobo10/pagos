const fs = require('fs');

let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// === 1. Fix admin.html ===

// Add FullCalendar CDN if not present
if (!adminHtml.includes('fullcalendar')) {
    adminHtml = adminHtml.replace('</title>', '</title>\n    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>');
}

// Add the Sidebar button
const sidebarLink = `
            <a class="text-on-surface-variant hover:bg-slate-100 hover:text-primary rounded-2xl px-4 py-3 flex items-center gap-3 transition-colors" href="#" onclick="switchTab('calendar'); return false;">
                <span class="material-symbols-outlined text-[20px]">calendar_month</span>
                Calendario (Gastos)
            </a>`;
// Inject it after Suscripciones Activas
adminHtml = adminHtml.replace(/(<a[^>]*href="#clientesSection"[^>]*>[\s\S]*?<\/a>)/, '$1' + sidebarLink);

// Make Dashboard section hidable by wrapping it in an id="viewDashboard" (it's currently just inside the <main> div)
// Let's just wrap the dashboard contents in a div id="viewDashboard"
if (!adminHtml.includes('id="viewDashboard"')) {
    adminHtml = adminHtml.replace('<div class="max-w-[1440px] mx-auto p-4 md:p-10 space-y-8">', '<div class="max-w-[1440px] mx-auto p-4 md:p-10 space-y-8">\n            <div id="viewDashboard" class="space-y-8">');
    adminHtml = adminHtml.replace('</section>\n        </div>\n    </main>', '</section>\n            </div>\n        </div>\n    </main>');
}

// Add Calendar Section inside the main container but outside viewDashboard
if (!adminHtml.includes('id="viewCalendar"')) {
    const calendarSection = `
            <!-- CALENDAR SECTION -->
            <section id="viewCalendar" class="hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Calendario de Tareas</h2>
                        <p class="text-xs md:text-sm text-on-surface-variant mt-1">Controla las renovaciones y gastos por cliente.</p>
                    </div>
                    <button onclick="openEventModal()" class="bg-primary hover:bg-[#3d0291] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">
                        <span class="material-symbols-outlined text-[20px]">add</span>
                        Nuevo Evento
                    </button>
                </div>
                
                <div class="bg-white rounded-3xl shadow-sm border border-outline-variant p-6">
                    <div id="calendarEl"></div>
                </div>
            </section>
`;
    adminHtml = adminHtml.replace('</div>\n        </div>\n    </main>', '</div>\n' + calendarSection + '\n        </div>\n    </main>');
}

// Add Calendar Modal
if (!adminHtml.includes('id="eventModal"')) {
    const eventModal = `
    <!-- EVENT MODAL -->
    <div id="eventModal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/50 blur-backdrop p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-outline-variant relative">
            <button onclick="closeEventModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
            <h3 id="eventModalTitle" class="text-xl font-black text-on-surface mb-2 tracking-tight">Añadir Tarea/Gasto</h3>
            <p class="text-xs text-on-surface-variant mb-6">Registra un pago pendiente o recordatorio.</p>
            
            <form id="eventForm" class="space-y-4">
                <input type="hidden" id="evId">
                
                <div>
                    <label class="block text-xs font-bold text-on-surface mb-1">Cliente Vinculado</label>
                    <select id="evClient" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold text-slate-700">
                        <option value="">-- Sin Cliente Específico --</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-on-surface mb-1">Fecha límite / Fecha de cobro</label>
                    <input type="date" id="evDate" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold text-slate-700">
                </div>

                <div>
                    <label class="block text-xs font-bold text-on-surface mb-1">Descripción / Notas</label>
                    <input type="text" id="evNotes" required placeholder="Ej: Renovar dominio .com (Hostinger)" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold text-slate-700">
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-on-surface mb-1">Estado</label>
                    <select id="evStatus" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold text-slate-700">
                        <option value="Pendiente">Pendiente (Rojo)</option>
                        <option value="Pagado">Pagado / Listo (Verde)</option>
                    </select>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="button" id="btnDeleteEvent" onclick="deleteEvent()" class="hidden px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold transition-colors text-sm">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <button type="button" onclick="closeEventModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant text-slate-600 hover:bg-slate-50 font-bold transition-colors text-sm">Cancelar</button>
                    <button type="submit" class="flex-1 bg-primary hover:bg-[#3d0291] text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm">Guardar Evento</button>
                </div>
            </form>
        </div>
    </div>`;
    
    adminHtml = adminHtml.replace('</body>', eventModal + '\n</body>');
}

// Update cache buster
adminHtml = adminHtml.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
fs.writeFileSync('public/admin.html', adminHtml);


// === 2. Fix admin.js ===

// Add switchTab function globally
if (!adminJs.includes('function switchTab(')) {
    const switchTabCode = `
window.switchTab = function(tabId) {
    if (tabId === 'calendar') {
        document.getElementById('viewDashboard').classList.add('hidden');
        document.getElementById('viewCalendar').classList.remove('hidden');
        setTimeout(() => { if(typeof initCalendar === 'function') initCalendar(); }, 100);
    } else {
        document.getElementById('viewDashboard').classList.remove('hidden');
        document.getElementById('viewCalendar').classList.add('hidden');
    }
};

`;
    adminJs = switchTabCode + adminJs;
}

// Make the Dashboard tab go back to dashboard
adminHtml = fs.readFileSync('public/admin.html', 'utf8');
adminHtml = adminHtml.replace(/href="\/admin"/, 'href="#" onclick="switchTab(\'dashboard\'); return false;"');
fs.writeFileSync('public/admin.html', adminHtml);

fs.writeFileSync('public/js/admin.js', adminJs);

console.log("Calendar successfully integrated into the DOM");
