async function test() {
  const r1 = await fetch('http://localhost:3000/');
  console.log('GET / -> Status:', r1.status);
  
  const r2 = await fetch('http://localhost:3000/admin');
  console.log('GET /admin -> Status:', r2.status);

  const r3 = await fetch('http://localhost:3000/api/metrics');
  console.log('GET /api/metrics ->', await r3.json());

  const r4 = await fetch('http://localhost:3000/api/clients');
  const d4 = await r4.json();
  console.log('GET /api/clients count ->', d4.clients.length);

  const r5 = await fetch('http://localhost:3000/api/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'TECHCORP' })
  });
  console.log('POST /api/verify-code ->', await r5.json());

  const r6 = await fetch('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: 4,
      plan: 'Business',
      billingCycle: 'monthly',
      amount: 90.85,
      paymentMethod: 'card'
    })
  });
  console.log('POST /api/subscribe ->', await r6.json());
}
test().catch(console.error);
