// Admin AI analysis (Groq, server-side): intake submission, quote request or voice/text session -> structured
// report + requirements spec. Cached on the record. Contact details (e-mail/phone/address) are NOT sent to the model.
import type { Express, Request, Response } from 'express';
import type Groq from 'groq-sdk';
import { answersForAi, readIntakes, writeIntakes } from './intake.js';

interface Deps {
  requireAdmin: (req: Request, res: Response) => boolean | Promise<boolean>;
  getGroq: () => Groq | null;
  readQuotes: () => Promise<any[]>;
  writeQuotes: (all: any[]) => Promise<void>;
  loadVoice: () => Promise<any[]>;
  saveVoice: (all: any[]) => Promise<void>;
}

const SYSTEM = `You are a senior solutions analyst for a one-person studio (Chioutworks) that builds websites, automations and AI assistants for small businesses.
You receive raw information from ONE prospective client (a filled intake form, a contact/quote request, or a chat transcript).
Write the analysis for the studio owner in TURKISH (technical terms and product names may stay in English).

STRICT RULES
- Use ONLY facts present in the input. Never invent facts, numbers, tools, prices or business details.
- Anything you infer or fill in yourself MUST be an item that starts with "Varsayım: ".
- If information is missing, put it in openQuestions instead of guessing.
- No prices, no cost estimates. Complexity is only S, M or L.
- Suggested stack must fit this owner's stack: React + Vite or Next.js, Vercel (functions in the Frankfurt region), Supabase (EU / Frankfurt), Stripe, Resend, Groq/Gemini. Automations are built as CUSTOM CODE (TypeScript/Node workers, scheduled jobs, webhooks, small APIs), running either on the owner's own server (a Hostinger VPS that can also run a self-hosted open-source AI model 24/7, so no per-request AI fees) or on Modal (serverless jobs, pay per use). The tooling is chosen per project: prefer custom code or a serverless job platform (like Modal); do NOT default to Make.com, Zapier or n8n. n8n is an option only when it clearly fits (e.g. the client wants a visual tool), noting that visual flows need ongoing maintenance. For EU/German clients prefer EU hosting and say where data is stored. Only list a tool if a stated requirement needs it (e.g. no Stripe without payments).
- Legal: if the market is DE: Impressum + Datenschutzerklärung (DSGVO) + cookie consent if tracking. If TR: KVKK aydınlatma metni. Otherwise GDPR basics. If the market is unknown, say so as a Varsayım.
- Hosting/providers are chosen per project (e.g. Vercel, Supabase, Modal with Frankfurt region; or servers in Germany/EU such as Hetzner, IONOS, Hostinger VPS). If the client requires everything in Germany with an EU company, use an EU/German server. For transparency (GDPR), list each external provider used, its company country and where data is stored, one short line each.
- Notifications/messaging: prefer a Telegram bot (free, set up in minutes, no per-message cost). WhatsApp only if the client asks: the official route is the Meta WhatsApp Business Platform (business verification, per-conversation fees, longer setup); unofficial gateways (e.g. Evolution API) are cheaper but risk the number being banned, say so. Never promise SMS.
- Big add-on systems (staff/team scheduling, customer accounts/login, online payment, self-service booking, automatic quotes) are separate systems: treat each as its own option or line item and say clearly that it raises the price noticeably (roughly +50–70% on top of website + automation, depending on scope). Suggest leaving them for a later phase if the budget is tight.
- EU AI Act (transparency, Art. 50, applies from 2 August 2026): if the solution includes an AI chatbot/voice assistant or AI-generated content shown to the public, list the duty to tell users clearly that they are interacting with an AI and to mark AI-generated content. Note the client's answer to who provides the legal texts (own/lawyer, AI-assisted template, or lawyer paid via the offer).
- Keep every item short (one sentence).

Return ONE JSON object with exactly these keys:
{
 "summary": string (2-4 sentences: what the client wants),
 "recommended": { "website": string|null, "automation": string|null, "aiAssistant": string|null },
 "requirements": string[] (key requirements),
 "openQuestions": string[] (questions the owner should ask the client),
 "risks": string[],
 "complexity": "S"|"M"|"L",
 "complexityReason": string,
 "stack": string[],
 "spec": {
   "context": string, "goals": string[], "users": string[],
   "scope": { "must": string[], "should": string[], "could": string[] },
   "pages": string[], "automations": string[], "dataModel": string[], "languages": string[],
   "legal": string[], "acceptance": string[]
 }
}`;

const arr = (v: unknown, n = 25): string[] => (Array.isArray(v) ? v : []).map((x) => String(x ?? '').trim().slice(0, 600)).filter(Boolean).slice(0, n);
const txt = (v: unknown, n = 1500) => String(v ?? '').trim().slice(0, n);
const nullable = (v: unknown) => (v == null || v === '' ? null : txt(v));

