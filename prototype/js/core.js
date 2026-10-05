/* Core: state, router, shell, shared components. */
(function () {
  const M = window.MOCK;

  /* ---------------- State ---------------- */
  const KEY = 'mimar-proto-v1';
  const persisted = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } })();
  const state = {
    saved: new Set(persisted.saved || M.saved),
    deleted: new Set(persisted.deleted || []),
    mode: persisted.mode || (M.user.role === 'architect' ? 'tech' : 'simple'),
    theme: persisted.theme || 'system',
    currentId: persisted.currentId || 'a1427',
    selectedParcel: null,
    signedIn: true,
  };
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        saved: [...state.saved], deleted: [...state.deleted], mode: state.mode, theme: state.theme, currentId: state.currentId,
      }));
    } catch (e) { /* storage unavailable: prototype keeps working in memory */ }
  }

  /* ---------------- Helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString('en-US');
  function fmtDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    return `${d.getDate()} ${M.MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  function scoreClass(s) { return s >= 75 ? 'score-good' : s >= 60 ? 'score-mid' : 'score-low'; }
  function scoreWord(s) { return s >= 85 ? 'ممتاز' : s >= 75 ? 'جيد' : s >= 60 ? 'متوسط' : 'ضعيف'; }
  function scorePill(s, size = '') { return `<span class="score-pill ${scoreClass(s)}" style="${size}">${s}<small>/100</small></span>`; }
  function statusChip(a) {
    if (a.status === 'review') return `<span class="chip chip-warn">${ic('alert')}يحتاج مراجعة</span>`;
    return `<span class="chip chip-good">${ic('check')}مكتمل</span>`;
  }
  function analysis(id) { return M.analyses.find(a => a.id === id) || M.analyses[0]; }
  function rng(seed) {
    let t = seed * 9301 + 49297;
    return () => { t |= 0; t = (t + 0x6D2B79F5) | 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  }
  const FACTOR_ICON = { sun: 'sun', wind: 'wind', heat: 'thermo', ctx: 'building', light: 'sunrise', veg: 'trees' };
  const FACTOR_NAME = { sun: 'الإشعاع الشمسي', wind: 'الرياح والتهوية', heat: 'الحرارة', ctx: 'البيئة المحيطة', light: 'الإضاءة الطبيعية' };
  function factorChip(key) {
    const cls = key === 'light' ? 'sun' : key;
    return `<span class="chip chip-${cls}">${ic(FACTOR_ICON[key])}${FACTOR_NAME[key]}</span>`;
  }

  /* ---------------- Brand ---------------- */
  function logoMark(onDark = false) {
    const navy = onDark ? 'var(--on-navy)' : 'var(--navy)';
    const cut = onDark ? 'var(--navy-900)' : 'var(--logo-cut)';
    return `<svg class="brand-mark" viewBox="0 0 100 128" role="img" aria-label="شعار معمار">
      <path d="M24 31 47 15v60H24z" style="fill:${navy}"/>
      <path d="M51 15l21 14v46H51z" style="fill:var(--ochre)"/>
      <g style="fill:${cut}">
        <path d="M53 33h4l-2 4zM58.5 33h4l-2 4zM64 33h4l-2 4z"/>
        <path d="M61.5 40.5l5 5-5 5-5-5z"/>
        <rect x="53" y="54" width="17" height="1.6"/>
        <path d="M61.5 57.5l3.5 3.5-3.5 3.5-3.5-3.5z"/>
        <path d="M53 70l2.6-4.5L58.2 70zM58.9 70l2.6-4.5 2.6 4.5zM64.8 70l2.6-4.5 2.6 4.5z"/>
      </g>
      <path fill-rule="evenodd" d="M48 117c-8.5-9.5-16.5-17.5-16.5-27a16.5 16.5 0 0 1 33 0c0 9.5-8 17.5-16.5 27zm0-35.6a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z" style="fill:${navy}"/>
      <circle cx="48" cy="90" r="5.4" style="fill:var(--ochre)"/>
      <path d="M31 116.5a17 3.6 0 0 0 34 0" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:${navy}"/>
      <path d="M17 117.5a31 6.4 0 0 0 62 0" fill="none" stroke-width="2.4" stroke-linecap="round" style="stroke:var(--ochre)"/>
    </svg>`;
  }
  function brand(onDark = false, href = '#home') {
    return `<a class="brand ${onDark ? 'on-dark' : ''}" href="${href}" aria-label="معمار — الرئيسية">${logoMark(onDark)}<span class="brand-word">معمار<small>MI'MAR</small></span></a>`;
  }

  /* Najdi pattern tile used as a background ornament on navy panels */
  function patternSVG(id = 'najdi', color = '#c48a45') {
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M20 4l4 4-4 4-4-4zM20 28l4 4-4 4-4-4zM4 20l4-4 4 4-4 4zM28 20l4-4 4 4-4 4z" fill="${color}"/>
      <path d="M17 17h6v6h-6z" fill="none" stroke="${color}" stroke-width="1.5"/></pattern></defs>
      <rect width="200" height="200" fill="url(#${id})"/></svg>`;
  }

  /* ---------------- Map thumbnails ---------------- */
  function thumbSVG(seed = 1, opts = {}) {
    const r = rng(seed);
    const W = 320, H = 180;
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect class="ground" width="${W}" height="${H}" style="fill:var(--map-ground)"/>`;
    const rot = (r() - .5) * 16;
    s += `<g transform="rotate(${rot.toFixed(1)} 160 90)">`;
    const bw = 96, bh = 44, st = 10;
    // grid is anchored so one parcel sits exactly at (148, 80) — the highlighted one
    for (let y = 80 - 3 * (bh + st); y < H + 60; y += bh + st) {
      for (let x = 124 - 3 * (bw + st); x < W + 80; x += bw + st) {
        const selBlock = x === 124 && y === 80;
        if (!selBlock && r() < .07) { s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" style="fill:var(--map-park)"/>`; continue; }
        s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" style="fill:var(--map-block)"/>`;
        const n = 4;
        for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
          const px = x + i * (bw / n), py = y + row * (bh / 2);
          if (selBlock && i === 1 && row === 0) continue;
          const built = r() < .55;
          s += `<rect x="${px + .5}" y="${py + .5}" width="${bw / n - 1}" height="${bh / 2 - 1}" style="fill:var(${built ? '--map-built' : '--map-parcel'})"/>`;
        }
      }
    }
    s += `</g>`;
    // selected parcel, drawn unrotated at the centre for clarity
    s += `<g transform="rotate(${rot.toFixed(1)} 160 90)"><rect x="148" y="80" width="24" height="22" style="fill:var(--ochre);fill-opacity:.35;stroke:var(--brand-solid);stroke-width:2"/></g>`;
    if (!opts.noPin) s += `<g transform="translate(160 66)"><path d="M0 14c-4-4.5-7-8-7-12a7 7 0 0 1 14 0c0 4-3 7.5-7 12z" style="fill:var(--brand-solid)"/><circle cy="2" r="2.6" style="fill:var(--ochre)"/></g>`;
    s += `</svg>`;
    return s;
  }

  /* ---------------- Shell ---------------- */
  const NAV = [
    { href: '#home', label: 'الرئيسية', icon: 'home', match: ['home'] },
    { href: '#map', label: 'تحليل موقع', icon: 'map', match: ['map', 'analyzing', 'dashboard'] },
    { href: '#history', label: 'السجل', icon: 'history', match: ['history'] },
    { href: '#saved', label: 'المحفوظات', icon: 'bookmark', match: ['saved'] },
    { href: '#profile', label: 'الملف الشخصي', icon: 'user', match: ['profile'] },
  ];
  function langSwitch(onDark = false) {
    return `<div class="lang ${onDark ? 'on-dark' : ''}" role="group" aria-label="لغة الواجهة">${ic('globe')}
      <button type="button" aria-pressed="true" data-lang="ar">ع</button>
      <button type="button" aria-pressed="false" data-lang="en" title="English — قريبًا">EN</button></div>`;
  }
  function topbar(route) {
    const links = NAV.map(n => `<a class="nav-link" href="${n.href}" ${n.match.includes(route) ? 'aria-current="page"' : ''}>${ic(n.icon)}${n.label}</a>`).join('');
    return `<header class="topbar"><div class="container">
      ${brand()}
      <nav class="topbar-nav" aria-label="التنقل الرئيسي">${links}</nav>
      <div class="topbar-end">
        <a class="btn btn-primary hide-md" href="#map">${ic('plus')}تحليل موقع جديد</a>
        ${langSwitch()}
        <div style="position:relative">
          <button class="avatar-btn" type="button" data-menu="user" aria-haspopup="menu" aria-expanded="false" aria-label="قائمة الحساب"><span class="avatar">${M.user.initials}</span></button>
        </div>
      </div>
    </div></header>`;
  }
  function tabbar(route) {
    const t = (href, icon, label, match) => `<a href="${href}" ${match.includes(route) ? 'aria-current="page"' : ''}>${ic(icon)}<span>${label}</span></a>`;
    return `<nav class="tabbar" aria-label="التنقل">
      ${t('#home', 'home', 'الرئيسية', ['home'])}
      ${t('#history', 'history', 'السجل', ['history'])}
      <a href="#map" class="tab-fab" ${['map', 'analyzing', 'dashboard'].includes(route) ? 'aria-current="page"' : ''}><span class="fab">${ic('plus')}</span><span>تحليل جديد</span></a>
      ${t('#saved', 'bookmark', 'المحفوظات', ['saved'])}
      ${t('#profile', 'user', 'حسابي', ['profile'])}
    </nav>`;
  }
  function userMenu() {
    return `<div class="menu" role="menu">
      <div class="menu-head"><span class="avatar">${M.user.initials}</span><div><b>${M.user.name}</b><span>${M.user.email}</span></div></div>
      <a href="#profile" role="menuitem">${ic('user')}الملف الشخصي</a>
      <a href="#saved" role="menuitem">${ic('bookmark')}المحفوظات</a>
      <a href="#profile" data-scroll="prefs" role="menuitem">${ic('settings')}التفضيلات</a>
      <hr><a href="#logout" class="danger" role="menuitem">${ic('logout')}تسجيل الخروج</a></div>`;
  }

  /* ---------------- Toasts & modal ---------------- */
  function toast(msg, opts = {}) {
    let wrap = $('.toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toasts'; wrap.setAttribute('role', 'status'); wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${ic(opts.icon || 'checkCircle')}<span>${msg}</span>${opts.action ? `<button class="toast-act" type="button">${opts.action.label}</button>` : ''}`;
    wrap.appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 200); };
    if (opts.action) el.querySelector('.toast-act').onclick = () => { opts.action.fn(); kill(); };
    setTimeout(kill, opts.ms || 3600);
  }
  function modal(html, onMount) {
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    bd.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(bd);
    const close = () => { bd.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    bd.addEventListener('click', e => { if (e.target === bd || e.target.closest('[data-close]')) close(); });
    onMount && onMount(bd, close);
    const f = bd.querySelector('button, input'); f && f.focus();
    return close;
  }
  function exportModal(a) {
    modal(`
      <div class="modal-head"><div><h3>تصدير تقرير الموقع</h3><p>${a.district} · قطعة ${a.parcel} — تقرير كامل بصيغة PDF</p></div><button class="close-x" data-close aria-label="إغلاق">${ic('x')}</button></div>
      <div class="modal-body">
        <div class="field"><span class="label">لغة التقرير</span>
          <div class="segmented" role="group"><button type="button" aria-pressed="true" data-rl>العربية</button><button type="button" aria-pressed="false" data-rl>English</button></div></div>
        <div class="field"><span class="label">محتوى التقرير</span>
          <div style="display:grid;gap:10px">
            ${['الملخص التنفيذي للموقع', 'المؤشرات البيئية لكل واجهة', 'التوصيات التصميمية', 'مخطط الموقع البيئي', 'الاشتراطات النظامية للقطعة'].map((t, i) => `<label class="check"><input type="checkbox" id="rep-${i}" checked>${t}</label>`).join('')}
          </div></div>
        <div class="callout callout-info">${ic('info')}<div><b>نموذج أولي</b><p>لن يتم تنزيل ملف فعلي في هذه النسخة.</p></div></div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-close>إلغاء</button><button class="btn btn-primary" data-dl>${ic('download')}تجهيز PDF</button></div>`,
      (bd, close) => {
        bd.querySelectorAll('[data-rl]').forEach(b => b.onclick = () => bd.querySelectorAll('[data-rl]').forEach(x => x.setAttribute('aria-pressed', String(x === b))));
        bd.querySelector('[data-dl]').onclick = e => {
          const b = e.currentTarget; b.disabled = true; b.innerHTML = 'جارٍ تجهيز التقرير…';
          setTimeout(() => { close(); toast('التقرير جاهز — هذه معاينة تجريبية دون تنزيل فعلي', { icon: 'fileText' }); }, 1100);
        };
      });
  }

  /* ---------------- Theme ---------------- */
  function applyTheme() {
    if (state.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', state.theme);
  }
  function applyMode() { document.body.classList.toggle('mode-tech', state.mode === 'tech'); }

  /* ---------------- Router ---------------- */
  const Pages = window.Pages = window.Pages || {};
  let current = null;
  function route() {
    const name = (location.hash || '#landing').slice(1) || 'landing';
    const page = Pages[name] || Pages.landing;
    const key = Pages[name] ? name : 'landing';
    if (current && current.unmount) current.unmount();
    current = page;
    const app = $('#app');
    let html = page.render();
    if (page.shell === 'app') html = topbar(key) + `<main class="page has-tabbar" id="main">${html}</main>` + tabbar(key);
    else html = `<div class="page">${html}</div>`;
    app.innerHTML = html;
    document.title = (page.title ? page.title + ' · ' : '') + 'معمار';
    window.scrollTo(0, 0);
    page.mount && page.mount(app);
  }

  /* ---------------- Global events ---------------- */
  document.addEventListener('click', e => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      if (langBtn.dataset.lang === 'en') toast('الواجهة الإنجليزية قيد الإعداد وستتوفر قريبًا', { icon: 'globe' });
      return;
    }
    const menuBtn = e.target.closest('[data-menu]');
    const open = $('.menu');
    if (menuBtn) {
      if (open) { open.remove(); menuBtn.setAttribute('aria-expanded', 'false'); return; }
      menuBtn.insertAdjacentHTML('afterend', userMenu());
      menuBtn.setAttribute('aria-expanded', 'true');
      return;
    }
    if (open && !e.target.closest('.menu')) open.remove();
    const scrollTo = e.target.closest('[data-scroll]');
    if (scrollTo) setTimeout(() => { const t = document.getElementById(scrollTo.dataset.scroll); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('.menu'); m && m.remove(); } });
  window.addEventListener('hashchange', route);

  window.App = {
    state, persist, $, $$, fmt, fmtDate, scoreClass, scoreWord, scorePill, statusChip, analysis, rng,
    logoMark, brand, patternSVG, thumbSVG, langSwitch, toast, modal, exportModal, factorChip,
    FACTOR_ICON, FACTOR_NAME, applyTheme, applyMode,
    start() {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      applyTheme(); applyMode(); route();
    },
  };
})();
