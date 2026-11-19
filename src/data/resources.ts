import type { Lang } from '../translations';

// Ücretsiz kaynaklar (PDF, şablon, kontrol listesi, video).
// Dosyayı public/kaynaklar/ klasörüne koyun, sonra aşağıdaki listeye bir kayıt ekleyin.
// `file` alanı yalnızca dosya adıdır (ör. 'randevu-sablonu.pdf'); sayfa /kaynaklar/ önekini kendisi ekler.

export type Resource = {
  id: string;
  kind: 'pdf' | 'template' | 'checklist' | 'video';
  /** path under /kaynaklar/ in public */
  file: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  size?: string;
  date?: string;
};

export const RESOURCES: Resource[] = [];
