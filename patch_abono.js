const fs = require('fs');

// --- 1. ADMIN.HTML ---
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

// Add "Cobro Inicial Hoy" input
adminHtml = adminHtml.replace(/<div class="grid grid-cols-2 gap-4">\s*<div>\s*<label class="block text-xs font-bold text-on-surface mb-1">Plan a Facturar<\/label>[\s\S]*?Precio Anual[\s\S]*?<\/div>\s*<\/div>/,
(match) => match + `
                <div class="mt-4">
                    <label class="block text-xs font-bold text-on-surface mb-1">Cobro Inicial Hoy ($) - (Para Abonos)</label>
                    <input type="number" step="0.01" id="ncInitialAmount" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold" placeholder="Ej: Deja vacío para cobrar el precio anual completo">
                    <p class="text-[10px] text-slate-500 mt-1">Si cobras un abono (ej: 40%), ponlo aquí. El sistema cobrará esto hoy, y el próximo año renovará por el Precio Anual completo.</p>
                </div>`
);
adminHtml = adminHtml.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
fs.writeFileSync('public/admin.html', adminHtml);


// --- 2. ADMIN.JS ---
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');
adminJs = adminJs.replace(/const recurringAmount = parseFloat\(document\.getElementById\('ncAmount'\)\.value\) \|\| 0;/,
`const recurringAmount = parseFloat(document.getElementById('ncAmount').value) || 0;
    let initialAmountRaw = document.getElementById('ncInitialAmount').value;
    const initialAmount = initialAmountRaw !== '' ? parseFloat(initialAmountRaw) : recurringAmount;`);

adminJs = adminJs.replace(/activation_fee: 0,/, `activation_fee: initialAmount,`);

fs.writeFileSync('public/js/admin.js', adminJs);


// --- 3. APP.JS ---
let appJs = fs.readFileSync('public/js/app.js', 'utf8');

// Modify updateSummary to use activation_fee as firstTotal
appJs = appJs.replace(/const firstTotal = recurringPrice;/g, 
`let firstTotal = recurringPrice;
    if (state.client && state.client.planGroup === state.selectedPlan && state.client.activation_fee !== undefined && state.client.activation_fee !== null && state.client.activation_fee !== recurringPrice) {
        firstTotal = state.client.activation_fee;
    }`);
    
// We also need to change the breakdown if firstTotal != recurringPrice so the math doesn't look broken
// In summary, we have:
// summaryPlanAmount (Price of plan)
// summaryRecurringPlan (Subtotal)
// summaryFirstPayment (Total)
appJs = appJs.replace(/document\.getElementById\('summaryPlanAmount'\)\.textContent = `\$\{recurringPrice\.toFixed\(2\)\}`;/g,
`document.getElementById('summaryPlanAmount').textContent = \`\${firstTotal.toFixed(2)}\`;`);
appJs = appJs.replace(/document\.getElementById\('summaryRecurringPlan'\)\.textContent = `\$\{recurringPrice\.toFixed\(2\)\}`;/g,
`document.getElementById('summaryRecurringPlan').textContent = \`\${firstTotal.toFixed(2)}\`;`);

fs.writeFileSync('public/js/app.js', appJs);

console.log("Abono functionality added.");
