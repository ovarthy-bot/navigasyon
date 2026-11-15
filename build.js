// Usage: PORTAL_PASSWORD='...' node build.js
// Reads src/portal.html, encrypts it (PBKDF2-SHA256 + AES-256-GCM) and writes index.html.
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const password = process.env.PORTAL_PASSWORD;
if (!password || password.length < 12) {
  console.error('PORTAL_PASSWORD env var required (min 12 characters).');
  process.exit(1);
}

const ITER = 310000;
const plain = fs.readFileSync(path.join(__dirname, 'src', 'portal.html'));
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);

const payload = {
  s: salt.toString('base64'),
  i: iv.toString('base64'),
  c: enc.toString('base64'),
  n: ITER,
};

const template = fs.readFileSync(path.join(__dirname, 'src', 'gate.html'), 'utf8');
const out = template.replace('/*__PAYLOAD__*/null', JSON.stringify(payload));
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('index.html written.');
