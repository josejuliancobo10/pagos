const fs = require('fs');

// --- 1. PATCH SERVER.JS ---
let serverJs = fs.readFileSync('server.js', 'utf8');

const calendarApiBlock = `
    // --- CALENDAR API ---
    if (pathname === '/api/calendar') {
      if (req.method === 'GET') {
        try {
          const events = await supabaseQuery('calendar_events?order=event_date.asc');
          return sendJSON(res, { events });
        } catch (e) {
          return sendJSON(res, { error: e.message }, 500);
        }
      }
      if (req.method === 'POST') {
        try {
          const data = await parseBody(req);
          const newEvent = await supabaseQuery('calendar_events', 'POST', {
            client_id: data.client_id || null,
            client_name: data.client_name || '',
            event_date: data.event_date,
            notes: data.notes,
            status: data.status || 'Pendiente'
          });
          return sendJSON(res, { success: true, event: newEvent[0] }, 201);
        } catch (e) {
          return sendJSON(res, { error: e.message }, 500);
        }
      }
    }
    if (pathname.startsWith('/api/calendar/') && req.method === 'PATCH') {
      try {
        const id = pathname.split('/')[3];
        const data = await parseBody(req);
        const updated = await supabaseQuery(\`calendar_events?id=eq.\${id}\`, 'PATCH', {
          status: data.status,
          notes: data.notes,
          event_date: data.event_date
        });
        return sendJSON(res, { success: true, event: updated[0] });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }
    if (pathname.startsWith('/api/calendar/') && req.method === 'DELETE') {
      try {
        const id = pathname.split('/')[3];
        await supabaseQuery(\`calendar_events?id=eq.\${id}\`, 'DELETE');
        return sendJSON(res, { success: true });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }
    // --- END CALENDAR API ---
`;

if (!serverJs.includes('/api/calendar')) {
    serverJs = serverJs.replace('// 3. Client CRUD', calendarApiBlock + '\n    // 3. Client CRUD');
    fs.writeFileSync('server.js', serverJs);
    console.log("server.js patched");
}


// --- 2. PATCH ADMIN.HTML ---
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

// Add Fullcalendar CDN
if (!adminHtml.includes('fullcalendar')) {
    adminHtml = adminHtml.replace('</title>', '</title>\n    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>');
}

// Add Sidebar link
if (!adminHtml.includes('viewCalendar')) {
    const sidebarLink = `
            <a href="#" onclick="switchTab('calendar')" id="tab-calendar" class="tab-btn flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-sm font-semibold">
                <span class="material-symbols-outlined text-[20px]">calendar_month</span>
                Calendario (Gastos)
            </a>`;
    adminHtml = adminHtml.replace(/(<a href="#" onclick="switchTab\('clientes'\)".*?<\/a>)/s, '$1\n' + sidebarLink);
}

// Add Calendar Section
if (!adminHtml.includes('id="viewCalendar"')) {
    const calendarSection = `
        <!-- CALENDAR SECTION -->
        <section id="viewCalendar" class="hidden">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-2xl font-black text-on-surface tracking-tight">Calendario de Pagos & Tareas</h2>
                    <p class="text-sm text-on-surface-variant mt-1">Controla las renovaciones de dominios, hosting y herramientas por cliente.</p>
                </div>
                <button onclick="openEventModal()" class="bg-primary hover:bg-[#3d0291] text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm">
                    <span class="material-symbols-outlined text-[20px]">add</span>
                    Nuevo Evento
                </button>
            </div>
            
            <div class="bg-surface rounded-2xl shadow-sm border border-outline-variant p-6">
                <div id="calendarEl"></div>
            </div>
        </section>

        <!-- EVENT MODAL -->
        <div id="eventModal" class="fixed inset-0 bg-black/60 hidden items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div class="bg-surface rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
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
                            <!-- Llenado dinámicamente -->
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
        </div>
`;
    adminHtml = adminHtml.replace('<!-- Create Modal -->', calendarSection + '\n        <!-- Create Modal -->');
    adminHtml = adminHtml.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
    fs.writeFileSync('public/admin.html', adminHtml);
    console.log("admin.html patched");
}


// --- 3. PATCH ADMIN.JS ---
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

