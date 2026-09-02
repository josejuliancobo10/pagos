const fs = require('fs');
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// === 1. admin.html changes ===
// Replace the calendar container with a two-column layout
const oldCalendarContainer = `<div class="bg-white rounded-3xl shadow-sm border border-outline-variant p-6">
                    <div id="calendarEl"></div>
                </div>`;

const newCalendarContainer = `<div class="flex flex-col lg:flex-row gap-6">
                    <!-- Client List Sidebar -->
                    <div class="w-full lg:w-64 shrink-0 bg-white rounded-3xl shadow-sm border border-outline-variant p-5 flex flex-col h-[700px]">
                        <h3 class="font-black text-on-surface text-lg tracking-tight mb-4">Mis Clientes</h3>
                        <div class="relative mb-4">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input type="text" id="calClientSearch" onkeyup="searchCalendarClients(this.value)" placeholder="Buscar..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                        </div>
                        <div id="calendarClientList" class="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            <button onclick="filterCalendar('all')" id="btnCalClient-all" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-sm">Todos los Clientes</button>
                            <!-- Dynamically populated -->
                        </div>
                    </div>
                    
                    <!-- Calendar Grid -->
                    <div class="flex-1 bg-white rounded-3xl shadow-sm border border-outline-variant p-6 h-[700px] overflow-hidden">
                        <div id="calendarEl" class="h-full"></div>
                    </div>
                </div>`;

if (adminHtml.includes(oldCalendarContainer)) {
    adminHtml = adminHtml.replace(oldCalendarContainer, newCalendarContainer);
    adminHtml = adminHtml.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
    fs.writeFileSync('public/admin.html', adminHtml);
}

// === 2. admin.js changes ===

const filterLogic = `
let activeCalendarClient = 'all';

function renderCalendarClientList() {
    const list = document.getElementById('calendarClientList');
    if (!list) return;
    
    // Keep the "All" button
    let html = \`<button onclick="filterCalendar('all')" id="btnCalClient-all" class="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all \${activeCalendarClient === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">Todos los Clientes</button>\`;
    
    // Sort clients alphabetically
    const sorted = [...window.allClients].sort((a,b) => (a.name || '').localeCompare(b.name || ''));
    
    sorted.forEach(c => {
        const isActive = activeCalendarClient === c.id.toString();
        const classes = isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100';
        html += \`<button onclick="filterCalendar('\${c.id}')" id="btnCalClient-\${c.id}" class="cal-client-item w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all \${classes}" data-name="\${(c.name||'').toLowerCase()}">\${c.name}</button>\`;
    });
    
    list.innerHTML = html;
}

function filterCalendar(clientId) {
    activeCalendarClient = clientId.toString();
    renderCalendarClientList();
    if (calendar) calendar.refetchEvents();
    
    // Auto-select client in modal if a specific client is selected
    const evClientSelect = document.getElementById('evClient');
    if (evClientSelect) {
        if (activeCalendarClient !== 'all') {
            evClientSelect.value = activeCalendarClient;
        } else {
            evClientSelect.value = "";
        }
    }
}

function searchCalendarClients(query) {
    query = query.toLowerCase();
    const items = document.querySelectorAll('.cal-client-item');
    items.forEach(item => {
        if (item.getAttribute('data-name').includes(query)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
`;

if (!adminJs.includes('function filterCalendar')) {
    adminJs = adminJs + '\n' + filterLogic;
    
    // Modify initCalendar to filter events
    const oldEventsReturn = 'successCallback(formatted);';
    const newEventsReturn = `
                    const filtered = activeCalendarClient === 'all' 
                        ? formatted 
                        : formatted.filter(e => e.extendedProps.client_id && e.extendedProps.client_id.toString() === activeCalendarClient);
                    successCallback(filtered);`;
    adminJs = adminJs.replace(oldEventsReturn, newEventsReturn);
    
    // Hook renderCalendarClientList into switchTab
    const switchTabOld = `if (tabId === 'calendar') {
        document.getElementById('viewDashboard').classList.add('hidden');
        document.getElementById('viewCalendar').classList.remove('hidden');
        setTimeout(() => { if(typeof initCalendar === 'function') initCalendar(); }, 100);
    }`;
    const switchTabNew = `if (tabId === 'calendar') {
        document.getElementById('viewDashboard').classList.add('hidden');
        document.getElementById('viewCalendar').classList.remove('hidden');
        renderCalendarClientList();
        setTimeout(() => { if(typeof initCalendar === 'function') initCalendar(); }, 100);
    }`;
    adminJs = adminJs.replace(switchTabOld, switchTabNew);
    
    fs.writeFileSync('public/js/admin.js', adminJs);
}

console.log("Calendar filtering added successfully.");
