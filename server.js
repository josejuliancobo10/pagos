const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.sqlite');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize SQLite Database
const db = new DatabaseSync(DB_FILE);

// Setup database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT,
    plan TEXT NOT NULL DEFAULT 'Business',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    recurring_amount REAL NOT NULL DEFAULT 29.99,
    activation_fee REAL NOT NULL DEFAULT 29.99,
    status TEXT NOT NULL DEFAULT 'Activo', -- 'Activo', 'Pendiente', 'Fallo de Cobro', 'Cancelada'
    access_code TEXT UNIQUE NOT NULL,
    last_payment TEXT NOT NULL,
    next_billing_date TEXT,
    auto_renew INTEGER NOT NULL DEFAULT 1,
    gateway TEXT DEFAULT 'Payphone',
    card_token TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    client_name TEXT,
    amount REAL,
    plan TEXT,
    billing_cycle TEXT,
    type TEXT, -- 'primer_pago', 'recurrente', 'reintento', 'cancelacion'
    gateway TEXT,
    reference TEXT,
    status TEXT, -- 'completado', 'fallido', 'cancelado'
    created_at TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS webhook_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gateway TEXT,
    event_type TEXT,
    payload TEXT,
    created_at TEXT
  );
`);

// Calculate next billing date helper
function getNextBillingDate(cycle) {
  const date = new Date();
  if (cycle === 'quarterly') {
    date.setMonth(date.getMonth() + 3);
  } else if (cycle === 'annual') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Format current date
function getCurrentDateFormatted() {
  const now = new Date();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Reset/Seed initial data with exact official prices if needed
const countClients = db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
if (countClients === 0) {
  const seed = [
    {
      name: 'Corporación El Rosado',
      contact_name: 'Carlos Rosado',
      email: 'facturacion@elrosado.com.ec',
      plan: 'Business',
      billing_cycle: 'monthly',
      recurring_amount: 29.99,
      activation_fee: 29.99,
      status: 'Activo',
      access_code: 'ROSADO2024',
      last_payment: getCurrentDateFormatted(),
      next_billing_date: getNextBillingDate('monthly'),
      auto_renew: 1,
      gateway: 'Payphone',
      card_token: 'tok_payphone_83921',
      created_at: new Date().toISOString()
    },
    {
      name: 'Farmacias SanaSana',
      contact_name: 'Mariana Gómez',
      email: 'mgomez@sanasana.com.ec',
      plan: 'Pro',
      billing_cycle: 'quarterly',
      recurring_amount: 124.99,
      activation_fee: 39.99,
      status: 'Fallo de Cobro',
      access_code: 'SANASANA2024',
      last_payment: '01 Sep 2023',
      next_billing_date: 'Vencido (Reintentando)',
      auto_renew: 1,
      gateway: 'Payphone',
      card_token: 'tok_payphone_94821',
      retry_count: 2,
      created_at: new Date().toISOString()
    },
    {
      name: 'Consultora XYZ',
      contact_name: 'Esteban Morales',
      email: 'info@consultoraxyz.ec',
      plan: 'Starter',
      billing_cycle: 'annual',
      recurring_amount: 209.99,
      activation_fee: 19.99,
      status: 'Activo',
      access_code: 'XYZ2024',
      last_payment: getCurrentDateFormatted(),
      next_billing_date: getNextBillingDate('annual'),
      auto_renew: 1,
      gateway: 'Stripe',
      card_token: 'tok_stripe_10293',
      created_at: new Date().toISOString()
    },
    {
      name: 'TechCorp S.A.',
      contact_name: 'Juan Pérez',
      email: 'jperez@techcorp.com.ec',
      plan: 'Business',
      billing_cycle: 'monthly',
      recurring_amount: 29.99,
      activation_fee: 29.99,
      status: 'Activo',
      access_code: 'TECHCORP',
      last_payment: getCurrentDateFormatted(),
      next_billing_date: getNextBillingDate('monthly'),
      auto_renew: 1,
      gateway: 'Payphone',
      card_token: 'tok_payphone_44921',
      created_at: new Date().toISOString()
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO clients (name, contact_name, email, plan, billing_cycle, recurring_amount, activation_fee, status, access_code, last_payment, next_billing_date, auto_renew, gateway, card_token, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of seed) {
    insertStmt.run(c.name, c.contact_name, c.email, c.plan, c.billing_cycle, c.recurring_amount, c.activation_fee, c.status, c.access_code, c.last_payment, c.next_billing_date, c.auto_renew, c.gateway, c.card_token, c.created_at);
  }
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Parse JSON body helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Send JSON helper
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API ROUTES ---

  // 1. Verify Client Access Code & Load Subscription Status
  if (pathname === '/api/verify-code' && method === 'POST') {
    try {
      const { code } = await parseBody(req);
      if (!code) {
        return sendJSON(res, { error: 'Código de acceso requerido' }, 400);
      }

      const client = db.prepare('SELECT * FROM clients WHERE UPPER(access_code) = UPPER(?)').get(code.trim());
      if (client) {
        return sendJSON(res, { valid: true, client });
      } else {
        // Fallback for demo code 1234
        if (code.trim() === '1234' || code.trim().toUpperCase() === 'DEMO') {
          const defaultClient = db.prepare('SELECT * FROM clients WHERE access_code = "TECHCORP"').get();
          if (defaultClient) return sendJSON(res, { valid: true, client: defaultClient });
        }
        return sendJSON(res, { valid: false, error: 'Código de acceso inválido o expirado' }, 401);
      }
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // 2. Metrics for Dashboard
  if (pathname === '/api/metrics' && method === 'GET') {
    try {
      const totalRecurring = db.prepare("SELECT SUM(recurring_amount) as total FROM clients WHERE status = 'Activo'").get().total || 0;
      const activeCount = db.prepare("SELECT COUNT(*) as count FROM clients WHERE status = 'Activo'").get().count || 0;
      const pendingCount = db.prepare("SELECT COUNT(*) as count FROM clients WHERE status IN ('Pendiente', 'Fallo de Cobro')").get().count || 0;
      const canceledCount = db.prepare("SELECT COUNT(*) as count FROM clients WHERE status = 'Cancelada'").get().count || 0;

      return sendJSON(res, {
        totalRevenue: `$${(24500.00 + totalRecurring - 269.97).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        activeSubscriptions: 1204 + (activeCount - 3),
        pendingPayments: 42 + (pendingCount - 1),
        canceledSubscriptions: 15 + canceledCount,
        growth: '+12.5%'
      });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // 3. Clients CRUD
  if (pathname === '/api/clients' && method === 'GET') {
    try {
      const search = parsedUrl.searchParams.get('q') || '';
      let clients;
      if (search) {
        clients = db.prepare(`
          SELECT * FROM clients 
          WHERE name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR plan LIKE ? OR access_code LIKE ?
          ORDER BY id DESC
        `).all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      } else {
        clients = db.prepare('SELECT * FROM clients ORDER BY id DESC').all();
      }
      return sendJSON(res, { clients });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // Create new client & payment link
  if (pathname === '/api/clients' && method === 'POST') {
    try {
      const data = await parseBody(req);
      if (!data.name || !data.contact_name) {
        return sendJSON(res, { error: 'Nombre de empresa y contacto son requeridos' }, 400);
      }

      const cleanName = data.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const accessCode = data.access_code || `${cleanName || 'CLIENT'}${randomSuffix}`;
      
      const now = new Date();
      const lastPayment = getCurrentDateFormatted();
      const nextBilling = getNextBillingDate(data.billing_cycle || 'monthly');

      const stmt = db.prepare(`
        INSERT INTO clients (name, contact_name, email, plan, billing_cycle, recurring_amount, activation_fee, status, access_code, last_payment, next_billing_date, auto_renew, gateway, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Payphone', ?)
      `);

      const result = stmt.run(
        data.name,
        data.contact_name,
        data.email || '',
        data.plan || 'Business',
        data.billing_cycle || 'monthly',
        parseFloat(data.recurring_amount) || 29.99,
        parseFloat(data.activation_fee) || 29.99,
        data.status || 'Pendiente',
        accessCode,
        lastPayment,
        nextBilling,
        now.toISOString()
      );

      const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
      return sendJSON(res, {
        success: true,
        client: newClient,
        link: `/index.html?code=${accessCode}`
      }, 201);
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // Update client
  if (pathname.startsWith('/api/clients/') && method === 'PUT') {
    try {
      const id = parseInt(pathname.split('/')[3], 10);
      const data = await parseBody(req);

      const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      if (!existing) {
        return sendJSON(res, { error: 'Cliente no encontrado' }, 404);
      }

      const stmt = db.prepare(`
        UPDATE clients 
        SET name = ?, contact_name = ?, email = ?, plan = ?, billing_cycle = ?, recurring_amount = ?, activation_fee = ?, status = ?, auto_renew = ?
        WHERE id = ?
      `);

      stmt.run(
        data.name !== undefined ? data.name : existing.name,
        data.contact_name !== undefined ? data.contact_name : existing.contact_name,
        data.email !== undefined ? data.email : existing.email,
        data.plan !== undefined ? data.plan : existing.plan,
        data.billing_cycle !== undefined ? data.billing_cycle : existing.billing_cycle,
        data.recurring_amount !== undefined ? parseFloat(data.recurring_amount) : existing.recurring_amount,
        data.activation_fee !== undefined ? parseFloat(data.activation_fee) : existing.activation_fee,
        data.status !== undefined ? data.status : existing.status,
        data.auto_renew !== undefined ? data.auto_renew : existing.auto_renew,
        id
      );

      const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
      return sendJSON(res, { success: true, client: updated });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // Delete client
  if (pathname.startsWith('/api/clients/') && method === 'DELETE') {
    try {
      const id = parseInt(pathname.split('/')[3], 10);
      db.prepare('DELETE FROM clients WHERE id = ?').run(id);
      return sendJSON(res, { success: true, message: 'Cliente eliminado' });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // 4. Process Subscription & Auto-Recurring Setup (Netflix/Spotify model)
  if (pathname === '/api/subscribe' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { clientId, accessCode, plan, billingCycle, recurringAmount, activationFee, totalInitialAmount, paymentMethod } = data;

      let client = null;
      if (clientId) {
        client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
      } else if (accessCode) {
        client = db.prepare('SELECT * FROM clients WHERE UPPER(access_code) = UPPER(?)').get(accessCode.trim());
      }

      const formattedToday = getCurrentDateFormatted();
      const nextBilling = getNextBillingDate(billingCycle || 'monthly');
      const gatewayName = paymentMethod === 'payphone' ? 'Payphone (Banco Pichincha)' : 'Stripe';
      const cardToken = `tok_${paymentMethod || 'payphone'}_${Date.now().toString(36)}`;

      // Update or create client
      if (client) {
        db.prepare(`
          UPDATE clients
          SET plan = ?, billing_cycle = ?, recurring_amount = ?, activation_fee = ?, status = 'Activo', 
              last_payment = ?, next_billing_date = ?, auto_renew = 1, gateway = ?, card_token = ?, retry_count = 0
          WHERE id = ?
        `).run(
          plan || client.plan,
          billingCycle || client.billing_cycle,
          parseFloat(recurringAmount) || 29.99,
          parseFloat(activationFee) || 29.99,
          formattedToday,
          nextBilling,
          gatewayName,
          cardToken,
          client.id
        );
      }

      // Record first payment transaction
      const ref = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      db.prepare(`
        INSERT INTO transactions (client_id, client_name, amount, plan, billing_cycle, type, gateway, reference, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'primer_pago', ?, ?, 'completado', ?)
      `).run(
        client ? client.id : null,
        client ? client.name : 'Cliente Directo',
        parseFloat(totalInitialAmount) || (parseFloat(recurringAmount) + parseFloat(activationFee)),
        plan || 'Business',
        billingCycle || 'monthly',
        gatewayName,
        ref,
        new Date().toISOString()
      );

      return sendJSON(res, {
        success: true,
        reference: ref,
        cardToken: cardToken,
        nextBillingDate: nextBilling,
        message: '¡Suscripción y cobro recurrente automático activado con éxito!',
        client: client ? db.prepare('SELECT * FROM clients WHERE id = ?').get(client.id) : null
      });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // 5. Cancel Subscription (Client or Admin)
  if (pathname === '/api/cancel-subscription' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { clientId, accessCode, reason, canceledBy } = data;

      let client = null;
      if (clientId) {
        client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
      } else if (accessCode) {
        client = db.prepare('SELECT * FROM clients WHERE UPPER(access_code) = UPPER(?)').get(accessCode.trim());
      }

      if (!client) {
        return sendJSON(res, { error: 'Cliente no encontrado' }, 404);
      }

      // Update client status
      db.prepare(`
        UPDATE clients
        SET status = 'Cancelada', auto_renew = 0, next_billing_date = 'Cancelado'
        WHERE id = ?
      `).run(client.id);

      // Record cancellation event in transactions
      const ref = `CNL-${Date.now()}`;
      db.prepare(`
        INSERT INTO transactions (client_id, client_name, amount, plan, billing_cycle, type, gateway, reference, status, created_at)
        VALUES (?, ?, 0.00, ?, ?, 'cancelacion', ?, ?, 'cancelado', ?)
      `).run(
        client.id,
        client.name,
        client.plan,
        client.billing_cycle,
        client.gateway || 'Payphone',
        ref,
        new Date().toISOString()
      );

      console.log(`[SUBSCRIPTION CANCELED] Client: ${client.name} (ID: ${client.id}) canceled by ${canceledBy || 'Cliente'}. Reason: ${reason || 'Sin motivo especificado'}`);

      return sendJSON(res, {
        success: true,
        reference: ref,
        message: 'Suscripción cancelada exitosamente. No se realizarán más cobros automáticos.',
        client: db.prepare('SELECT * FROM clients WHERE id = ?').get(client.id)
      });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // 6. Retry Failed Payment (Dunning mechanism)
  if (pathname === '/api/retry-payment' && method === 'POST') {
    try {
      const data = await parseBody(req);
      const { clientId } = data;
      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
      
      if (!client) {
        return sendJSON(res, { error: 'Cliente no encontrado' }, 404);
      }

      const formattedToday = getCurrentDateFormatted();
      const nextBilling = getNextBillingDate(client.billing_cycle);
      const ref = `RETRY-${Date.now()}`;

      // Simulate successful retry
      db.prepare(`
        UPDATE clients
        SET status = 'Activo', last_payment = ?, next_billing_date = ?, retry_count = 0, auto_renew = 1
        WHERE id = ?
      `).run(formattedToday, nextBilling, client.id);

      db.prepare(`
        INSERT INTO transactions (client_id, client_name, amount, plan, billing_cycle, type, gateway, reference, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'reintento', ?, ?, 'completado', ?)
      `).run(
        client.id,
        client.name,
        client.recurring_amount,
        client.plan,
        client.billing_cycle,
        client.gateway || 'Payphone',
        ref,
        new Date().toISOString()
      );

      return sendJSON(res, {
        success: true,
        reference: ref,
        message: '¡Cobro reintentado y procesado exitosamente!',
        client: db.prepare('SELECT * FROM clients WHERE id = ?').get(client.id)
      });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // 7. Webhooks for Payphone & Stripe
  if (pathname === '/api/webhooks/payphone' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      db.prepare(`
        INSERT INTO webhook_logs (gateway, event_type, payload, created_at)
        VALUES ('Payphone', ?, ?, ?)
      `).run(payload.eventType || 'payphone_event', JSON.stringify(payload), new Date().toISOString());

      // If webhook notifies of payment failure or success, handle accordingly
      if (payload.status === 'Approved' && payload.clientCode) {
        db.prepare("UPDATE clients SET status = 'Activo', last_payment = ? WHERE UPPER(access_code) = UPPER(?)")
          .run(getCurrentDateFormatted(), payload.clientCode);
      } else if (payload.status === 'Failed' && payload.clientCode) {
        db.prepare("UPDATE clients SET status = 'Fallo de Cobro', retry_count = retry_count + 1 WHERE UPPER(access_code) = UPPER(?)")
          .run(payload.clientCode);
      }

      return sendJSON(res, { received: true, gateway: 'Payphone' });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  if (pathname === '/api/webhooks/stripe' && method === 'POST') {
    try {
      const payload = await parseBody(req);
      db.prepare(`
        INSERT INTO webhook_logs (gateway, event_type, payload, created_at)
        VALUES ('Stripe', ?, ?, ?)
      `).run(payload.type || 'stripe_event', JSON.stringify(payload), new Date().toISOString());

      return sendJSON(res, { received: true, gateway: 'Stripe' });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // --- STATIC FILES ROUTING ---

  let filePath = pathname;
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  } else if (filePath === '/admin' || filePath === '/admin/') {
    filePath = '/admin.html';
  }

  const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const finalPath = path.join(PUBLIC_DIR, safePath);

  fs.stat(finalPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found - FacturaEcuador Pro');
    }

    const ext = path.extname(finalPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const readStream = fs.createReadStream(finalPath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 FacturaEcuador Pro - Servidor de Suscripciones Activo!`);
  console.log(`🌐 Portal Cliente:   http://localhost:${PORT}/`);
  console.log(`📊 Admin Dashboard:  http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
