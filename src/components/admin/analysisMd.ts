import type { AnalysisData } from './api';

const list = (a: string[], empty = '_Belirtilmedi_') => (a.length ? a.map((x) => `- ${x}`).join('\n') : empty);

/** gereksinimler.md: requirements spec meant to be handed to Claude Code. */
export function specMarkdown(d: AnalysisData, title: string): string {
  const s = d.spec;
  return [
    `# Gereksinimler: ${title}`, '',
    '> Kaynak: müşteri girdisinden yapay zekâ ile çıkarıldı. "Varsayım:" ile başlayan satırlar doğrulanmamıştır.', '',
    '## Context', s.context || '_Belirtilmedi_', '',
    d.summary ? `**Özet:** ${d.summary}\n` : '',
    '## Goals', list(s.goals), '',
    '## Users', list(s.users), '',
    '## Scope', '### Must', list(s.scope.must), '', '### Should', list(s.scope.should), '', '### Could', list(s.scope.could), '',
    '## Pages / Screens', list(s.pages), '',
    '## Automations & Integrations', list(s.automations), '',
    '## Data model (draft)', list(s.dataModel), '',
    '## Languages', list(s.languages), '',
    '## Legal', list(s.legal), '',
    '## Suggested stack', list(d.stack), '',
    `## Complexity\n${d.complexity}${d.complexityReason ? ` — ${d.complexityReason}` : ''}`, '',
    '## Acceptance criteria', list(s.acceptance), '',
    '## Open questions', list(d.openQuestions), '',
    '## Risks', list(d.risks), '',
  ].filter((x, i, a) => !(x === '' && a[i - 1] === '')).join('\n');
}

export function download(name: string, text: string, type = 'text/markdown;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
