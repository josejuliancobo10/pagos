const fs = require('fs');

// --- 1. PATCH ADMIN.HTML ---
let html = fs.readFileSync('public/admin.html', 'utf8');

const oldHtmlSection = `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Plan Oficial</label>
                        <select id="ncPlan" onchange="updateNewClientAmounts()" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                            <option value="Starter">Starter ($19,99/m)</option>
                            <option value="Business" selected>Business ($29,99/m)</option>
                            <option value="Pro">Pro ($44,99/m)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Periodicidad</label>
                        <select id="ncCycle" onchange="updateNewClientAmounts()" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                            <option value="monthly" selected>Mensual</option>
                            <option value="quarterly">Trimestral (5% dto.)</option>
                            <option value="annual">Anual (10% dto.)</option>
                        </select>
                    </div>
                </div>

                <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex justify-between">
                    <div>
                        <span class="text-slate-500">Cuota Recurrente:</span>
                        <p id="ncRecurringDisplay" class="font-bold text-primary font-mono">$29.99</p>
                    </div>
                    <div class="text-right">
                        <span class="text-slate-500">Activación (1 vez):</span>
                        <p id="ncActivationDisplay" class="font-bold text-primary font-mono">$29.99</p>
                    </div>
                </div>`;

const newHtmlSection = `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Plan a Facturar</label>
                        <select id="ncPlan" onchange="updateNewClientAmounts()" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                            <option value="Basic" data-price="99.99">Basic ($99.99/año)</option>
                            <option value="Starter" data-price="179.99">Starter ($179.99/año)</option>
                            <option value="Business" data-price="269.99" selected>Business ($269.99/año)</option>
                            <option value="Pro" data-price="449.99">Pro ($449.99/año)</option>
                            <option value="Basic Personalizado" data-price="">Basic (Personalizado)</option>
                            <option value="Starter Personalizado" data-price="">Starter (Personalizado)</option>
                            <option value="Business Personalizado" data-price="">Business (Personalizado)</option>
                            <option value="Pro Personalizado" data-price="">Pro (Personalizado)</option>
                            <option value="Servicio Personalizado" data-price="">Servicio Personalizado</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Precio Anual ($)</label>
                        <input type="number" step="0.01" id="ncAmount" value="269.99" required class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                    </div>
                </div>`;

// Use simple string replacement to avoid regex multi-line issues with spaces
if (html.includes('<label class="block text-xs font-bold text-on-surface mb-1">Plan Oficial</label>')) {
  // Use a more robust replace using regex for the chunk
  html = html.replace(
    /<div class="grid grid-cols-2 gap-4">[\s\S]*?<div class="text-right">[\s\S]*?<\/div>\s*<\/div>/,
    newHtmlSection
  );
  
  // Also bump cache buster
  html = html.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
  
  fs.writeFileSync('public/admin.html', html);
  console.log("admin.html patched successfully");
} else {
  console.log("admin.html chunk not found!");
}

// --- 2. PATCH ADMIN.JS ---
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// Replace updateNewClientAmounts
js = js.replace(
  /function updateNewClientAmounts\(\) \{[\s\S]*?\}/m,
  `function updateNewClientAmounts() {
    const planSelect = document.getElementById('ncPlan');
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    
    if (price) {
        document.getElementById('ncAmount').value = price;
    } else {
        document.getElementById('ncAmount').value = '';
        document.getElementById('ncAmount').focus();
    }
}`
);

// Replace handleCreateClient Payload logic
js = js.replace(
  /const plan = document\.getElementById\('ncPlan'\)\.value;[\s\S]*?access_code:/m,
  `const plan = document.getElementById('ncPlan').value;
    const recurringAmount = parseFloat(document.getElementById('ncAmount').value) || 0;

    const payload = {
        name: document.getElementById('ncName').value.trim(),
        contact_name: document.getElementById('ncContact').value.trim(),
        email: document.getElementById('ncEmail').value.trim(),
        plan: plan,
        billing_cycle: 'annual',
        recurring_amount: recurringAmount,
        activation_fee: 0,
        access_code:`
);

fs.writeFileSync('public/js/admin.js', js);
console.log("admin.js patched successfully");
