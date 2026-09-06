const fs = require('fs');

// --- 1. PATCH ADMIN.HTML ---
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

// A. Fix the customized options to have default renewal prices
adminHtml = adminHtml.replace(/<option value="Basic Personalizado" data-price="">.*?<\/option>/, '<option value="Basic Personalizado" data-price="49.99">Basic (Personalizado)</option>');
adminHtml = adminHtml.replace(/<option value="Starter Personalizado" data-price="">.*?<\/option>/, '<option value="Starter Personalizado" data-price="99.99">Starter (Personalizado)</option>');
adminHtml = adminHtml.replace(/<option value="Business Personalizado" data-price="">.*?<\/option>/, '<option value="Business Personalizado" data-price="129.99">Business (Personalizado)</option>');
adminHtml = adminHtml.replace(/<option value="Pro Personalizado" data-price="">.*?<\/option>/, '<option value="Pro Personalizado" data-price="159.99">Pro (Personalizado)</option>');

// B. Add the Calculator and update labels
const oldLabels = `<div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Precio Anual ($)</label>
                        <input type="number" step="0.01" id="ncAmount" value="129.99" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Cobro Inicial Hoy ($) - (Para Abonos)</label>
                        <input type="number" step="0.01" id="ncInitialAmount" placeholder="Ej: Deja vacío para cobrar el precio anual completo" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                        <p class="text-[10px] text-slate-500 mt-1 leading-tight">Si cobras un abono (ej: 40%), ponlo aquí. El sistema cobrará esto hoy, y el próximo año renovará por el Precio Anual completo.</p>
                    </div>`;

const newLabels = `<div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Precio de Renovación Anual ($)</label>
                        <input type="number" step="0.01" id="ncAmount" value="129.99" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                    </div>
                    
                    <div class="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 space-y-2 mt-2 mb-2">
                        <label class="block text-xs font-bold text-blue-900">Calculadora de Proyecto (Opcional)</label>
                        <div class="flex gap-2">
                            <input type="number" step="0.01" id="ncProjectTotal" placeholder="Costo Total del Proyecto (Ej: 300)" class="flex-1 px-3 py-2 rounded-xl border border-blue-200 text-xs focus:border-blue-400 outline-none">
                        </div>
                        <div class="flex gap-2">
                            <button type="button" onclick="calcInitial(0.4)" class="flex-1 bg-white border border-blue-200 text-blue-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">Abono 40%</button>
                            <button type="button" onclick="calcInitial(0.6)" class="flex-1 bg-white border border-blue-200 text-blue-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">Saldo 60%</button>
                            <button type="button" onclick="calcInitial(1)" class="flex-1 bg-white border border-blue-200 text-blue-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">100% Total</button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Cobro Inicial Hoy ($) - (Lo que pagará hoy)</label>
                        <input type="number" step="0.01" id="ncInitialAmount" placeholder="Monto a cobrar hoy..." class="w-full px-4 py-2.5 rounded-xl border-emerald-300 focus:border-emerald-500 text-xs bg-emerald-50 font-bold text-emerald-900 shadow-sm">
                        <p class="text-[10px] text-slate-500 mt-1 leading-tight">Monto exacto que el cliente pagará HOY en la pasarela. En 1 año se le renovará por el Precio de Renovación Anual.</p>
                    </div>`;

// Regex replace since there might be encoding issues with tildes
adminHtml = adminHtml.replace(/<div>\s*<label class="block text-xs font-bold text-on-surface mb-1">Precio Anual \(\$\)<\/label>[\s\S]*?Precio Anual completo.<\/p>\s*<\/div>/, newLabels);

fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched");


// --- 2. PATCH ADMIN.JS ---
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

if (!adminJs.includes('calcInitial')) {
    const calcFunction = `
window.calcInitial = function(multiplier) {
    const total = parseFloat(document.getElementById('ncProjectTotal').value);
    if (!isNaN(total) && total > 0) {
        document.getElementById('ncInitialAmount').value = (total * multiplier).toFixed(2);
    } else {
        alert('Por favor, ingresa el Costo Total del Proyecto primero.');
        document.getElementById('ncProjectTotal').focus();
    }
};
`;
    adminJs = adminJs + '\n' + calcFunction;
}

// Ensure the form resets the project total when closed
adminJs = adminJs.replace("document.getElementById('newClientForm').reset();", "document.getElementById('newClientForm').reset();\n    const pt = document.getElementById('ncProjectTotal'); if (pt) pt.value = '';");

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js patched");
