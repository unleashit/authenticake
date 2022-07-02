const { readFileSync, writeFileSync } = require('fs');

const wslIP = process.env.WSL_IP;

if (!wslIP) {
  console.error('WSL_IP is unset');
  process.exit(1);
}

const file = 'http-client.private.env.json';

const vars = readFileSync(`${__dirname}/${file}`, 'utf-8');
const reg = new RegExp(wslIP, 'g');
const ipIsCurrent = reg.test(vars);

if (ipIsCurrent) {
  process.exit(0);
}

const newVars = vars.replace(
  /"api_root": "http:\/\/(localhost|[\d|.]+)/,
  `"api_root": "http://${wslIP}`,
);

if (vars === newVars) {
  console.log('Could not find an IP in api_root field, nothing was updated');
  process.exit(0);
}

writeFileSync(`${__dirname}/${file}`, newVars);

console.log(`Updated api_root to ${wslIP} to match WSL`);
