const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');

const target = `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Plan a Facturar</label>`;

const replacement = `<div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Contacto *</label>
                        <input type="text" id="ncContact" required placeholder="Ej: María Castro" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Email</label>
                        <input type="email" id="ncEmail" placeholder="mcastro@empresa.ec" class="w-full px-4 py-2.5 rounded-xl border border-outline-variant focus:border-primary text-xs bg-surface">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-on-surface mb-1">Plan a Facturar</label>`;

html = html.replace(target, replacement);
html = html.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');

fs.writeFileSync('public/admin.html', html);
