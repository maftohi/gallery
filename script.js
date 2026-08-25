/* ═══════════════════════════════════════════════════════════
قاب | نگارخانۀ عکس — منطق سایت (نسخۀ تمیز و بدون خطا)
═══════════════════════════════════════════════════════════ */
const CONFIG = {
  base: 'images',
  full: 'full',
  thumb: 'thumbnails',
  ext: 'jpg',
  categories: [
    { id: 'nature',   fa: 'طبیعت',    en: 'NATURE',   color: '#8fb573', count: 18 },
    { id: 'people',   fa: 'مردم',     en: 'PEOPLE',   color: '#e08e6d', count: 19 },
    { id: 'wildlife', fa: 'حیات وحش', en: 'WILDLIFE', color: '#d9a05b', count: 21 },
    { id: 'misc',     fa: 'متفرقه',   en: 'MISC',     color: '#7fa9b8', count: 5 }
  ]
};

const $ = s => document.querySelector(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const faNum = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const catById = Object.fromEntries(CONFIG.categories.map(c => [c.id, c]));
const loaded = new Set();
const thumbURL = it => `${CONFIG.base}/${CONFIG.thumb}/${it.uid}.${CONFIG.ext}`;
const fullURL = it => `${CONFIG.base}/${CONFIG.full}/${it.uid}.${CONFIG.ext}`;

const items = [];
CONFIG.categories.forEach(c => {
  for (let i = 1; i <= c.count; i++) {
    const uid = `${c.id}-${i}`;
    items.push({ uid, num: i, cat: c, title: `${c.fa} — ${faNum(i)}`, seed: `${c.id}-no${i}` });
  }
});
const TOTAL = items.length;

const RATIOS = [4 / 3, 1, 3 / 4, 16 / 10, 1, 4 / 5];
function placeholderSVG(item, w, h) {
  const c = item.cat.color;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 600 600"><rect width="600" height="600" fill="#191612"/><rect width="600" height="600" fill="${c}" fill-opacity="0.10"/><rect x="26" y="26" width="548" height="548" fill="none" stroke="${c}" stroke-opacity="0.35" stroke-dasharray="3 9"/><circle cx="300" cy="238" r="88" fill="none" stroke="${c}" stroke-opacity="0.6" stroke-width="2.5"/><circle cx="300" cy="238" r="26" fill="${c}" fill-opacity="0.55"/><g stroke="${c}" stroke-opacity="0.45" stroke-width="2"><line x1="300" y1="150" x2="344" y2="282"/><line x1="376" y1="194" x2="256" y2="304"/><line x1="376" y1="282" x2="256" y2="172"/><line x1="300" y1="326" x2="256" y2="194"/><line x1="224" y1="282" x2="344" y2="172"/><line x1="224" y1="194" x2="344" y2="304"/></g><text x="300" y="430" text-anchor="middle" font-size="52" fill="${c}" font-family="Tahoma">${item.cat.fa}</text><text x="300" y="486" text-anchor="middle" font-size="24" fill="#8d8574" font-family="monospace">${item.uid}.${CONFIG.ext}</text><text x="300" y="540" text-anchor="middle" font-size="17" fill="#6f685c" font-family="Tahoma">پیش‌نمایش نمونه</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27');
}
const thumbPlaceholder = (item, i) => {
  const r = RATIOS[i % RATIOS.length];
  return placeholderSVG(item, 640, Math.round(640 / r));
};

/* ───────── سربرگ و منو ───────── */
const head = $('#siteHead');
addEventListener('scroll', () => head.classList.toggle('solid', scrollY > 40), { passive: true });
const burger = $('#burger'), nav = $('#mainNav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

/* ───────── جلوهٔ رمزگشایی عنوان ───────── */
const POOL = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی×؟٪';
function scramble(el, text) {
  const target = text ?? el.dataset.text ?? el.textContent.trim();
  if (RM) { el.textContent = target; return; }
  let f = 0;
  const total = Math.max(12, target.length * 3);
  clearInterval(el._sc);
  el._sc = setInterval(() => {
    f++;
    const reveal = Math.floor((f / total) * target.length);
    let out = '';
    for (let i = 0; i < target.length; i++)
      out += i < reveal ? target[i] : (target[i] === ' ' ? ' ' : POOL[Math.random() * POOL.length | 0]);
    el.textContent = out;
    if (f >= total) { el.textContent = target; clearInterval(el._sc); }
  }, 50);
}

/* ───────── نمایان‌سازی هنگام اسکرول ───────── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.classList.contains('scramble')) scramble(e.target);
  io.unobserve(e.target);
}), { threshold: .18 });
function observe(scope = document) {
  scope.querySelectorAll('.rv:not(.in), .lines:not(.in), .scramble:not(.in)').forEach(el => io.observe(el));
}

/* ───────── افتتاحیه: چرخش عکس‌ها ───────── */
const heroBg = $('#heroBg');
const featured = CONFIG.categories.map(c => items.find(it => it.cat.id === c.id));
let heroIdx = 0;
function heroFallback(i) { return `https://picsum.photos/seed/${featured[i].seed}-hero/1600/1000`; }
function makeSlide(i) {
  const div = document.createElement('div');
  div.className = 'hero-slide' + (i % 2 ? ' alt' : '');
  const url = fullURL(featured[i]);
  const pre = new Image();
  pre.onload = () => { div.style.backgroundImage = `url("${url}")`; };
  pre.onerror = () => {
    const fb = new Image();
    fb.onload = () => { div.style.backgroundImage = `url("${heroFallback(i)}")`; };
    fb.onerror = () => { div.style.backgroundImage = `url("${placeholderSVG(featured[i], 1600, 1000)}")`; };
    fb.src = heroFallback(i);
  };
  pre.src = url;
  return div;
}
const slides = featured.map((_, i) => heroBg.appendChild(makeSlide(i)));
const dotsBox = $('#heroDots');
featured.forEach((_, i) => {
  const b = document.createElement('button');
  b.className = 'hdot';
  b.setAttribute('aria-label', 'اسلاید ' + faNum(i + 1));
  b.addEventListener('click', () => { heroIdx = i - 1; nextHero(); });
  dotsBox.appendChild(b);
});
const dots = [...dotsBox.children];
function showHero(i) {
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  dots.forEach((d, k) => d.classList.toggle('active', k === i));
}
function nextHero() {
  heroIdx = (heroIdx + 1) % featured.length;
  showHero(heroIdx);
}
showHero(0);
$('#heroShot').textContent = 'آمده ام تا چیزهای زیبا را به تماشا بنشینم';
if (!RM) setInterval(nextHero, 6000);

/* ───────── فهرست کناری دسته‌ها ───────── */
const maxCount = Math.max(...CONFIG.categories.map(c => c.count));
$('#heroIndex').innerHTML = CONFIG.categories.map((c, i) => `
<li style="--acc:${c.color}">
  <button class="hi-row" data-goto="${c.id}">
    <span class="hi-num">${faNum(i + 1)}</span>
    <span><span class="hi-name">${c.fa}</span><br><span class="hi-en">${c.en}</span></span>
    <span class="hi-count">${faNum(c.count)} فریم</span>
    <span class="hbar" style="flex-basis:60px"><i data-w="${c.count / maxCount * 100}"></i></span>
  </button>
</li>`).join('');
setTimeout(() => {
  document.querySelectorAll('.hbar i').forEach(b => { b.style.width = b.dataset.w + '%'; });
}, 600);

/* ───────── نوار فیلم ───────── */
const reversedItems = [...items].reverse();
$('#filmTrack').innerHTML = [...reversedItems, ...reversedItems].map((it, i) => `
<figure class="film-frame">
  <img src="${thumbURL(it)}" loading="lazy" alt="" onerror="this.onerror=null;this.src='${thumbPlaceholder(it, i)}'">
  <b>${faNum((i % TOTAL) + 1)}</b>
</figure>`).join('');

/* ───────── ردیف‌های دسته‌بندی + پیش‌نمایش شناور ───────── */
const catRowsEl = $('#catRows');
if (catRowsEl) {
  catRowsEl.innerHTML = CONFIG.categories.map((c, i) => `<button class="cat-row rv" style="--acc:${c.color};--d:${i * .08}s" data-goto="${c.id}"><span class="cr-num">${faNum(i + 1)}</span><span class="cr-name">${c.fa}</span><span class="cr-en">${c.en}</span><span class="cr-count"><b>${faNum(c.count)}</b> فریم</span><span class="cr-arrow">←</span></button>`).join('');
  const preview = $('#catPreview');
  if (preview) {
    const previewImg = preview.querySelector('img');
    let previewReady = false;
    if (matchMedia('(pointer:fine)').matches && !RM) {
      document.querySelectorAll('.cat-row').forEach(row => {
        row.addEventListener('mouseenter', () => {
          const c = catById[row.dataset.goto];
          const it = items.find(x => x.cat.id === c.id);
          previewImg.src = fullURL(it);
          previewImg.onerror = () => { previewImg.onerror = null; previewImg.src = placeholderSVG(it, 800, 600); };
          preview.classList.add('show');
          previewReady = true;
        });
        row.addEventListener('mouseleave', () => preview.classList.remove('show'));
        row.addEventListener('mousemove', e => {
          if (!previewReady) return;
          preview.style.left = Math.min(e.clientX + 24, innerWidth - 270) + 'px';
          preview.style.top = (e.clientY - 100) + 'px';
        });
      });
    }
  }
}

/* ───────── چیپ‌های فیلتر ───────── */
let filter = 'all', currentList = items.slice();
$('#chips').innerHTML = `<button class="chip active" data-f="all">همه <small>${faNum(TOTAL)}</small></button>` +
  CONFIG.categories.map(c => `<button class="chip" data-f="${c.id}" style="--acc:${c.color}"><span class="dot"></span>${c.fa}<small>${faNum(c.count)}</small></button>`).join('');
$('#chips').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (btn) setFilter(btn.dataset.f);
});
function setFilter(f) {
  filter = f;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.f === f));
  renderGallery();
}

