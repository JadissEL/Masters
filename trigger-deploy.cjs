const fs = require('fs');
const https = require('https');

const API_KEY = 'rnd_mBLYtHkhOevqKagAY7GQhbfs9r7A';
const SERVICE_ID = 'srv-d99968d8nd3s73bdke30';

const data = JSON.stringify({ clearCache: 'clear' });

const options = {
  hostname: 'api.render.com',
  path: `/v1/services/${SERVICE_ID}/deploys`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log(body);
    fs.writeFileSync('deploy-response.json', body);
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();