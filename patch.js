const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const authCheck = `
    // ADMIN AUTHENTICATION
    const adminRoutes = ['/api/metrics', '/api/clients'];
    if (adminRoutes.some(r => pathname.startsWith(r))) {
      const authHeader = req.headers['x-admin-password'];
      if (authHeader !== 'admin123') {
        return sendJSON(res, { error: 'No autorizado. Contraseña incorrecta.' }, 401);
      }
    }
`;

code = code.replace(/if \(pathname === '\/api\/verify-code' && req\.method === 'POST'\) \{/, authCheck + "\n    if (pathname === '/api/verify-code' && req.method === 'POST') {");

fs.writeFileSync('server.js', code);