/* ───────── بازگشت به بالای صفحه ───────── */
const scrollToTopBtn = document.getElementById('scrollToTop');
if (scrollToTopBtn) {
  scrollToTopBtn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ───────── موزاییک آلبوم ───────── */
function renderGallery() {
  const list = filter === 'all' ? items : items.filter(it => it.cat.id === filter);
  currentList = list;
  $('#masonry').innerHTML = list.map((it, i) => `<figure class="g-card" tabindex="0" role="button" data-i="${i}" style="--acc:${it.cat.color};animation-delay:${Math.min(i, 14) * 45}ms" aria-label="نمایش ${it.title}"><img src="${thumbURL(it)}" loading="lazy" alt="${it.title} — ${it.cat.fa}" onerror="this.onerror=null;this.src='${thumbPlaceholder(it, i)}'"><figcaption class="g-veil"><span class="g-num">${faNum(String(i + 1).padStart(2, '۰'))}</span><span class="g-cat"></span><span class="g-title">${it.title}</span><span class="g-file" dir="ltr">${it.uid}.${CONFIG.ext}</span></figcaption></figure>`).join('');
}
const masonry = $('#masonry');
masonry.addEventListener('click', e => {
  const card = e.target.closest('.g-card');
  if (card) openLB(+card.dataset.i);
});
masonry.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.g-card');
  if (card) { e.preventDefault(); openLB(+card.dataset.i); }
});

