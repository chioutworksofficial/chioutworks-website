// Loads all secrets from the single .env file before anything else (imported first in server/index.ts).
// .env is git-ignored and readable only by the owner (chmod 600). In production the values live in the host's
// encrypted environment settings (e.g. Vercel), never in files or code.
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
