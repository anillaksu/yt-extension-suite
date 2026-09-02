const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = '8bbe2f07a6bedcf2216be89542a64e9e';

async function listDns() {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await resp.json();
  console.log('Success:', data.success);
  if (data.result) {
    console.log(`=== Found ${data.result.length} DNS Records for forfor.site ===`);
    data.result.forEach(r => {
      console.log(`[${r.id}] ${r.type.padEnd(6)} ${r.name.padEnd(30)} -> ${r.content} (proxied: ${r.proxied})`);
    });
  } else {
    console.error('Errors:', data.errors);
  }
}

listDns().catch(console.error);
