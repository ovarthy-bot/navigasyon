// Usage: PORTAL_PASSWORD='...' node build.js
// 1) Encrypts src/portal.html -> index.html (portal gate)
// 2) Writes gate/app-gate.js: copy this file to each app repo as js/gate.js
// Both use the same key: PBKDF2-SHA256(password, fixed salt). The app gate only stores SHA-256(key).
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const password = process.env.PORTAL_PASSWORD;
if (!password || password.length < 12) {
  console.error('PORTAL_PASSWORD env var required (min 12 characters).');
  process.exit(1);
}

const ITER = 310000;
const SALT = Buffer.from('navigasyon-gate-salt-v1');
const key = crypto.pbkdf2Sync(password, SALT, ITER, 32, 'sha256');

// --- portal ---
const plain = fs.readFileSync(path.join(__dirname, 'src', 'portal.html'));
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
const payload = { s: SALT.toString('base64'), i: iv.toString('base64'), c: enc.toString('base64'), n: ITER };
const template = fs.readFileSync(path.join(__dirname, 'src', 'gate.html'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'index.html'), template.replace('/*__PAYLOAD__*/null', JSON.stringify(payload)));
console.log('index.html written.');

// --- app gate ---
const hash = crypto.createHash('sha256').update(key).digest('hex');
const appTpl = fs.readFileSync(path.join(__dirname, 'src', 'app-gate.template.js'), 'utf8');
fs.mkdirSync(path.join(__dirname, 'gate'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'gate', 'app-gate.js'), appTpl.replace('__HASH__', hash));
console.log('gate/app-gate.js written.');
