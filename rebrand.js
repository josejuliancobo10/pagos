const fs = require('fs');

function rebrand(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // index.html specific
    content = content.replace(/<title>Suscripción y Planes \| FacturaEcuador Pro<\/title>/, '<title>Suscripción y Planes | Parvis</title>');
    
    // index.html hero text (slogan)
    content = content.replace(/Sitio web profesional \+ correo corporativo \+ herramientas inteligentes para crecer/, 'Pequeños comienzos. Grandes posibilidades.');
    
    // index.html top nav logo
    content = content.replace(/<span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">cloud_done<\/span>\s*<span>FacturaEcuador <span class="text-secondary font-black">Pro<\/span><\/span>/g, '<img src="/images/parvis-logo.png" alt="Parvis" class="h-8 md:h-10">');
    
    // index.html footer logo
    content = content.replace(/<span class="material-symbols-outlined text-primary">cloud_done<\/span> FacturaEcuador Pro/g, '<img src="/images/parvis-logo.png" alt="Parvis" class="h-6">');
    content = content.replace(/© 2024 FacturaEcuador Pro/g, '© 2026 Parvis');
    
    // admin.html specific
    content = content.replace(/<title>Admin Billing & Suscripciones - FacturaEcuador Pro<\/title>/, '<title>Admin Billing - Parvis</title>');
    
    // admin.html mobile header
    content = content.replace(/<span class="material-symbols-outlined text-primary" data-weight="fill">cloud_done<\/span>\s*Admin Billing/g, '<img src="/images/parvis-icon.png" alt="Parvis" class="h-6">\nAdmin Billing');
    
    // admin.html desktop sidebar
    content = content.replace(/<div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">\s*<span class="material-symbols-outlined text-2xl" data-weight="fill">cloud_done<\/span>\s*<\/div>\s*<div>\s*<h1 class="text-lg font-black text-on-surface tracking-tight leading-tight">Admin Billing<\/h1>/g, '<div class="w-12 h-12 flex items-center justify-center shadow-md rounded-2xl overflow-hidden">\n<img src="/images/parvis-icon.png" alt="Parvis" class="w-full h-full object-cover">\n</div>\n<div>\n<h1 class="text-lg font-black text-on-surface tracking-tight leading-tight">Admin Billing</h1>');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

rebrand('public/index.html');
rebrand('public/admin.html');

console.log('Rebranded HTML files to Parvis');