const calendarLogic = `

// --- CALENDAR LOGIC ---
let calendar = null;
let currentEvents = [];

function initCalendar() {
    if (calendar) return; // Ya inicializado
    const calendarEl = document.getElementById('calendarEl');
    if (!calendarEl) return;
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            list: 'Agenda'
        },
        events: async function(info, successCallback, failureCallback) {
            try {
                const res = await adminFetch('/api/calendar');
                const data = await res.json();
                if(data.events) {
                    currentEvents = data.events;
                    const formatted = data.events.map(ev => {
                        const isPaid = ev.status === 'Pagado';
                        return {
                            id: ev.id,
                            title: (ev.client_name ? \`[\${ev.client_name}] \` : '') + ev.notes,
                            start: ev.event_date,
                            backgroundColor: isPaid ? '#10b981' : '#ef4444', // Verde o Rojo
                            borderColor: isPaid ? '#059669' : '#b91c1c',
                            textColor: '#ffffff',
                            extendedProps: {
                                client_id: ev.client_id,
                                client_name: ev.client_name,
                                status: ev.status,
                                notes: ev.notes
                            }
                        };
                    });
                    successCallback(formatted);
                } else {
                    successCallback([]);
                }
            } catch (err) {
                console.error('Calendar error', err);
                failureCallback(err);
            }
        },
        eventClick: function(info) {
            openEventModal(info.event);
        }
    });
    calendar.render();
}

function openEventModal(calEvent = null) {
    document.getElementById('eventModal').classList.remove('hidden');
    document.getElementById('eventModal').classList.add('flex');
    
    // Poblar clientes en el select
    const select = document.getElementById('evClient');
    select.innerHTML = '<option value="">-- Sin Cliente Específico --</option>';
    allClients.forEach(c => {
        select.innerHTML += \`<option value="\${c.id}">\${c.name}</option>\`;
    });

    if (calEvent) {
        document.getElementById('eventModalTitle').textContent = 'Editar Tarea/Gasto';
        document.getElementById('evId').value = calEvent.id;
        document.getElementById('evDate').value = calEvent.startStr;
        document.getElementById('evNotes').value = calEvent.extendedProps.notes;
        document.getElementById('evStatus').value = calEvent.extendedProps.status;
        document.getElementById('evClient').value = calEvent.extendedProps.client_id || '';
        document.getElementById('btnDeleteEvent').classList.remove('hidden');
    } else {
        document.getElementById('eventModalTitle').textContent = 'Añadir Tarea/Gasto';
        document.getElementById('eventForm').reset();
        document.getElementById('evId').value = '';
        document.getElementById('btnDeleteEvent').classList.add('hidden');
    }
}

function closeEventModal() {
    document.getElementById('eventModal').classList.add('hidden');
    document.getElementById('eventModal').classList.remove('flex');
}

async function saveEvent(e) {
    e.preventDefault();
    const id = document.getElementById('evId').value;
    const client_id = document.getElementById('evClient').value;
    const select = document.getElementById('evClient');
    const client_name = client_id ? select.options[select.selectedIndex].text : '';
    
    const payload = {
        client_id: client_id ? parseInt(client_id) : null,
        client_name: client_name,
        event_date: document.getElementById('evDate').value,
        notes: document.getElementById('evNotes').value,
        status: document.getElementById('evStatus').value
    };
    
    try {
        if (id) {
            await adminFetch(\`/api/calendar/\${id}\`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
        } else {
            await adminFetch('/api/calendar', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        closeEventModal();
        if(calendar) calendar.refetchEvents();
    } catch(err) {
        alert('Error al guardar el evento');
    }
}

async function deleteEvent() {
    if(!confirm('¿Estás seguro de eliminar este evento?')) return;
    const id = document.getElementById('evId').value;
    if(!id) return;
    
    try {
        await adminFetch(\`/api/calendar/\${id}\`, { method: 'DELETE' });
        closeEventModal();
        if(calendar) calendar.refetchEvents();
    } catch(err) {
        alert('Error al eliminar');
    }
}

// Hook up event form
document.addEventListener('DOMContentLoaded', () => {
    const f = document.getElementById('eventForm');
    if(f) f.addEventListener('submit', saveEvent);
});
`;

if (!adminJs.includes('initCalendar()')) {
    adminJs = adminJs + '\n' + calendarLogic;
    
    // Also patch switchTab to call initCalendar
    const tabSwitchTarget = `if (tabId === 'clientes') {
        fetchClients();
    }`;
    const tabSwitchReplacement = `if (tabId === 'clientes') {
        fetchClients();
    }
    if (tabId === 'calendar') {
        setTimeout(() => { if(typeof initCalendar === 'function') initCalendar(); }, 100);
    }`;
    
    adminJs = adminJs.replace(tabSwitchTarget, tabSwitchReplacement);
    
    // Also update allClients globally so we can access it
    adminJs = adminJs.replace('let allClients = [];', 'window.allClients = [];');
    if (!adminJs.includes('window.allClients = [];')) {
        adminJs = adminJs.replace('const clients = data.clients;', 'const clients = data.clients;\n            window.allClients = clients;');
    }
    
    fs.writeFileSync('public/js/admin.js', adminJs);
    console.log("admin.js patched");
}
