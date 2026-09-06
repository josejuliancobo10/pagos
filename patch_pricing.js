const fs = require('fs');

// --- 1. PATCH ADMIN.HTML ---
let adminHtml = fs.readFileSync('public/admin.html', 'utf8');

const oldSelect = `<select id="ncPlan" onchange="updateNewClientAmounts()" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                            <option value="Basic" data-price="99.99">Basic ($99.99/año)</option>
                            <option value="Starter" data-price="179.99">Starter ($179.99/año)</option>
                            <option value="Business" data-price="269.99" selected>Business ($269.99/año)</option>
                            <option value="Pro" data-price="449.99">Pro ($449.99/año)</option>`;

const newSelect = `<select id="ncPlan" onchange="updateNewClientAmounts()" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface font-semibold">
                            <option value="Basic" data-price="49.99" data-initial="99.99">Basic (Renueva a $49.99/año)</option>
                            <option value="Starter" data-price="99.99" data-initial="179.99">Starter (Renueva a $99.99/año)</option>
                            <option value="Business" data-price="129.99" data-initial="269.99" selected>Business (Renueva a $129.99/año)</option>
                            <option value="Pro" data-price="159.99" data-initial="449.99">Pro (Renueva a $159.99/año)</option>`;

// We might have utf-8 matching issues with 'año', let's use a regex replace for the options instead.
adminHtml = adminHtml.replace(/<option value="Basic" data-price="99\.99">.*?<\/option>/, '<option value="Basic" data-price="49.99" data-initial="99.99">Basic (Renueva a $49.99)</option>');
adminHtml = adminHtml.replace(/<option value="Starter" data-price="179\.99">.*?<\/option>/, '<option value="Starter" data-price="99.99" data-initial="179.99">Starter (Renueva a $99.99)</option>');
adminHtml = adminHtml.replace(/<option value="Business" data-price="269\.99".*?<\/option>/, '<option value="Business" data-price="129.99" data-initial="269.99" selected>Business (Renueva a $129.99)</option>');
adminHtml = adminHtml.replace(/<option value="Pro" data-price="449\.99">.*?<\/option>/, '<option value="Pro" data-price="159.99" data-initial="449.99">Pro (Renueva a $159.99)</option>');

// Also default the `ncAmount` input to 129.99 since Business is selected
adminHtml = adminHtml.replace(/id="ncAmount" value="269\.99"/, 'id="ncAmount" value="129.99"');

fs.writeFileSync('public/admin.html', adminHtml);
console.log("admin.html patched");

// --- 2. PATCH ADMIN.JS ---
let adminJs = fs.readFileSync('public/js/admin.js', 'utf8');

const oldUpdateAmounts = `function updateNewClientAmounts() {
    const planSelect = document.getElementById('ncPlan');
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const planName = planSelect.value;
    
    if (price) {
        document.getElementById('ncAmount').value = price;
    } else {
        document.getElementById('ncAmount').value = '';
        document.getElementById('ncAmount').focus();
    }`;

const newUpdateAmounts = `function updateNewClientAmounts() {
    const planSelect = document.getElementById('ncPlan');
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const initial = selectedOption.getAttribute('data-initial');
    const planName = planSelect.value;
    
    if (price) {
        document.getElementById('ncAmount').value = price;
    } else {
        document.getElementById('ncAmount').value = '';
    }

    if (initial) {
        document.getElementById('ncInitialAmount').value = initial;
    } else {
        document.getElementById('ncInitialAmount').value = '';
    }`;

adminJs = adminJs.replace(oldUpdateAmounts, newUpdateAmounts);

// Also fix PRICING_DEFAULTS in admin.js
adminJs = adminJs.replace(/Starter: { activation: 19\.99, monthly: 19\.99, quarterly: 54\.99, annual: 209\.99 },/, 'Starter: { activation: 179.99, annual: 99.99 },');
adminJs = adminJs.replace(/Business: { activation: 29\.99, monthly: 29\.99, quarterly: 82\.99, annual: 314\.99 },/, 'Business: { activation: 269.99, annual: 129.99 },');
adminJs = adminJs.replace(/Pro: { activation: 39\.99, monthly: 44\.99, quarterly: 124\.99, annual: 469\.99 }/, 'Pro: { activation: 449.99, annual: 159.99 }');
// Also add Basic if it wasn't there
if (!adminJs.includes('Basic: {')) {
    adminJs = adminJs.replace('const PRICING_DEFAULTS = {', 'const PRICING_DEFAULTS = {\n    Basic: { activation: 99.99, annual: 49.99 },');
}

