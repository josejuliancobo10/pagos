const fs = require('fs');
let html = fs.readFileSync('public/admin.html', 'utf8');

const regex = /<div class="grid grid-cols-2 gap-4">[\s\S]*?Activación \(1 vez\):<\/span>[\s\S]*?<\/div>\s*<\/div>/;
html = html.replace(regex, `<div class="grid grid-cols-2 gap-4">
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
                </div>`);

html = html.replace(/src="js\/admin\.js\?v=\d+"/, 'src="js/admin.js?v=' + Date.now() + '"');
fs.writeFileSync('public/admin.html', html);
