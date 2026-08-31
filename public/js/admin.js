
let adminPass = localStorage.getItem('adminPass') || '';

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPasswordInput').value;
    adminPass = pass;
    localStorage.setItem('adminPass', pass);
    document.getElementById('adminLockScreen').style.display = 'none';
    
    if (adminPass) {
        document.getElementById('adminLockScreen').style.display = 'none';
        loadMetrics();
        loadClients();
    } else {
        showAdminLock();
    }

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
    
    const res = await adminFetch(url, options);
    if (res.status === 401) {
        document.getElementById('adminLockErrorMsg').classList.remove('hidden');
        showAdminLock();
        throw new Error('No autorizado');
    }
    return res;
}

// Admin Dashboard Logic for Subscriptions & Auto-Billing
let allClients = [];

const PRICING_DEFAULTS = {
    Starter: { activation: 19.99, monthly: 19.99, quarterly: 54.99, annual: 209.99 },
    Business: { activation: 29.99, monthly: 29.99, quarterly: 82.99, annual: 314.99 },
    Pro: { activation: 39.99, monthly: 44.99, quarterly: 124.99, annual: 469.99 }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchMetrics();
    fetchClients();
});

// 1. Fetch Dashboard Metrics
async function fetchMetrics() {
    try {
        const res = await adminFetch('/api/metrics');
        const data = await res.json();
        if (res.ok) {
            document.getElementById('metricRevenue').textContent = data.totalRevenue || '$24,500.00';
            document.getElementById('metricActive').textContent = data.activeSubscriptions ? data.activeSubscriptions.toLocaleString() : '1,204';
            document.getElementById('metricPending').textContent = data.pendingPayments ? data.pendingPayments.toLocaleString() : '42';
            document.getElementById('metricCanceled').textContent = data.canceledSubscriptions ? data.canceledSubscriptions.toLocaleString() : '15';
        }
    } catch (e) {
        console.error('Error loading metrics:', e);
    }
}

// 2. Fetch Clients & Subscriptions List
async function fetchClients(query = '') {
    const tbody = document.getElementById('clientsTableBody');
    try {
        const url = query ? `/api/clients?q=${encodeURIComponent(query)}` : '/api/clients';
        const res = await adminFetch(url);
        const data = await res.json();
        
        if (res.ok && data.clients) {
            allClients = data.clients;
            renderClientsTable(allClients);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-error">Error al cargar clientes</td></tr>`;
        }
    } catch (e) {
        console.error('Error fetching clients:', e);
        tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-outline">Sin conexión al servidor</td></tr>`;
    }
}

