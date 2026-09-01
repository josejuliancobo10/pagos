async function run() {
  const res = await fetch('https://pagos-blue.vercel.app/api/clients');
  console.log(res.status);
  console.log(await res.text());
}
run();