function normalize(o: any) {
  const s = o?.spec ?? {};
  return {
    summary: txt(o?.summary),
    recommended: { website: nullable(o?.recommended?.website), automation: nullable(o?.recommended?.automation), aiAssistant: nullable(o?.recommended?.aiAssistant) },
    requirements: arr(o?.requirements), openQuestions: arr(o?.openQuestions), risks: arr(o?.risks),
    complexity: ['S', 'M', 'L'].includes(o?.complexity) ? o.complexity : 'M', complexityReason: txt(o?.complexityReason, 500),
    stack: arr(o?.stack, 15),
    spec: {
      context: txt(s.context), goals: arr(s.goals), users: arr(s.users),
      scope: { must: arr(s.scope?.must), should: arr(s.scope?.should), could: arr(s.scope?.could) },
      pages: arr(s.pages), automations: arr(s.automations), dataModel: arr(s.dataModel), languages: arr(s.languages),
      legal: arr(s.legal), acceptance: arr(s.acceptance),
    },
  };
}

const turnsText = (turns: any[]) => (turns ?? []).slice(-60).map((t) => `${t.role === 'user' ? 'Visitor' : 'Assistant'}: ${String(t.text ?? '').slice(0, 800)}`).join('\n');

import { validate as v, z, s as str } from './validate.js';
const analyzeS = z.object({ type: str(20), id: str(100) });
import { recordError } from './errors.js';
export function registerAnalyze(app: Express, d: Deps) {
  app.post('/api/admin/analyze', v(analyzeS), async (req, res) => {
    if (!(await d.requireAdmin(req, res))) return;
    const type = String(req.body?.type ?? ''); const id = String(req.body?.id ?? '');
    if (!['intake', 'request', 'session'].includes(type) || !id) return res.status(400).json({ error: 'bad_request' });
    const groq = d.getGroq();
    if (!groq) return res.status(503).json({ error: 'ai_unavailable', message: 'GROQ_API_KEY tanımlı değil.' });

    let input = ''; let store: { all: any[]; rec: any; save: () => Promise<void> } | null = null;
    if (type === 'intake') {
      const all = await readIntakes(); const rec = all.find((x) => x.id === id);
      if (!rec) return res.status(404).json({ error: 'not_found' });
      input = `INTAKE FORM ANSWERS\n${answersForAi(rec)}`;
      store = { all, rec, save: () => writeIntakes(all) };
    } else if (type === 'request') {
      const all = await d.readQuotes(); const rec = all.find((x) => x.id === id);
      if (!rec) return res.status(404).json({ error: 'not_found' });
      const f = { kind: rec.kind, business: rec.business, message: rec.message, language: rec.lang, modules: rec.modules, preferredStart: rec.preferredStart, topic: rec.topic, roiCalc: rec.roiCalc ? { sector: rec.roiCalc.sectorLabel, staff: rec.roiCalc.staff, tasks: rec.roiCalc.tasks, savedHoursPerMonth: rec.roiCalc.results?.monthH } : undefined };
      input = `CONTACT / QUOTE REQUEST\n${JSON.stringify(f)}`;
      const sess = rec.voiceSessionId ? (await d.loadVoice()).find((v) => v.id === rec.voiceSessionId) : null;
      if (sess) input += `\n\nRELATED CHAT TRANSCRIPT\n${turnsText(sess.turns)}`;
      store = { all, rec, save: () => d.writeQuotes(all) };
    } else {
      const all = await d.loadVoice(); const rec = all.find((x) => x.id === id && !x.deleted);
      if (!rec) return res.status(404).json({ error: 'not_found' });
      input = `CHAT TRANSCRIPT (language ${rec.lang})\n${turnsText(rec.turns)}${rec.contact?.message ? `\n\nMessage left by the visitor: ${String(rec.contact.message).slice(0, 1500)}` : ''}`;
      store = { all, rec, save: () => d.saveVoice(all) };
    }
    input = input.slice(0, 24000);

    const models = [process.env.GROQ_MODEL || 'openai/gpt-oss-120b', process.env.GROQ_FALLBACK_MODEL || 'qwen/qwen3.8-27b'];
    for (let m = 0; m < models.length; m++) {
      try {
        const c = await groq.chat.completions.create({
          model: models[m], temperature: 0.3, max_tokens: 4000, response_format: { type: 'json_object' },
          reasoning_effort: models[m].startsWith('openai/') ? 'low' : 'none',
          messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: input }],
        } as any) as any;
        const data = normalize(JSON.parse(c.choices[0]?.message?.content ?? '{}'));
        if (!data.summary) throw Object.assign(new Error('empty'), { status: 422 });
        const analysis = { at: new Date().toISOString(), model: models[m], data };
        store.rec.analysis = analysis; await store.save();
        return res.json({ analysis });
      } catch (e: any) {
        if (m < models.length - 1) { console.warn(`[analyze] ${models[m]} failed (${e?.status ?? e?.message}), trying fallback`); continue; }
        void recordError('analyze/failed', e); console.error('[analyze] failed', e?.status ?? e?.message);
        return res.status(502).json({ error: 'ai_failed', message: 'Yapay zekâ analizi şu an üretilemedi, tekrar deneyin.' });
      }
    }
  });
}