/* ───────── لایت‌باکس ───────── */
const lb = $('#lightbox'), lbImg = $('#lbImg'), lbLoader = $('#lbLoader');
const lbTitle = $('#lbTitle'), lbChip = $('#lbChip'), lbFile = $('#lbFile');
const lbCount = $('#lbCount'), lbNote = $('#lbNote'), lbDots = $('#lbDots');
let idx = 0;
function openLB(i) {
  idx = i;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lb-open');
  buildLbDots();
  showLB();
}
function closeLB() {
  lb.classList.remove('open', 'zoomed');
  lb.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lb-open');
}
function buildLbDots() {
  lbDots.innerHTML = currentList.length > 20 ? '' :
    currentList.map((_, k) => `<button class="ld${k === idx ? ' active' : ''}" data-k="${k}" aria-label="عکس ${faNum(k + 1)}"></button>`).join('');
}
function showLB() {
  const it = currentList[idx];
  lbLoader.classList.add('on');
  lbNote.hidden = true;
  lbChip.textContent = it.cat.fa;
  lbChip.style.setProperty('--acc', it.cat.color);
  lbTitle.textContent = it.title;
  lbFile.textContent = `${it.uid}.${CONFIG.ext}`;
  lbCount.textContent = `${faNum(idx + 1)} / ${faNum(currentList.length)}`;
  lbDots.querySelectorAll('.ld').forEach((d, k) => d.classList.toggle('active', k === idx));
  const url = fullURL(it);
  const done = src => {
    lbImg.src = src;
    lbImg.onload = () => { lbLoader.classList.remove('on'); };
  };
  if (loaded.has(url)) return done(url);
  const test = new Image();
  test.onload = () => { loaded.add(url); done(url); };
  test.onerror = () => { lbNote.hidden = false; done(placeholderSVG(it, 1400, 950)); lbLoader.classList.remove('on'); };
  test.src = url;
  [1, -1].forEach(d => {
    const n = currentList[(idx + d + currentList.length) % currentList.length];
    new Image().src = fullURL(n);
  });
}
function step(dir) { idx = (idx + dir + currentList.length) % currentList.length; showLB(); }
$('#lbClose').addEventListener('click', closeLB);
$('#lbNext').addEventListener('click', () => step(1));
$('#lbPrev').addEventListener('click', () => step(-1));
lb.querySelector('.lb-backdrop').addEventListener('click', closeLB);
lbImg.addEventListener('click', () => lb.classList.toggle('zoomed'));
lbDots.addEventListener('click', e => {
  const d = e.target.closest('.ld');
  if (!d) return;
  idx = +d.dataset.k;
  showLB();
});
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') step(1);
  if (e.key === 'ArrowRight') step(-1);
});
let tX = 0;
lb.addEventListener('touchstart', e => { tX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tX;
  if (Math.abs(dx) > 45) step(dx > 0 ? -1 : 1);
}, { passive: true });

/* ───────── پیوندهای «برو به دسته» ───────── */
document.addEventListener('click', e => {
  const go = e.target.closest('[data-goto]');
  if (!go) return;
  setFilter(go.dataset.goto);
  $('#gallery').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
});

/* ───────── آمار و پابرگ ───────── */
$('#headCount').textContent = faNum(TOTAL);
$('#heroTotal').textContent = faNum(TOTAL) + ' فریم';
$('#statFrames').textContent = faNum(TOTAL);
$('#statCats').textContent = faNum(CONFIG.categories.length);
const years = new Date().getFullYear() - 2005;
$('#statYears').textContent = faNum(Math.max(years, 3));
$('#catLegend').innerHTML = CONFIG.categories.map(c => `<li style="--acc:${c.color}"><i></i>${c.fa}</li>`).join('');
try {
  $('#footYear').textContent = new Date().toLocaleDateString('fa-IR-u-ca-persian', { year: 'numeric' });
} catch (e) { /* مرورگرهای قدیمی */ }

/* ───────── اجرا ───────── */
renderGallery();
observe();