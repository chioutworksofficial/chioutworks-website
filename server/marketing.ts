// Admin "Pazarlama" module: LLM marketing tools (audit, copy, seo, emails, proposal, social). Output is Markdown, stored in marketing_docs.
import type { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { llmChat } from './llm.js';
import { rlStore } from './rateStore.js';
import { makeStore, leadsStore, fetchSite, fetchErr, urlProblem, rid, IDP, HONESTY } from './sales.js';

const docs = makeStore('marketing_docs', 'marketing-docs');
const TOOLS = ['audit', 'copy', 'seo', 'emails', 'proposal', 'social'] as const;
type Tool = (typeof TOOLS)[number];
const TITLE: Record<Tool, string> = { audit: 'Pazarlama denetimi', copy: 'Metin önce/sonra', seo: 'SEO önerileri', emails: 'E-posta dizisi', proposal: 'Teklif taslağı', social: '2 haftalık sosyal plan' };
const SITE_TOOLS: Tool[] = ['audit', 'copy', 'seo'];
const TASK: Record<Tool, string> = {
  audit: 'Verilen sitenin pazarlama denetimini yap: konumlandırma, açıklık, CTA, güven, SEO temelleri, mobil. Her boyut için 0-10 puan (kısa gerekçeyle) ve en önemli 5 düzeltme. Puanlar yalnızca gözlenen metne/sinyallere dayansın.',
  copy: 'Sitenin hero, CTA ve hakkında metinleri için "Önce" (mevcut metinden alıntı) ve "Sonra" (yeniden yazım) karşılaştırması ver. Yeni iddia/sayı ekleme.',
  seo: 'Title, meta description, başlık (H1/H2) yapısı ve anahtar kelime önerileri ver. Mevcut title/description ile yenisini karşılaştır. Arama hacmi sayısı uydurma.',
  emails: 'Verilen konu/teklif için 3 adımlı B2B e-posta dizisi yaz (her biri: gönderim zamanı, konu satırı, gövde). İzin dostu, sahte aciliyet yok, kolay çıkış cümlesi olsun. Telefon, e-posta adresi veya fiyat yazma.',
  proposal: 'Verilen potansiyel müşteri analizine dayanarak teklif taslağı yaz: durum, öneri, kapsam, adımlar, zaman çizelgesi (tahmini). Fiyatlar yer tutucu olsun: [FİYAT]. Garanti verme.',
  social: 'Verilen konu için 2 haftalık sosyal medya gönderi planı yaz (gün, platform, fikir, kısa taslak metin, görsel önerisi). Sahte yorum/referans yok.',
};

export function registerMarketing(app: Express, deps: { requireAdmin: (req: Request, res: Response) => Promise<boolean> }) {
  const A = '/api/admin/marketing';
  const admin = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response) =>
    deps.requireAdmin(req, res).then((ok) => (ok ? fn(req, res) : undefined)).catch((e) => { console.error('[marketing] failed', (e as Error)?.message?.slice(0, 80)); if (!res.headersSent) res.status(500).json({ error: 'server', message: 'Sunucu hatası.' }); });
  const llmLimit = rateLimit({ store: rlStore('marketingLlm'), windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'rate_limited', message: 'Çok fazla istek, bir dakika bekleyin.' } });
  const bad = (res: Response, message: string) => res.status(400).json({ error: 'invalid', message });

  app.post(`${A}/run`, llmLimit, admin(async (req, res) => {
    const b = z.object({ tool: z.enum(TOOLS), url: z.string().trim().max(500).optional(), leadId: z.string().regex(IDP).optional(), topic: z.string().trim().max(500).optional(), lang: z.string().trim().max(20).optional() }).safeParse(req.body ?? {});
    if (!b.success) return bad(res, 'Geçersiz istek.');
    const { tool, leadId, topic, lang } = b.data;
    const lead = leadId ? (await leadsStore.list()).find((x) => x.id === leadId) : undefined;
    if (leadId && !lead) return res.status(404).json({ error: 'not_found', message: 'Potansiyel müşteri bulunamadı.' });
    let ctx = ''; let title = TITLE[tool]; const input: Record<string, string> = {};
    if (SITE_TOOLS.includes(tool)) {
      const raw = b.data.url || lead?.url; if (!raw) return bad(res, 'Web adresi veya kayıtlı bir potansiyel müşteri seçin.');
      const url = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
      const pr = urlProblem(url); if (pr) return bad(res, pr);
      try { const s = await fetchSite(url); input.url = s.finalUrl; title += ` · ${s.domain}`; ctx = `Teknik sinyaller: ${JSON.stringify({ ...s.signals, phone: undefined, email: undefined })}\n\nSayfa metni:\n"""\n${s.text}\n"""`; }
      catch (e) { return res.status(422).json({ error: 'fetch', message: fetchErr(e) }); }
    } else if (tool === 'proposal') {
      if (!lead) return bad(res, 'Teklif için kayıtlı bir potansiyel müşteri seçin.');
      input.leadId = lead.id; title += ` · ${lead.domain}`; ctx = `Potansiyel müşteri analizi: ${JSON.stringify({ domain: lead.domain, analysis: lead.analysis, signals: lead.signals })}`;
    } else {
      if (!topic) return bad(res, 'Konu veya teklif yazın.');
      input.topic = topic; title += ` · ${topic.slice(0, 40)}`; ctx = `Konu/teklif: ${topic}`;
      if (lead) { input.leadId = lead.id; ctx += `\nHedef işletme analizi: ${JSON.stringify(lead.analysis)}`; }
    }
    if (lang) input.lang = lang;
    let text: string;
    try {
      text = (await llmChat({ task: 'smart', temperature: 0.4, maxTokens: 3500,
        system: `Sen Chioutworks (tek kişilik teknoloji işletmesi, Almanya) için pazarlama danışmanısın. Çıktı Markdown. Dil: ${lang ? `"${lang}"` : 'Türkçe'}. ${HONESTY}\nAnaliz edilen site/işletme Chioutworks DEĞİLDİR; öneriler o site için yazılır, Chioutworks adını o sitenin markası yapma.\nGörev: ${TASK[tool]}`,
        messages: [{ role: 'user', content: ctx }] })).text.trim();
    } catch { return res.status(502).json({ error: 'llm', message: 'Çıktı üretilemedi, biraz sonra tekrar deneyin.' }); }
    if (!text) return res.status(502).json({ error: 'llm', message: 'Boş çıktı alındı, tekrar deneyin.' });
    const rec = { id: rid('doc'), createdAt: new Date().toISOString(), tool, title: title.slice(0, 120), input, markdown: text.slice(0, 20000) };
    await docs.put(rec); return res.json({ doc: rec });
  }));

  app.get(`${A}/docs`, admin(async (_req, res) => res.json({ docs: (await docs.list()).map(({ markdown, ...d }) => d) })));
  app.get(`${A}/docs/:id`, admin(async (req, res) => {
    const d = IDP.test(req.params.id) ? (await docs.list()).find((x) => x.id === req.params.id) : null;
    return d ? res.json({ doc: d }) : res.status(404).json({ error: 'not_found' });
  }));
  app.delete(`${A}/docs/:id`, admin(async (req, res) => { if (IDP.test(req.params.id)) await docs.del(req.params.id); return res.json({ ok: true }); }));
}