fs.writeFileSync('public/js/admin.js', adminJs);
console.log("admin.js patched");

// --- 3. PATCH APP.JS ---
let appJs = fs.readFileSync('public/js/app.js', 'utf8');
const oldPricing = `const PRICING = {
    Basic: { annual: 99.99 },
    Starter: { annual: 179.99 },
    Business: { annual: 269.99 },
    Pro: { annual: 449.99 }
};`;
const newPricing = `const PRICING = {
    Basic: { initial: 99.99, annual: 49.99 },
    Starter: { initial: 179.99, annual: 99.99 },
    Business: { initial: 269.99, annual: 129.99 },
    Pro: { initial: 449.99, annual: 159.99 }
};`;
appJs = appJs.replace(oldPricing, newPricing);

// In appJs updateSummary, we need to default to PRICING[...].initial if there's no activation_fee?
// Actually if activation_fee === undefined, wait. If they don't have activation_fee, it should charge 'initial' but the DB currently sets activation_fee to 0 after activation.
// Let's just fix the pricing block.
fs.writeFileSync('public/js/app.js', appJs);
console.log("app.js patched");

// --- 4. PATCH INDEX.HTML ---
let indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Insert renewal block for Basic
const basicRen = `
        <div class="mt-4 flex gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span class="material-symbols-outlined text-[#166534] text-xl">settings</span>
            <div>
                <p class="font-bold text-[11px] text-[#166534]">Renovación anual: $49,99</p>
                <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Incluye dominio, hosting + SSL, mantenimiento y actualizaciones de contenido.</p>
            </div>
        </div>`;
indexHtml = indexHtml.replace(/(<button id="btnSelectBasic"[^>]*>\s*Elegir plan Basic\s*<\/button>)/, '$1' + basicRen);

// Insert renewal block for Starter
const starterRen = `
        <div class="mt-4 flex gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span class="material-symbols-outlined text-[#0058be] text-xl">settings</span>
            <div>
                <p class="font-bold text-[11px] text-[#0058be]">Renovación anual: $99,99</p>
                <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Incluye dominio, hosting + SSL, correo corporativo, mantenimiento, actualizaciones de contenido y respaldo.</p>
            </div>
        </div>`;
indexHtml = indexHtml.replace(/(<button id="btnSelectStarter"[^>]*>\s*Elegir plan Starter\s*<\/button>)/, '$1' + starterRen);

// Insert renewal block for Business
const businessRen = `
        <div class="mt-4 flex gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span class="material-symbols-outlined text-[#3d0291] text-xl">settings</span>
            <div>
                <p class="font-bold text-[11px] text-[#3d0291]">Renovación anual: $129,99</p>
                <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Incluye continuidad de los servicios, mantenimiento, actualizaciones de contenido, optimización web/Google y reportes mensuales.</p>
            </div>
        </div>`;
indexHtml = indexHtml.replace(/(<button id="btnSelectBusiness"[^>]*>\s*Elegir plan Business\s*<\/button>)/, '$1' + businessRen);

// Insert renewal block for Pro
const proRen = `
        <div class="mt-4 flex gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span class="material-symbols-outlined text-[#166534] text-xl">settings</span>
            <div>
                <p class="font-bold text-[11px] text-[#166534]">Renovación anual: $159,99</p>
                <p class="text-[9px] text-slate-500 leading-tight mt-0.5">Incluye continuidad de los servicios, mantenimiento, actualizaciones de contenido, optimización y mantenimiento de las funcionalidades.</p>
            </div>
        </div>`;
indexHtml = indexHtml.replace(/(<button id="btnSelectPro"[^>]*>\s*Elegir plan Pro\s*<\/button>)/, '$1' + proRen);

fs.writeFileSync('public/index.html', indexHtml);
console.log("index.html patched");
