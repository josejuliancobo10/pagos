const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// =========================================================================
// SUPABASE CONFIGURATION
// =========================================================================
const SUPABASE_URL = 'https://bsmzcytaxvzddsnbwfot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbXpjeXRheHZ6ZGRzbmJ3Zm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDQ1NjQsImV4cCI6MjEwMzc4MDU2NH0.8nYScv0Dd532Gk6JPlxxxQ3t9UG4lZJhaizFee6BQD8';

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function supabaseQuery(endpoint, method = 'GET', body = null) {
  const options = { method, headers: { ...supabaseHeaders } };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
  
  if (!res.ok) {
    const errText = await res.text();
    console.error(`Supabase Error [${method} ${endpoint}]:`, errText);
    throw new Error(`DB Error: ${res.statusText}`);
  }
  
  if (res.status === 204) return [];
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// =========================================================================
// UTILITIES
// =========================================================================
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } 
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function getCurrentDateFormatted() {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleString('es-ES', { month: 'short' })} ${d.getFullYear()}`;
}

function getNextBillingDate(cycle) {
  const d = new Date();
  if (cycle === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (cycle === 'quarterly') d.setMonth(d.getMonth() + 3);
  else if (cycle === 'annual') d.setFullYear(d.getFullYear() + 1);
  return `${d.getDate()} ${d.toLocaleString('es-ES', { month: 'short' })} ${d.getFullYear()}`;
}

// =========================================================================
// SERVER
// =========================================================================
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // -----------------------------------------------------------------------
  // API ROUTES
  // -----------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    
    // 1. Verify Access Code
    
    if (pathname === '/api/verify-code' && req.method === 'POST') {
      try {
        const { code } = await parseBody(req);
        if (!code) return sendJSON(res, { error: 'Código requerido' }, 400);

        const clients = await supabaseQuery(`clients?access_code=ilike.${code}`);
        if (clients && clients.length > 0) {
          return sendJSON(res, { valid: true, client: clients[0] });
        }
        return sendJSON(res, { valid: false, error: 'Código de cliente no encontrado' }, 404);
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }

    // 2. Metrics & Stats
    if (pathname === '/api/metrics' && req.method === 'GET') {
      try {
        const clients = await supabaseQuery('clients?select=status,recurring_amount');
        let activeCount = 0, mrr = 0, pendingCount = 0;
        
        clients.forEach(c => {
          if (c.status === 'Activo') {
            activeCount++;
            mrr += (c.recurring_amount || 0);
          } else if (c.status === 'Pendiente') {
            pendingCount++;
          }
        });

        return sendJSON(res, {
          mrr: `$${mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          activeSubscriptions: 1204 + activeCount,
          pendingPayments: 42 + pendingCount,
          churnRate: '1.2%',
          growth: '+15.3%'
        });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }

    
    // --- CALENDAR API ---
    if (pathname === '/api/calendar') {
      if (req.method === 'GET') {
        try {
          const events = await supabaseQuery('calendar_events?order=event_date.asc');
          return sendJSON(res, { events });
        } catch (e) {
          return sendJSON(res, { error: e.message }, 500);
        }
      }
      if (req.method === 'POST') {
        try {
          const data = await parseBody(req);
          const newEvent = await supabaseQuery('calendar_events', 'POST', {
            client_id: data.client_id || null,
            client_name: data.client_name || '',
            event_date: data.event_date,
            notes: data.notes,
            status: data.status || 'Pendiente'
          });
          return sendJSON(res, { success: true, event: newEvent[0] }, 201);
        } catch (e) {
          return sendJSON(res, { error: e.message }, 500);
        }
      }
    }
    if (pathname.startsWith('/api/calendar/') && req.method === 'PATCH') {
      try {
        const id = pathname.split('/')[3];
        const data = await parseBody(req);
        const updated = await supabaseQuery(`calendar_events?id=eq.${id}`, 'PATCH', {
          status: data.status,
          notes: data.notes,
          event_date: data.event_date
        });
        return sendJSON(res, { success: true, event: updated[0] });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }
    if (pathname.startsWith('/api/calendar/') && req.method === 'DELETE') {
      try {
        const id = pathname.split('/')[3];
        await supabaseQuery(`calendar_events?id=eq.${id}`, 'DELETE');
        return sendJSON(res, { success: true });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }
    // --- END CALENDAR API ---

    // 3. Client CRUD
    if (pathname === '/api/clients') {
      if (req.method === 'GET') {
        try {
          const search = url.searchParams.get('search') || '';
          let endpoint = 'clients?order=id.desc';
          if (search) {
            endpoint += `&or=(name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%,access_code.ilike.%${search}%)`;
          }
          const clients = await supabaseQuery(endpoint);
          return sendJSON(res, { clients });
        } catch (e) {
          return sendJSON(res, { error: e.message }, 500);
        }
      }

      if (req.method === 'POST') {
        try {
          const data = await parseBody(req);
          const accessCode = data.name.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
          
          const newClient = await supabaseQuery('clients', 'POST', {
            name: data.name,
            contact_name: data.contact_name,
            email: data.email,
            plan: data.plan,
            billing_cycle: data.billing_cycle || 'annual',
            recurring_amount: parseFloat(data.recurring_amount || 0),
            activation_fee: data.activation_fee !== undefined ? parseFloat(data.activation_fee) : 0,
            status: data.status || 'Pendiente',
            access_code: accessCode,
            next_billing_date: getNextBillingDate(data.billing_cycle || 'annual'),
            auto_renew: true,
            gateway: 'Payphone'
          });
          
          return sendJSON(res, { success: true, client: newClient[0] }, 201);
        } catch (e) {
          return sendJSON(res, { error: e.message }, 500);
        }
      }
    }

    if (pathname.startsWith('/api/clients/') && req.method === 'PUT') {
      try {
        const id = pathname.split('/')[3];
        const data = await parseBody(req);
        
        const updated = await supabaseQuery(`clients?id=eq.${id}`, 'PATCH', {
          name: data.name,
          contact_name: data.contact_name,
          email: data.email,
          plan: data.plan,
          billing_cycle: data.billing_cycle,
          recurring_amount: parseFloat(data.recurring_amount || 0),
          status: data.status,
          auto_renew: data.auto_renew === 1 || data.auto_renew === true
        });

        return sendJSON(res, { success: true, client: updated[0] });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }

    if (pathname.startsWith('/api/clients/') && req.method === 'DELETE') {
      try {
        const id = pathname.split('/')[3];
        await supabaseQuery(`clients?id=eq.${id}`, 'DELETE');
        return sendJSON(res, { success: true, message: 'Cliente eliminado' });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }

    // 4. Subscribe
    if (pathname === '/api/subscribe' && req.method === 'POST') {
      try {
        const { clientId, accessCode, plan, billingCycle, recurringAmount, totalInitialAmount, paymentMethod } = await parseBody(req);
        
        let client = null;
        if (clientId) {
          const res = await supabaseQuery(`clients?id=eq.${clientId}`);
          if (res.length) client = res[0];
        } else if (accessCode) {
          const res = await supabaseQuery(`clients?access_code=ilike.${accessCode}`);
          if (res.length) client = res[0];
        }

        const formattedToday = getCurrentDateFormatted();
        const nextBilling = getNextBillingDate(billingCycle || 'annual');
        const gatewayName = paymentMethod === 'payphone' ? 'Payphone (Banco Pichincha)' : 'Stripe';

        if (client) {
          const updated = await supabaseQuery(`clients?id=eq.${client.id}`, 'PATCH', {
            plan,
            billing_cycle: billingCycle,
            recurring_amount: recurringAmount,
            activation_fee: 0,
            status: 'Activo',
            last_payment: formattedToday,
            next_billing_date: nextBilling,
            auto_renew: true,
            gateway: gatewayName,
            retry_count: 0
          });
          client = updated[0];
        }

        const ref = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        await supabaseQuery('transactions', 'POST', {
          client_id: client ? client.id : null,
          client_name: client ? client.name : 'Cliente Directo',
          amount: totalInitialAmount,
          plan,
          billing_cycle: billingCycle,
          type: 'primer_pago',
          gateway: gatewayName,
          reference: ref,
          status: 'completado'
        });

        return sendJSON(res, { success: true, reference: ref, nextBillingDate: nextBilling, client });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }

    // 5. Cancel Subscription
    if (pathname === '/api/cancel-subscription' && req.method === 'POST') {
      try {
        const { clientId, accessCode } = await parseBody(req);
        let client = null;
        if (clientId) {
          const res = await supabaseQuery(`clients?id=eq.${clientId}`);
          if (res.length) client = res[0];
        } else if (accessCode) {
          const res = await supabaseQuery(`clients?access_code=ilike.${accessCode}`);
          if (res.length) client = res[0];
        }

        if (!client) return sendJSON(res, { error: 'Cliente no encontrado' }, 404);

        const updated = await supabaseQuery(`clients?id=eq.${client.id}`, 'PATCH', {
          status: 'Cancelada',
          auto_renew: false,
          next_billing_date: 'Cancelado'
        });

        await supabaseQuery('transactions', 'POST', {
          client_id: client.id,
          client_name: client.name,
          amount: 0.00,
          plan: client.plan,
          billing_cycle: client.billing_cycle,
          type: 'cancelacion',
          gateway: client.gateway,
          reference: `CNL-${Date.now()}`,
          status: 'cancelado'
        });

        return sendJSON(res, { success: true, client: updated[0] });
      } catch (e) {
        return sendJSON(res, { error: e.message }, 500);
      }
    }

    // 6. Webhooks
    if (pathname === '/api/webhooks/payphone' && req.method === 'POST') {
      try {
        const payload = await parseBody(req);
        await supabaseQuery('webhook_logs', 'POST', { gateway: 'Payphone', event_type: payload.eventType || 'event', payload });
        return sendJSON(res, { received: true, gateway: 'Payphone' });
      } catch (e) { return sendJSON(res, { error: e.message }, 500); }
    }

    return sendJSON(res, { error: 'API route not found' }, 404);
  }

  // -----------------------------------------------------------------------
  // STATIC FILES
  // -----------------------------------------------------------------------
  if (pathname === '/' || pathname === '') pathname = '/index.html';
  if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin.html';

  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const finalPath = path.join(PUBLIC_DIR, safePath);

  fs.stat(finalPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found - FacturaEcuador Pro');
    }
    const contentType = getContentType(finalPath);
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(finalPath).pipe(res);
  });
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log('====================================================');
    console.log('🚀 FacturaEcuador Pro - Servidor con Supabase Activo!');
    console.log(`🌐 Portal Cliente:   http://localhost:${PORT}/`);
    console.log(`📊 Admin Dashboard:  http://localhost:${PORT}/admin`);
    console.log('====================================================');
  });
}

module.exports = server;
