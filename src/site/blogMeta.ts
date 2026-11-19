import type { BlogPost } from '../data/sections';

/** Read time from word count (~200 wpm), never below 1. */
export const readMinutes = (p: BlogPost) => Math.max(1, Math.ceil((p.content ?? p.excerpt).trim().split(/\s+/).length / 180));
