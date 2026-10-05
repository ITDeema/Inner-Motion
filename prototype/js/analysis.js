/* Analysis loading: a staged, simulated pipeline that builds the site picture layer by layer. */
(function () {
  const { state, analysis, fmt } = App;
  const Pages = window.Pages;

  const STAGES = [
    { t: 'تحليل الموقع', d: 'حدود القطعة والمساحة والتوجيه والشوارع المحيطة', icon: 'pin' },
    { t: 'تحليل الإشعاع الشمسي', d: 'مسار الشمس على مدار السنة والإشعاع على كل واجهة', icon: 'sun' },
    { t: 'تحليل اتجاهات الرياح', d: 'وردة الرياح الموسمية وفرص التهوية العابرة', icon: 'wind' },
    { t: 'تحليل درجات الحرارة', d: 'الأنماط اليومية والموسمية وساعات الراحة الحرارية', icon: 'thermo' },
    { t: 'تحليل البيئة المحيطة', d: 'المباني المجاورة والمساحات الخضراء والضوضاء والغبار', icon: 'building' },
    { t: 'توليد التوصيات التصميمية', d: 'ترجمة النتائج إلى قرارات توجيه وتظليل وتهوية', icon: 'pen' },
  ];
  const STAGE_MS = 1150;

  function visual() {
    // parcel 25 × 50 m drawn at 2.8 px/m, north up
    const pw = 70, ph = 140, x0 = -35, y0 = -70;
    let ctx = '';
    [[-200, -150, 120, 60], [-60, -150, 120, 60], [80, -150, 120, 60], [-200, 100, 120, 60], [80, 100, 120, 60], [-200, -60, 120, 130], [80, -60, 120, 130]].forEach(b => {
      ctx += `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" rx="2" style="fill:var(--map-built);opacity:.7"/>`;
    });
    return `<svg viewBox="-260 -260 520 520" aria-hidden="true">
      <defs>
        <radialGradient id="an-heat-w" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-60 20) scale(110 160)"><stop offset="0" style="stop-color:var(--heat);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--heat);stop-opacity:0"/></radialGradient>
        <radialGradient id="an-cool" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(55 -20) scale(70 110)"><stop offset="0" style="stop-color:var(--cold);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--cold);stop-opacity:0"/></radialGradient>
        <linearGradient id="sweep" x1="0" x2="1"><stop offset="0" style="stop-color:var(--ochre);stop-opacity:0"/><stop offset="1" style="stop-color:var(--ochre);stop-opacity:.35"/></linearGradient>
        <clipPath id="an-clip"><circle r="240"/></clipPath>
      </defs>
      <g clip-path="url(#an-clip)">
        <circle r="240" style="fill:var(--surface);stroke:var(--line)"/>
        <g style="stroke:var(--grid)" stroke-width="1">${Array.from({ length: 21 }, (_, i) => `<path d="M${-240 + i * 24} -240V240M-240 ${-240 + i * 24}H240"/>`).join('')}</g>
        <g class="an-L an-L4">${ctx}</g>
        <g class="an-L an-L3"><rect x="-200" y="-200" width="400" height="400" style="fill:url(#an-heat-w)"/><rect x="-200" y="-200" width="400" height="400" style="fill:url(#an-cool)"/></g>
        <g class="an-sweep"><path d="M0 0L240 0A240 240 0 0 0 207.8 -120Z" style="fill:url(#sweep)"/></g>
      </g>
      ${[80, 160, 240].map(r => `<circle r="${r}" fill="none" stroke-dasharray="3 6" style="stroke:var(--line-strong)"/>`).join('')}
      <g style="font-size:13px;font-weight:700;fill:var(--muted)" text-anchor="middle"><text y="-248">ش</text><text y="262">ج</text><text x="254" y="5">ق</text><text x="-254" y="5">غ</text></g>
      <!-- parcel -->
      <rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" style="fill:var(--ochre);fill-opacity:.25;stroke:var(--brand-solid)" stroke-width="2.5" class="an-parcel"/>
      <!-- sun -->
      <g class="an-L an-L1">
        <path id="an-sunpath" d="M200 -40 C 140 210, -140 210, -200 -40" fill="none" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" style="stroke:var(--sun)"/>
        <g class="an-sun"><circle r="22" style="fill:var(--sun);opacity:.18"/><circle r="12" style="fill:var(--sun)"/></g>
        <path d="M-35 -70v140" stroke-width="5" style="stroke:var(--heat);opacity:.8"/>
      </g>
      <!-- wind -->
      <g class="an-L an-L2">${[0, 1, 2, 3, 4].map(i => `<path d="M${-230 + i * 30} ${-170 + i * 40} q 90 30 150 90 t 150 110" fill="none" class="wind-flow" stroke-width="2.2" stroke-linecap="round" style="stroke:var(--wind)" opacity="${.9 - i * .12}"/>`).join('')}</g>
      <!-- recommendations -->
      <g class="an-L an-L5">
        <rect x="${x0 + 6}" y="${y0 + 12}" width="${pw - 12}" height="62" rx="2" style="fill:var(--brand-solid);opacity:.9"/>
        <rect x="${x0 + 6}" y="${y0 + 82}" width="${pw - 12}" height="50" rx="2" style="fill:var(--veg);opacity:.55"/>
        <path d="M${x0 - 10} ${y0 + 14}v58M${x0 - 16} ${y0 + 14}v58" stroke-width="2.5" style="stroke:var(--ochre)"/>
        <path d="M0 ${y0 + 4}l0 -40" stroke-width="2" style="stroke:var(--good)" marker-end="url(#an-arrow)"/>
      </g>
      <defs><marker id="an-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" style="fill:var(--good)"/></marker></defs>
    </svg>`;
  }

  Pages.analyzing = {
    shell: 'app', title: 'جاري التحليل',
    render() {
      const a = analysis(state.currentId);
      return `<div class="analyzing blueprint"><div class="container an-grid">
        <div class="an-visual" id="an-visual">${visual()}</div>
        <div class="an-copy">
          <div class="crumbs"><span class="ok">${ic('check')}اختيار الموقع</span><span class="sep">←</span><span class="cur">التحليل</span><span class="sep">←</span><span>النتائج</span></div>
          <h1 id="an-title" style="margin-top:14px" aria-live="polite">جاري تحليل الموقع…</h1>
          <p class="sub">${a.district} · قطعة ${a.parcel} · <span class="num">${fmt(a.area)}</span> م²</p>
          <div class="an-progress"><div class="an-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="an-bar"><i></i></div>
            <div class="an-pct"><span id="an-cur">${STAGES[0].t}</span><span class="num" id="an-pctv">0%</span></div></div>
          <ol class="an-steps" id="an-steps">
            ${STAGES.map((s, i) => `<li class="an-step" data-i="${i}"><span class="st">${ic(s.icon)}</span><div><b>${s.t}</b><small>${s.d}</small></div><span class="t"></span></li>`).join('')}
          </ol>
          <div class="an-done" id="an-done"><a class="btn btn-ghost" href="#map">${ic('x')}إلغاء</a><span class="proto-note">${ic('info')}محاكاة — لا تُجرى حسابات فعلية</span></div>
        </div>
      </div></div>`;
    },
    mount(root) {
      const steps = [...root.querySelectorAll('.an-step')];
      const bar = root.querySelector('#an-bar');
      const vis = root.querySelector('#an-visual svg');
      const sun = vis.querySelector('.an-sun'), path = vis.querySelector('#an-sunpath');
      const timers = [];
      let raf;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ms = reduce ? 350 : STAGE_MS;

      // sun travels along its arc continuously
      const len = path.getTotalLength();
      const t0 = performance.now();
      const tick = now => {
        const p = path.getPointAtLength(((now - t0) / 4000 % 1) * len);
        sun.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const sweep = vis.querySelector('.an-sweep');
      sweep.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 2600, iterations: Infinity });
      vis.querySelectorAll('.an-L').forEach(l => { l.style.opacity = 0; l.style.transition = 'opacity .6s ease'; });

      function setStage(i) {
        steps.forEach((s, k) => { s.classList.toggle('active', k === i); s.classList.toggle('done', k < i); if (k < i) s.querySelector('.st').innerHTML = ic('check'); });
        const pct = Math.round((i / STAGES.length) * 100);
        bar.querySelector('i').style.width = pct + '%'; bar.setAttribute('aria-valuenow', pct);
        root.querySelector('#an-pctv').textContent = pct + '%';
        if (i < STAGES.length) root.querySelector('#an-cur').textContent = STAGES[i].t + '…';
        if (i > 0) steps[i - 1].querySelector('.t').textContent = (ms / 1000 * (0.8 + ((i * 37) % 5) / 10)).toFixed(1) + ' ث';
        const L = vis.querySelector('.an-L' + i); if (L) L.style.opacity = 1;
        if (i === 4) vis.querySelector('.an-L4').style.opacity = 1;
      }
      STAGES.forEach((_, i) => timers.push(setTimeout(() => setStage(i), i * ms + 200)));
      timers.push(setTimeout(() => {
        setStage(STAGES.length);
        sweep.style.display = 'none';
        root.querySelector('#an-title').textContent = 'اكتمل تحليل الموقع';
        root.querySelector('#an-cur').textContent = 'جاهز';
        let n = 3;
        const done = root.querySelector('#an-done');
        done.innerHTML = `<a class="btn btn-primary btn-lg" href="#dashboard">${ic('eye')}عرض النتائج</a><a class="btn btn-ghost" href="#map">تحليل موقع آخر</a><span class="proto-note" id="an-count">الانتقال تلقائيًا خلال <b class="num">${n}</b> ث</span>`;
        const iv = setInterval(() => {
          n--; const c = root.querySelector('#an-count b'); if (c) c.textContent = n;
          if (n <= 0) { clearInterval(iv); if (location.hash === '#analyzing') location.hash = '#dashboard'; }
        }, 1000);
        timers.push(iv);
      }, STAGES.length * ms + 300));

      this.unmount = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); cancelAnimationFrame(raf); };
    },
  };
})();
