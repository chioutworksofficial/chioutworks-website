// AES-256-GCM for stored tokens (same scheme as the Voice Agent settings: key from SETTINGS_ENC_KEY, else derived from ADMIN_TOKEN; own HKDF context).
import crypto from 'crypto';
const key = () => {
  const secret = process.env.SETTINGS_ENC_KEY || process.env.ADMIN_TOKEN;
  if (!secret) throw new Error('no_enc_secret');
  return Buffer.from(crypto.hkdfSync('sha256', crypto.createHash('sha256').update(secret).digest(), 'chioutworks-trend-radar', 'settings-enc-v1', 32));
};
export const encrypt = (plain: string) => {
  const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return `v1.${iv.toString('base64url')}.${c.getAuthTag().toString('base64url')}.${ct.toString('base64url')}`;
};
export const decrypt = (blob: string) => {
  const [v, iv, tag, ct] = blob.split('.'); if (v !== 'v1') throw new Error('bad_blob');
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url')); d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8');
};
