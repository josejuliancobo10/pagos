const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// We will replace the entire <section id="planes"> ... </section>
const planesRegex = /<section id="planes"[^>]*>[\s\S]*?<\/section>/;
const newPlanesHtml = `
<section id="planes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1300px] mx-auto items-stretch">
    <!-- 1. BASIC CARD -->
    <div id="cardBasic" class="plan-card bg-white border-2 border-[#166534] rounded-3xl p-5 flex flex-col relative shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer" onclick="selectPlan('Basic')">
        <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-md shrink-0">
                <span class="material-symbols-outlined">rocket_launch</span>
            </div>
            <div>
                <h3 class="text-xl font-black text-on-surface tracking-tight uppercase">BASIC</h3>
                <p class="text-[10px] text-on-surface-variant leading-tight">Ideal para emprendedores que inician</p>
            </div>
        </div>
        <div class="my-2 pb-3 border-b border-outline-variant text-center">
            <div class="flex justify-center items-baseline gap-1">
                <span class="text-4xl font-black text-[#166534] tracking-tight">$99,99</span>
                <span class="text-xs font-bold text-on-surface-variant">/año</span>
            </div>
        </div>
        <div class="space-y-3 my-3 flex-grow text-[11px] leading-relaxed text-on-surface">
            <p class="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">TODO LO QUE INCLUYE:</p>
            <ul class="space-y-1.5 pl-0 text-slate-600">
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Landing page profesional</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Dominio propio</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Hosting y SSL</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Responsive</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Actualizaciones y mantenimiento</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Formulario de contacto</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Botón directo a WhatsApp</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#166534] text-[14px]">check_circle</span> Ícono en la pestaña</li>
            </ul>
            <div class="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center text-[10px] font-bold text-slate-500 mt-2 flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span> ENTREGA DE 2 A 3 DÍAS
            </div>
        </div>
        <button id="btnSelectBasic" class="w-full mt-2 bg-[#166534] hover:bg-green-900 text-white font-bold py-3 rounded-xl transition-all shadow-md text-[13px]">
            Elegir plan Basic
        </button>
    </div>

    <!-- 2. STARTER CARD -->
    <div id="cardStarter" class="plan-card bg-white border-2 border-[#0058be] rounded-3xl p-5 flex flex-col relative shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer" onclick="selectPlan('Starter')">
        <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 rounded-full bg-[#0058be] text-white flex items-center justify-center shadow-md shrink-0">
                <span class="material-symbols-outlined">web</span>
            </div>
            <div>
                <h3 class="text-xl font-black text-on-surface tracking-tight uppercase">STARTER</h3>
                <p class="text-[10px] text-on-surface-variant leading-tight">Ideal para emprendedores individuales</p>
            </div>
        </div>
        <div class="my-2 pb-3 border-b border-outline-variant text-center">
            <div class="flex justify-center items-baseline gap-1">
                <span class="text-4xl font-black text-[#0058be] tracking-tight">$179,99</span>
                <span class="text-xs font-bold text-on-surface-variant">/año</span>
            </div>
        </div>
        <div class="space-y-3 my-3 flex-grow text-[11px] leading-relaxed text-on-surface">
            <p class="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">TODO LO QUE INCLUYE:</p>
            <ul class="space-y-1.5 pl-0 text-slate-600">
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Página web profesional</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Hasta 5 páginas</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Dominio propio</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Hosting + SSL</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Adaptada a todos los dispositivos</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Ícono en la pestaña</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Formulario de contacto</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Botón directo a WhatsApp</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Mapa de ubicación</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Enlaces a redes sociales</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#0058be] text-[14px]">check_circle</span> Actualizaciones y mantenimiento</li>
            </ul>
            <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-2">
                <p class="font-bold text-[#0058be] flex items-center gap-1 text-[10px] uppercase mb-1"><span class="material-symbols-outlined text-[14px]">mail</span> CORREO CORPORATIVO</p>
                <ul class="space-y-1 text-slate-600">
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#0058be] text-[12px]">check</span> 1 buzón corporativo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#0058be] text-[12px]">check</span> 5 GB de almacenamiento</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#0058be] text-[12px]">check</span> 5 alias de email</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#0058be] text-[12px]">check</span> 5 reglas de reenvío</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#0058be] text-[12px]">check</span> Backup completo</li>
                </ul>
            </div>
            <div class="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center text-[10px] font-bold text-slate-500 mt-2 flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span> ENTREGA DE 3 A 5 DÍAS
            </div>
        </div>
        <button id="btnSelectStarter" class="w-full mt-2 bg-[#0058be] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-md text-[13px]">
            Elegir plan Starter
        </button>
    </div>

    <!-- 3. BUSINESS CARD -->
    <div id="cardBusiness" class="plan-card bg-white border-2 border-[#4e03b8] rounded-3xl p-5 flex flex-col relative shadow-xl transform lg:-translate-y-2 ring-4 ring-purple-50 transition-all duration-300 cursor-pointer" onclick="selectPlan('Business')">
        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4e03b8] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
            ★ MÁS VENDIDO
        </div>
        <div class="flex items-center gap-2 mb-3 mt-1">
            <div class="w-10 h-10 rounded-full bg-[#4e03b8] text-white flex items-center justify-center shadow-md shrink-0">
                <span class="material-symbols-outlined">business_center</span>
            </div>
            <div>
                <h3 class="text-xl font-black text-on-surface tracking-tight uppercase">BUSINESS</h3>
                <p class="text-[10px] text-on-surface-variant leading-tight">Ideal para pequeñas empresas</p>
            </div>
        </div>
        <div class="my-2 pb-3 border-b border-outline-variant text-center">
            <div class="flex justify-center items-baseline gap-1">
                <span class="text-4xl font-black text-[#4e03b8] tracking-tight">$269,99</span>
                <span class="text-xs font-bold text-on-surface-variant">/año</span>
            </div>
        </div>
        <div class="space-y-3 my-3 flex-grow text-[11px] leading-relaxed text-on-surface">
            <p class="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">TODO LO QUE INCLUYE:</p>
            <ul class="space-y-1.5 pl-0 text-slate-600">
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Página web profesional</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Hasta 8 páginas</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Dominio propio</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Hosting + SSL</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Adaptada a todos los dispositivos</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Ícono en la pestaña</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Formulario de contacto</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Botón directo a WhatsApp</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Mapa de ubicación</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Enlaces a redes sociales</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[14px]">check_circle</span> Actualizaciones y mantenimiento</li>
            </ul>
            <div class="bg-purple-50 border border-purple-100 rounded-lg p-3 mt-2">
                <p class="font-bold text-[#4e03b8] flex items-center gap-1 text-[10px] uppercase mb-1"><span class="material-symbols-outlined text-[14px]">language</span> FUNCIONALIDADES AVANZADAS</p>
                <ul class="space-y-1 text-slate-600">
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> Backup completo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> Chatbot web</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> Optimizado para Google</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> Reporte de estadísticas</li>
                </ul>
            </div>
            <div class="bg-purple-50 border border-purple-100 rounded-lg p-3 mt-2">
                <p class="font-bold text-[#4e03b8] flex items-center gap-1 text-[10px] uppercase mb-1"><span class="material-symbols-outlined text-[14px]">mail</span> CORREO CORPORATIVO</p>
                <ul class="space-y-1 text-slate-600">
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> 1 buzón corporativo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> 20 reglas de reenvío</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> 20 GB de almacenamiento</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> IA para gestionar correo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> 10 alias de email</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> Saber quién abrió tus emails</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#4e03b8] text-[12px]">check</span> Respuestas automáticas</li>
                </ul>
            </div>
            <div class="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center text-[10px] font-bold text-slate-500 mt-2 flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span> ENTREGA DE 3 A 5 DÍAS
            </div>
        </div>
        <button id="btnSelectBusiness" class="w-full mt-2 bg-[#4e03b8] hover:bg-purple-900 text-white font-black py-3.5 rounded-xl transition-all shadow-md text-[13px]">
            Elegir plan Business
        </button>
    </div>

    <!-- 4. PRO CARD -->
    <div id="cardPro" class="plan-card bg-white border-2 border-[#15803d] rounded-3xl p-5 flex flex-col relative shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer" onclick="selectPlan('Pro')">
        <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 rounded-full bg-[#15803d] text-white flex items-center justify-center shadow-md shrink-0">
                <span class="material-symbols-outlined">diamond</span>
            </div>
            <div>
                <h3 class="text-xl font-black text-on-surface tracking-tight uppercase">PRO</h3>
                <p class="text-[10px] text-on-surface-variant leading-tight">Ideal para equipos de alto rendimiento</p>
            </div>
        </div>
        <div class="my-2 pb-3 border-b border-outline-variant text-center">
            <div class="flex justify-center items-baseline gap-1">
                <span class="text-4xl font-black text-[#15803d] tracking-tight">$449,99</span>
                <span class="text-xs font-bold text-on-surface-variant">/año</span>
            </div>
        </div>
        <div class="space-y-3 my-3 flex-grow text-[11px] leading-relaxed text-on-surface">
            <p class="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">TODO LO QUE INCLUYE:</p>
            <ul class="space-y-1.5 pl-0 text-slate-600">
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Página web profesional</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Hasta 10 páginas</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Dominio propio</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Hosting + SSL</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Adaptada a todos los dispositivos</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Ícono en la pestaña</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Formulario de contacto</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Botón directo a WhatsApp</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Mapa de ubicación</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Enlaces a redes sociales</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Integración reservas/cotizadores</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Panel administrativo</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Capacitación</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Ecommerce (tienda virtual)</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Cobros con tarjeta</li>
                <li class="flex gap-1.5 items-start"><span class="material-symbols-outlined text-[#15803d] text-[14px]">check_circle</span> Actualizaciones y mantenimiento</li>
            </ul>
            <div class="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
                <p class="font-bold text-[#15803d] flex items-center gap-1 text-[10px] uppercase mb-1"><span class="material-symbols-outlined text-[14px]">language</span> FUNCIONALIDADES AVANZADAS</p>
                <ul class="space-y-1 text-slate-600">
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> Backup completo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> Chatbot web</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> Optimizado para Google</li>
                </ul>
            </div>
            <div class="bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
                <p class="font-bold text-[#15803d] flex items-center gap-1 text-[10px] uppercase mb-1"><span class="material-symbols-outlined text-[14px]">mail</span> CORREO CORPORATIVO</p>
                <ul class="space-y-1 text-slate-600">
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> 1 buzón corporativo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> 20 reglas de reenvío</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> 20 GB de almacenamiento</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> IA para gestionar correo</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> 10 alias de email</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> Saber quién abrió tus emails</li>
                    <li class="flex gap-1 items-start"><span class="material-symbols-outlined text-[#15803d] text-[12px]">check</span> Respuestas automáticas</li>
                </ul>
            </div>
            <div class="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center text-[10px] font-bold text-slate-500 mt-2 flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span> ENTREGA DE 10 A 15 DÍAS
            </div>
        </div>
        <button id="btnSelectPro" class="w-full mt-2 bg-[#15803d] hover:bg-green-900 text-white font-bold py-3 rounded-xl transition-all shadow-md text-[13px]">
            Elegir plan Pro
        </button>
    </div>
</section>
`;

html = html.replace(planesRegex, newPlanesHtml);
html = html.replace(/<section class="flex flex-col items-center gap-6">[\s\S]*?<\/section>/, '');

// Also remove activation fee references in HTML order summary
html = html.replace(/<div class="flex justify-between items-center text-on-surface-variant">\s*<span class="flex items-center gap-1">\s*Activación única[\s\S]*?<\/div>\s*<\/div>\s*<div class="pt-4 border-t-2 border-slate-200 mb-6 bg-white p-4 rounded-2xl border">\s*<div class="flex justify-between items-baseline">\s*<div>\s*<span class="text-xs font-extrabold uppercase text-slate-500">Primer Cobro Total[\s\S]*?<\/div>/, '');

fs.writeFileSync('public/index.html', html);
