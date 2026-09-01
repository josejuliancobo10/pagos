const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');

// Add the custom features div below the plan and price row
html = html.replace(/<div class="grid grid-cols-2 gap-4">\s*<div>\s*<label class="block text-xs font-bold text-on-surface mb-1">Plan a Facturar<\/label>[\s\S]*?<\/div>\s*<\/div>/,
(match) => match + `
                <div id="customFeaturesDiv" class="hidden mt-4">
                    <label class="block text-xs font-bold text-on-surface mb-1">Características Personalizadas (Opcional, una por línea)</label>
                    <textarea id="ncCustomFeatures" rows="4" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface" placeholder="Ej: Dominio propio\nHosting + SSL\nSoporte prioritario"></textarea>
                    <p class="text-[10px] text-slate-500 mt-1">Si dejas esto en blanco, se mostrarán las características normales de la tarjeta seleccionada.</p>
                </div>`
);

html = html.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
fs.writeFileSync('public/admin.html', html);

let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace(/src="js\/app\.js[^"]*"/, 'src="js/app.js?v=' + Date.now() + '"');
fs.writeFileSync('public/index.html', indexHtml);
