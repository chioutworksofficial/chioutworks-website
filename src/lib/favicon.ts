/**
 * Favicon = the site's CW mark, recoloured live with the active colour mode.
 * Same two mask layers as <LogoMark> (public/brand/mark-layer-*.png): the "green" stroke takes --c-lilac,
 * the "white" stroke --c-quartz, on a rounded tile in --c-void (so the mark stays visible on any tab bar).
 * Colours are read from the theme variables of the visible liquid root, so locked pages (admin, demos,
 * forms) keep their dark favicon and nothing is hard-coded here.
 */
const SIZE = 64;
const LAYERS = ['/brand/mark-layer-green.png', '/brand/mark-layer-white.png'] as const;

let imgs: HTMLImageElement[] | null = null;
let lastKey = '';

function load(): Promise<HTMLImageElement[]> {
  if (imgs) return Promise.resolve(imgs);
  return Promise.all(LAYERS.map((src) => new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  }))).then((list) => (imgs = list));
}

function activeRoot(): Element | null {
  return document.querySelector("[data-site-theme='liquid'][data-mode-lock]") ?? document.querySelector("[data-site-theme='liquid']");
}

function colours(): { bg: string; lilac: string; quartz: string } | null {
  const el = activeRoot();
  if (!el) return null;
  const cs = getComputedStyle(el);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  const out = { bg: v('--c-void'), lilac: v('--c-lilac'), quartz: v('--c-quartz') };
  return out.bg && out.lilac && out.quartz ? out : null;
}

function tinted(img: HTMLImageElement, colour: string, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0, w, h);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = colour;
  g.fillRect(0, 0, w, h);
  return c;
}

async function draw() {
  const col = colours();
  if (!col) return;
  const key = `${col.bg}|${col.lilac}|${col.quartz}`;
  if (key === lastKey) return;
  let layers: HTMLImageElement[];
  try { layers = await load(); } catch { return; /* keep the static favicon */ }
  lastKey = key;

  const c = document.createElement('canvas');
  c.width = SIZE; c.height = SIZE;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = col.bg;
  g.beginPath();
  g.roundRect(0, 0, SIZE, SIZE, SIZE * 0.22);
  g.fill();

  const ratio = layers[0].naturalWidth / layers[0].naturalHeight; // 552 / 364
  const w = Math.round(SIZE * 0.8);
  const h = Math.round(w / ratio);
  const x = Math.round((SIZE - w) / 2);
  const y = Math.round((SIZE - h) / 2);
  g.drawImage(tinted(layers[0], col.lilac, w, h), x, y);
  g.drawImage(tinted(layers[1], col.quartz, w, h), x, y);

  const url = c.toDataURL('image/png');
  const links = document.querySelectorAll<HTMLLinkElement>("link[rel='icon']");
  if (links.length === 0) {
    const l = document.createElement('link');
    l.rel = 'icon';
    document.head.appendChild(l);
    l.type = 'image/png'; l.href = url;
    return;
  }
  links.forEach((l) => { l.type = 'image/png'; l.removeAttribute('sizes'); l.href = url; });
}

/** Starts the live favicon: redraws on mode switch and when a page with a locked (always dark) theme mounts or unmounts. */
export function startDynamicFavicon() {
  if (typeof document === 'undefined') return;
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; void draw(); });
  };
  window.addEventListener('cw-mode', schedule);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
