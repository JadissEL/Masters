const https = require('https');

const API_KEY = 'rnd_mBLYtHkhOevqKagAY7GQhbfs9r7A';
const SERVICE_ID = 'srv-d99968d8nd3s73bdke30';
const DEPLOY_ID = 'dep-d99989t8nd3s73bdmttg';

const options = {
  hostname: 'api.render.com',
  path: `/v1/services/${SERVICE_ID}/deploys/${DEPLOY_ID}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    const data = JSON.parse(body);
    console.log('Status:', data.status);
    console.log('Started:', data.startedAt);
    console.log('Finished:', data.finishedAt || 'still running');
  });
});

req.on('error', (e) => console.error(e));
req.end();