const fs = require('fs');

// --- 1. PATCH SERVER.JS ---
let serverJs = fs.readFileSync('server.js', 'utf8');

// In POST /api/clients, fix auto_renew
serverJs = serverJs.replace(
    /next_billing_date: getNextBillingDate\(data\.billing_cycle \|\| 'annual'\),\s*auto_renew: true,/g,
    `next_billing_date: getNextBillingDate(data.billing_cycle || 'annual'),
            auto_renew: data.auto_renew !== undefined ? data.auto_renew : true,`
);

// In POST /api/subscribe, don't force auto_renew to true
serverJs = serverJs.replace(
    /next_billing_date: nextBilling,\s*auto_renew: true,/g,
    `next_billing_date: nextBilling,`
);

fs.writeFileSync('server.js', serverJs);
console.log("server.js patched");

// --- 2. PATCH ADMIN.HTML ---
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

const newCheckbox = `
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Cobro Inicial Hoy ($) - (Lo que pagará hoy)</label>
                        <input type="number" step="0.01" id="ncInitialAmount" placeholder="Monto a cobrar hoy..." class="w-full px-4 py-2.5 rounded-xl border-emerald-300 focus:border-emerald-500 text-xs bg-emerald-50 font-bold text-emerald-900 shadow-sm">
                        
                        <div class="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                            <input type="checkbox" id="ncAutoRenew" checked class="w-4 h-4 rounded text-primary border-slate-300">
                            <label for="ncAutoRenew" class="text-[11px] font-bold text-slate-700 leading-tight">Activar Suscripción (Renovar automáticamente el próximo año)</label>
                        </div>
                        <p class="text-[10px] text-slate-500 mt-1.5 leading-tight">Monto exacto que el cliente pagará HOY en la pasarela. Desmarca la casilla si es un cobro único (Ej: Saldo Final).</p>
                    </div>`;

// Replace the old Cobro Inicial Hoy block
adminHtml = adminHtml.replace(/<div>\s*<label class="block text-xs font-bold text-on-surface mb-1">Cobro Inicial Hoy \(\$\) - \(Lo que pagará hoy\)<\/label>[\s\S]*?Precio de Renovación Anual\.<\/p>\s*<\/div>/, newCheckbox);

fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched");

// --- 3. PATCH ADMIN.JS ---
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

adminJs = adminJs.replace(
    /activation_fee: initialAmount,\s*access_code: document\.getElementById\('ncCode'\)\.value\.trim\(\)\.toUpperCase\(\) \|\| undefined\s*\};/,
    `activation_fee: initialAmount,
        access_code: document.getElementById('ncCode').value.trim().toUpperCase() || undefined,
        auto_renew: document.getElementById('ncAutoRenew') ? document.getElementById('ncAutoRenew').checked : true
    };`
);

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js patched");

// --- 4. PATCH APP.JS ---
let appJs = fs.readFileSync('public/js/app.js', 'utf8');

// In app.js, find updateSummary and change the UI if auto_renew is false
const oldCycles = `<div class="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                                <span class="text-slate-600 font-medium">Siguientes ciclos automáticos:</span>
                                <span id="summaryNextCycles" class="font-black text-emerald-700 font-mono"></span>
                            </div>`;

const newCycles = `<div class="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs" id="summaryNextCyclesContainer">
                                <span class="text-slate-600 font-medium" id="summaryNextCyclesLabel">Siguientes ciclos automáticos:</span>
                                <span id="summaryNextCycles" class="font-black text-emerald-700 font-mono"></span>
                            </div>`;

// If it's not already using the IDs for the container, update it
if (!appJs.includes('summaryNextCyclesLabel')) {
    // We just inject logic to modify the existing elements in updateSummary
    // Since app.js might not have exactly that HTML if it's dynamically rendered... wait, index.html has the HTML.
    // Let's modify index.html to add IDs
    let indexHtml = fs.readFileSync('public/index.html', 'utf8');
    indexHtml = indexHtml.replace(
        /<span class="text-slate-600 font-medium">Siguientes ciclos automáticos:<\/span>/g, 
        '<span id="summaryNextCyclesLabel" class="text-slate-600 font-medium">Siguientes ciclos automáticos:</span>'
    );
    fs.writeFileSync('public/index.html', indexHtml);
}

// In appJs updateSummary:
const logicToInject = `
    const labelEl = document.getElementById('summaryNextCyclesLabel');
    if (state.client && state.client.auto_renew === false) {
        if(labelEl) labelEl.textContent = 'Cobro Único:';
        document.getElementById('summaryNextCycles').textContent = 'Sin Renovación';
        document.getElementById('summaryNextCycles').classList.replace('text-emerald-700', 'text-slate-500');
        
        const btnText = document.getElementById('btnSubmitText');
        if(btnText) btnText.innerHTML = 'Pagar Ahora $' + firstTotal.toFixed(2);
    } else {
        if(labelEl) labelEl.textContent = 'Siguientes ciclos automáticos:';
        document.getElementById('summaryNextCycles').textContent = '$' + recurringPrice.toFixed(2) + '/año';
        document.getElementById('summaryNextCycles').classList.replace('text-slate-500', 'text-emerald-700');
        
        const btnText = document.getElementById('btnSubmitText');
        if(btnText) btnText.innerHTML = 'Autorizar Suscripción por $' + firstTotal.toFixed(2);
    }
`;

// Replace the old setting of summaryNextCycles
appJs = appJs.replace(
    /document\.getElementById\('summaryNextCycles'\)\.textContent = '\$' \+ recurringPrice\.toFixed\(2\) \+ '\/ao';/,
     logicToInject + "\n// old code removed"
);
// Also cover normal 'año' just in case
appJs = appJs.replace(
    /document\.getElementById\('summaryNextCycles'\)\.textContent = '\$' \+ recurringPrice\.toFixed\(2\) \+ '\/a\u00f1o';/,
     logicToInject + "\n// old code removed"
);
appJs = appJs.replace(
    /document\.getElementById\('summaryNextCycles'\)\.textContent = '\$' \+ recurringPrice\.toFixed\(2\) \+ '\/año';/,
     logicToInject + "\n// old code removed"
);

fs.writeFileSync('public/js/app.js', appJs);
console.log("app.js patched");