// 3. Render Table Rows
function renderClientsTable(clients) {
    const tbody = document.getElementById('clientsTableBody');
    if (!clients || clients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-500 font-medium">No se encontraron suscriptores registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = clients.map(client => {
        // Plan Badge
        let planBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
        const planLower = (client.plan || '').toLowerCase();
        if (planLower.includes('business')) {
            planBadgeClass = 'bg-purple-100 text-purple-800 border-purple-200 font-bold';
        } else if (planLower.includes('starter')) {
            planBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200 font-bold';
        } else if (planLower.includes('pro')) {
            planBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold';
        }

        // Status Badge
        const statusLower = (client.status || '').toLowerCase();
        let statusBadge = '';
        if (statusLower === 'activo') {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md text-[11px] font-extrabold border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Activa (Auto)
                </span>
            `;
        } else if (statusLower.includes('fallo')) {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md text-[11px] font-extrabold border border-rose-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Fallo de Cobro (${client.retry_count || 1})
                </span>
            `;
        } else if (statusLower === 'cancelada') {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Cancelada
                </span>
            `;
        } else {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md text-[11px] font-extrabold border border-amber-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span> ${escapeHtml(client.status)}
                </span>
            `;
        }

        const recurringFormatted = `$${parseFloat(client.recurring_amount || 29.99).toFixed(2)}/${client.billing_cycle === 'annual' ? 'año' : (client.billing_cycle === 'quarterly' ? '3m' : 'mes')}`;

        return `
            <tr class="hover:bg-slate-50 transition-colors group">
                <td class="py-4 px-6 font-semibold">
                    <div class="text-on-surface font-bold text-sm">${escapeHtml(client.name)}</div>
                    <div class="text-[11px] text-slate-500 font-normal">
                        ${escapeHtml(client.contact_name || '')} &bull; <span class="font-mono font-bold text-primary">${escapeHtml(client.access_code)}</span>
                        ${client.gateway ? ` &bull; <span class="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">${escapeHtml(client.gateway)}</span>` : ''}
                    </div>
                </td>
                <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-md text-xs border ${planBadgeClass}">${escapeHtml(client.plan)}</span>
                </td>
                <td class="py-4 px-6 font-bold text-on-surface font-mono text-sm">${recurringFormatted}</td>
                <td class="py-4 px-6 text-xs font-semibold ${statusLower === 'activo' ? 'text-emerald-700' : 'text-slate-500'}">
                    ${escapeHtml(client.next_billing_date || 'N/A')}
                </td>
                <td class="py-4 px-6">${statusBadge}</td>
                <td class="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                    <button onclick="copyClientLink('${client.access_code}', '${escapeHtml(client.name)}')" class="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center" title="Copiar Enlace de Suscripción">
                        <span class="material-symbols-outlined text-[18px]">link</span>
                    </button>
                    ${statusLower.includes('fallo') ? `
                        <button onclick="retryPayment(${client.id}, '${escapeHtml(client.name)}')" class="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors inline-flex items-center" title="Reintentar Cobro">
                            <span class="material-symbols-outlined text-[18px]">replay</span>
                        </button>
                    ` : ''}
                    ${statusLower === 'activo' ? `
                        <button onclick="cancelSubscriptionAdmin(${client.id}, '${escapeHtml(client.name)}')" class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center" title="Cancelar Suscripción (Detener cobros)">
                            <span class="material-symbols-outlined text-[18px]">cancel</span>
                        </button>
                    ` : ''}
                    <button onclick="openEditModal(${client.id})" class="p-2 text-slate-400 hover:text-secondary hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center" title="Editar Suscripción">
                        <span class="material-symbols-outlined text-[18px]">edit_document</span>
                    </button>
                    <button onclick="deleteClient(${client.id}, '${escapeHtml(client.name)}')" class="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center" title="Eliminar Registro">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. Search Filter
function handleSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderClientsTable(allClients);
        return;
    }
    const filtered = allClients.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.contact_name && c.contact_name.toLowerCase().includes(q)) ||
        (c.plan && c.plan.toLowerCase().includes(q)) ||
        (c.access_code && c.access_code.toLowerCase().includes(q)) ||
        (c.status && c.status.toLowerCase().includes(q))
    );
    renderClientsTable(filtered);
}

// 5. Copy Client Link
function copyClientLink(code, clientName) {
    const host = window.location.origin;
    const fullUrl = `${host}/?code=${encodeURIComponent(code)}`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
        showToast(`¡Enlace copiado para ${clientName}! (${code})`);
    }).catch(() => {
        prompt('Copia este enlace de suscripción para el cliente:', fullUrl);
    });
}

// 6. Create New Client Link with Official Prices
function openNewClientModal() {
    document.getElementById('newClientModal').classList.remove('hidden');
    updateNewClientAmounts();
    document.getElementById('ncName').focus();
}

function closeNewClientModal() {
    document.getElementById('newClientModal').classList.add('hidden');
    document.getElementById('newClientForm').reset();
}

function updateNewClientAmounts() {
    const plan = document.getElementById('ncPlan').value;
    const cycle = document.getElementById('ncCycle').value;
    const pricing = PRICING_DEFAULTS[plan] || PRICING_DEFAULTS['Business'];

    let recurringAmount = pricing.monthly;
    if (cycle === 'quarterly') recurringAmount = pricing.quarterly;
    if (cycle === 'annual') recurringAmount = pricing.annual;

    document.getElementById('ncRecurringDisplay').textContent = `$${recurringAmount.toFixed(2)}`;
    document.getElementById('ncActivationDisplay').textContent = `$${pricing.activation.toFixed(2)}`;
}

async function handleCreateClient(event) {
    event.preventDefault();
    const btn = document.getElementById('btnCreateClient');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Creando...';

    const plan = document.getElementById('ncPlan').value;
    const cycle = document.getElementById('ncCycle').value;
    const pricing = PRICING_DEFAULTS[plan] || PRICING_DEFAULTS['Business'];

    let recurringAmount = pricing.monthly;
    if (cycle === 'quarterly') recurringAmount = pricing.quarterly;
    if (cycle === 'annual') recurringAmount = pricing.annual;

    const payload = {
        name: document.getElementById('ncName').value.trim(),
        contact_name: document.getElementById('ncContact').value.trim(),
        email: document.getElementById('ncEmail').value.trim(),
        plan: plan,
        billing_cycle: cycle,
        recurring_amount: recurringAmount,
        activation_fee: pricing.activation,
        access_code: document.getElementById('ncCode').value.trim().toUpperCase() || undefined
    };

    try {
        const res = await adminFetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            closeNewClientModal();
            fetchClients();
            fetchMetrics();
            copyClientLink(data.client.access_code, data.client.name);
        } else {
            alert('Error: ' + (data.error || 'No se pudo crear el cliente'));
        }
    } catch (e) {
        console.error('Error creating client:', e);
        alert('Error al conectar con el servidor.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Generar Enlace <span class="material-symbols-outlined text-sm">link</span>';
    }
}

// 7. Cancel Subscription from Admin Panel
async function cancelSubscriptionAdmin(clientId, clientName) {
    if (!confirm(`¿Estás seguro de cancelar la suscripción de "${clientName}"? Se detendrán todos los cobros automáticos en Payphone/Stripe.`)) return;

    try {
        const res = await adminFetch('/api/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId: clientId,
                reason: 'Cancelado por el Administrador desde el Panel',
                canceledBy: 'Administrador'
            })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            fetchClients();
            fetchMetrics();
            showToast(`Suscripción de "${clientName}" cancelada. Cobros detenidos.`);
        } else {
            alert('Error: ' + (data.error || 'No se pudo cancelar'));
        }
    } catch (e) {
        console.error('Error canceling subscription:', e);
    }
}

// 8. Retry Payment
async function retryPayment(clientId, clientName) {
    try {
        const res = await adminFetch('/api/retry-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: clientId })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            fetchClients();
            fetchMetrics();
            showToast(`¡Cobro reintentado y exitoso para "${clientName}"!`);
        } else {
            alert('Fallo en el reintento: ' + (data.error || 'Tarjeta rechazada'));
        }
    } catch (e) {
        console.error('Error retrying payment:', e);
    }
}

// 9. Edit Client
function openEditModal(clientId) {
    const client = allClients.find(c => c.id === clientId);
    if (!client) return;

    document.getElementById('editClientId').value = client.id;
    document.getElementById('editName').value = client.name;
    document.getElementById('editContact').value = client.contact_name;
    document.getElementById('editPlan').value = client.plan.includes('Starter') ? 'Starter' : (client.plan.includes('Pro') ? 'Pro' : 'Business');
    document.getElementById('editStatus').value = client.status;
    document.getElementById('editAmount').value = client.recurring_amount || 29.99;

    document.getElementById('editClientModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editClientModal').classList.add('hidden');
}

async function handleUpdateClient(event) {
    event.preventDefault();
    const id = document.getElementById('editClientId').value;
    const payload = {
        name: document.getElementById('editName').value.trim(),
        contact_name: document.getElementById('editContact').value.trim(),
        plan: document.getElementById('editPlan').value,
        status: document.getElementById('editStatus').value,
        recurring_amount: parseFloat(document.getElementById('editAmount').value)
    };

    try {
        const res = await adminFetch(`/api/clients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            closeEditModal();
            fetchClients();
            fetchMetrics();
            showToast('¡Suscripción actualizada exitosamente!');
        } else {
            alert('Error al actualizar: ' + (data.error || 'Intente de nuevo'));
        }
    } catch (e) {
        console.error('Error updating client:', e);
    }
}

// 10. Delete Client
async function deleteClient(id, name) {
    if (!confirm(`¿Estás seguro de eliminar el registro de "${name}"?`)) return;

    try {
        const res = await adminFetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchClients();
            fetchMetrics();
            showToast(`Registro de "${name}" eliminado.`);
        }
    } catch (e) {
        console.error('Error deleting client:', e);
    }
}

// Toast Helper
let toastTimeout;
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
