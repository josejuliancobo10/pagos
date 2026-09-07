const fs = require('fs');
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

// Rewrite copyClientLink
adminJs = adminJs.replace(/function copyClientLink\([\s\S]*?\}\s*?\n(?=\/\/ 6)/,
`window.copyClientLink = function(code, clientName) {
    try {
        const host = window.location.origin;
        const fullUrl = \`\${host}/?code=\${encodeURIComponent(code)}\`;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(fullUrl).then(() => {
                showToast(\`¡Enlace copiado para \${clientName}! (\${code})\`);
            }).catch(e => {
                prompt('Copia este enlace de suscripción para el cliente:', fullUrl);
            });
        } else {
            prompt('Copia este enlace de suscripción para el cliente:', fullUrl);
        }
    } catch (err) {
        alert("Error copiando enlace: " + err.message);
    }
}
`);

// Rewrite openEditModal
adminJs = adminJs.replace(/function openEditModal\([\s\S]*?\}\s*?\n(?=\/\/ 10)/,
`window.openEditModal = function(clientId) {
    try {
        const client = window.allClients.find(c => c.id === clientId) || (typeof allClients !== 'undefined' ? allClients.find(c => c.id === clientId) : null);
        if (!client) {
            alert("Error: Cliente no encontrado en la memoria.");
            return;
        }

        document.getElementById('editClientId').value = client.id;
        document.getElementById('editName').value = client.name || '';
        document.getElementById('editContact').value = client.contact_name || '';
        
        const planStr = client.plan || '';
        let planVal = 'Business';
        if (planStr.includes('Starter')) planVal = 'Starter';
        else if (planStr.includes('Pro')) planVal = 'Pro';
        else if (planStr.includes('Basic')) planVal = 'Basic';

        const editPlan = document.getElementById('editPlan');
        if (editPlan) {
            // Check if option exists, if not add it
            const exists = Array.from(editPlan.options).some(opt => opt.value === planVal);
            if (!exists) {
                const opt = document.createElement('option');
                opt.value = planVal;
                opt.textContent = planVal;
                editPlan.appendChild(opt);
            }
            editPlan.value = planVal;
        }

        const editStatus = document.getElementById('editStatus');
        if (editStatus) editStatus.value = client.status || 'Pendiente';
        
        const editAmount = document.getElementById('editAmount');
        if (editAmount) editAmount.value = client.recurring_amount || 0;

        document.getElementById('editClientModal').classList.remove('hidden');
    } catch (err) {
        alert("Error al abrir edición: " + err.message);
    }
}

window.closeEditModal = function() {
    document.getElementById('editClientModal').classList.add('hidden');
}

window.handleUpdateClient = async function(event) {
    event.preventDefault();
    try {
        const id = document.getElementById('editClientId').value;
        const payload = {
            name: document.getElementById('editName').value.trim(),
            contact_name: document.getElementById('editContact').value.trim(),
            plan: document.getElementById('editPlan').value,
            status: document.getElementById('editStatus').value,
            recurring_amount: parseFloat(document.getElementById('editAmount').value)
        };

        const res = await fetch(\`/api/clients/\${id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            closeEditModal();
            if (typeof fetchClients === 'function') fetchClients();
            if (typeof fetchMetrics === 'function') fetchMetrics();
            showToast('¡Suscripción actualizada exitosamente!');
        } else {
            alert('Error al actualizar: ' + (data.error || 'Intente de nuevo'));
        }
    } catch (err) {
        alert("Error de conexión: " + err.message);
    }
}
`);

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js bulletproofed");
