/* Dashboard: environmental analysis translated into design decisions. */
(function () {
  const { state, persist, fmt, fmtDate, analysis, scoreWord, toast, factorChip, exportModal } = App;
  const M = window.MOCK, C = window.Charts;
  const Pages = window.Pages;

  const FACTOR_TONE = { sun: 'sun', wind: 'wind', heat: 'heat', ctx: 'ctx', light: 'ochre' };
  const FACTOR_IC = { sun: 'sun', wind: 'wind', heat: 'thermo', ctx: 'building', light: 'sunrise' };
  const FACTOR_BAR = { sun: 'var(--sun)', wind: 'var(--wind)', heat: 'var(--heat)', ctx: 'var(--ctx)', light: 'var(--ochre)' };

  function ring(score) {
    const r = 78, c = 2 * Math.PI * r;
    const col = score >= 75 ? 'var(--good)' : score >= 60 ? 'var(--warn)' : 'var(--risk)';
    return `<div class="score-ring"><svg viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r="${r}" fill="none" stroke-width="12" style="stroke:var(--bg-sunken)"/>
        <circle cx="90" cy="90" r="${r}" fill="none" stroke-width="12" stroke-linecap="round" id="ring-arc" style="stroke:${col};transition:stroke-dasharray 1.2s cubic-bezier(.2,.7,.2,1)" stroke-dasharray="0 ${c.toFixed(1)}" data-to="${(c * score / 100).toFixed(1)} ${c.toFixed(1)}"/>
        ${Array.from({ length: 20 }, (_, i) => { const a = i / 20 * 2 * Math.PI; return `<path d="M${90 + 92 * Math.cos(a)} ${90 + 92 * Math.sin(a)}L${90 + 96 * Math.cos(a)} ${90 + 96 * Math.sin(a)}" style="stroke:var(--line-strong)" stroke-width="1"/>`; }).join('')}
      </svg><div class="center"><span class="big" id="score-num">0</span><span class="of">من 100</span></div></div>`;
  }

  function sitePlan() {
    const x0 = 250, y0 = 100, W = 200, H = 400; // 8 px per metre
    const sb = { n: 32, w: 24, s: 16, e: 16 };
    const bx = x0 + sb.w, by = y0 + sb.n, bw = W - sb.w - sb.e;
    const label = (x, y, t, fill = 'var(--fg)', anchor = 'middle', size = 11) => `<text x="${x}" y="${y}" text-anchor="${anchor}" style="font-size:${size}px;font-weight:700;fill:${fill};paint-order:stroke;stroke:var(--surface-2);stroke-width:4px;stroke-linejoin:round">${t}</text>`;
    return `<svg viewBox="0 0 640 600" role="img" aria-label="مخطط الموقع البيئي">
      <defs>
        <linearGradient id="sp-hw" x1="0" x2="1"><stop offset="0" style="stop-color:var(--heat);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--heat);stop-opacity:0"/></linearGradient>
        <linearGradient id="sp-hs" x1="0" x2="0" y1="1" y2="0"><stop offset="0" style="stop-color:var(--heat);stop-opacity:.4"/><stop offset="1" style="stop-color:var(--heat);stop-opacity:0"/></linearGradient>
        <radialGradient id="sp-cool"><stop offset="0" style="stop-color:var(--cold);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--cold);stop-opacity:0"/></radialGradient>
        <pattern id="sp-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0v16" fill="none" style="stroke:var(--grid)"/></pattern>
        <marker id="sp-w" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" style="fill:var(--wind)"/></marker>
      </defs>
      <rect width="640" height="600" style="fill:url(#sp-grid)"/>
      <!-- streets (bands, not to scale) -->
      <rect x="120" y="44" width="520" height="44" style="fill:var(--bg-sunken)"/>${label(560, 71, 'شارع 20 م', 'var(--muted)')}
      <rect x="196" y="44" width="44" height="540" style="fill:var(--bg-sunken)"/>
      <text transform="translate(222 540) rotate(-90)" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--muted)">شارع 15 م</text>
      <!-- neighbours -->
      <rect x="${x0 + W + 12}" y="${y0}" width="150" height="190" style="fill:var(--map-built);opacity:.6"/><rect x="${x0 + W + 12}" y="${y0 + 202}" width="150" height="198" style="fill:var(--map-built);opacity:.6"/>
      ${label(x0 + W + 87, y0 + 100, 'جار · دوران', 'var(--muted)', 'middle', 10)}
      <rect x="${x0}" y="${y0 + H + 12}" width="${W}" height="60" style="fill:var(--map-built);opacity:.6"/>

      <!-- parcel -->
      <rect x="${x0}" y="${y0}" width="${W}" height="${H}" style="fill:var(--surface);stroke:var(--brand-solid)" stroke-width="2.5"/>

      <g class="lyr" data-l="heat">
        <rect x="${x0}" y="${y0}" width="70" height="${H}" style="fill:url(#sp-hw)"/>
        <rect x="${x0}" y="${y0 + H - 90}" width="${W}" height="90" style="fill:url(#sp-hs)"/>
        <ellipse cx="${x0 + 150}" cy="${y0 + 250}" rx="70" ry="120" style="fill:url(#sp-cool)"/>
        </g>

      <g class="lyr" data-l="setbacks">
        <rect x="${bx}" y="${by}" width="${bw}" height="${H - sb.n - sb.s}" fill="none" stroke-dasharray="6 5" stroke-width="1.4" style="stroke:var(--fg-2)"/>
        ${label(x0 + W / 2, y0 + 20, 'ارتداد 4 م', 'var(--muted)', 'middle', 9.5)}
        <text transform="translate(${x0 + 14} ${y0 + 370}) rotate(-90)" style="font-size:9.5px;font-weight:700;fill:var(--muted)">3 م</text>
      </g>

      <g class="lyr" data-l="zones">
        <rect x="${bx}" y="${by}" width="${bw}" height="168" rx="2" style="fill:var(--brand-solid);opacity:.88"/>
        <rect x="${bx}" y="${by}" width="44" height="168" style="fill:#08203a;opacity:.6"/>
        <text transform="translate(${bx + 24} ${by + 84}) rotate(-90)" text-anchor="middle" style="font-size:10px;font-weight:600;fill:#fff">خدمات وسلالم</text>
        <text x="${bx + 100}" y="${by + 78}" text-anchor="middle" style="font-size:12px;font-weight:700;fill:#fff">الفراغات الرئيسية</text>
        <text x="${bx + 100}" y="${by + 96}" text-anchor="middle" style="font-size:10px;fill:rgba(255,255,255,.75)">مطلة على الشمال</text>
        <path d="M${bx + 50} ${by - 3}h100" stroke-width="5" style="stroke:var(--good)"/>
        <rect x="${bx + 56}" y="${by + 184}" width="${bw - 56}" height="${H - sb.n - sb.s - 184}" rx="3" style="fill:var(--veg);opacity:.35;stroke:var(--veg)"/>
        ${[[bx + 80, by + 220], [bx + 128, by + 252], [bx + 96, by + 300], [bx + 140, by + 320]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="11" style="fill:var(--veg);opacity:.55"/>`).join('')}
        ${label(bx + 110, by + 272, 'فناء وحديقة', 'var(--fg)', 'middle', 11)}
        <rect x="${bx}" y="${by + 184}" width="46" height="96" rx="2" style="fill:var(--bg-sunken);stroke:var(--line-strong)"/>
        <text transform="translate(${bx + 23} ${by + 232}) rotate(-90)" text-anchor="middle" style="font-size:10px;font-weight:600;fill:var(--muted)">مواقف</text>
        <path d="M${bx - 4} ${by + 30}v70" stroke-width="3" stroke-dasharray="3 3" style="stroke:var(--ochre)"/>
        ${label(bx - 8, by + 124, 'كاسرات', 'var(--ochre-700)', 'start', 9.5)}
      </g>
      <g class="lyr" data-l="heat">${label(x0 + 6, y0 + H - 22, 'منطقة حارة', 'var(--heat)', 'end', 10.5)}${label(x0 + 160, y0 + 236, 'منطقة أبرد', 'var(--cold)', 'middle', 10.5)}</g>

      <g class="lyr" data-l="sun">
        <path d="M600 330 Q 360 690 140 330" fill="none" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" style="stroke:var(--sun)"/>
        ${[[0.12, '7:00'], [0.5, '12:00'], [0.8, '15:00']].map(([t, h]) => { const x = (1 - t) * (1 - t) * 600 + 2 * (1 - t) * t * 360 + t * t * 140, y = (1 - t) * (1 - t) * 330 + 2 * (1 - t) * t * 690 + t * t * 330; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${h === '15:00' ? 13 : 5}" style="fill:var(--sun)"/>${label(x.toFixed(1), (y + (h === '15:00' ? 30 : 20)).toFixed(1), h, 'var(--sun)', 'middle', 10)}`; }).join('')}
        <path d="M229 445 L ${x0 + 12} ${y0 + 330}" stroke-width="1.5" stroke-dasharray="3 4" style="stroke:var(--sun)"/>
      </g>

      <g class="lyr" data-l="wind">
        ${[0, 1, 2, 3].map(i => `<path d="M${30 + i * 40} ${120 + i * 70} C ${180 + i * 40} ${160 + i * 70}, ${300 + i * 30} ${250 + i * 60}, ${470 + i * 30} ${360 + i * 50}" fill="none" class="wind-flow" stroke-width="2.4" stroke-linecap="round" style="stroke:var(--wind)" opacity="${.9 - i * .15}" ${i === 1 ? 'marker-end="url(#sp-w)"' : ''}/>`).join('')}
        ${label(24, 106, 'رياح سائدة شمالية غربية · 3.8 م/ث', 'var(--wind)', 'end', 11)}
        <path d="M${bx - 2} ${by + 140}l10 0M${bx + bw + 2} ${by + 150}l10 0" stroke-width="3" style="stroke:var(--wind)"/>
      </g>

      <!-- dimensions -->
      <g style="stroke:var(--fg-2)" stroke-width="1"><path d="M${x0} ${y0 - 8}h${W}M${x0} ${y0 - 13}v10M${x0 + W} ${y0 - 13}v10"/><path d="M${x0 + W + 4} ${y0}v${H}"/></g>
      ${label(x0 + W / 2, y0 - 14, '25 م', 'var(--fg)', 'middle', 11)}
      <!-- north arrow & scale -->
      <g transform="translate(596 140)"><circle r="22" style="fill:var(--surface);stroke:var(--line-strong)"/><path d="M0-14 7 9 0 4-7 9z" style="fill:var(--brand-solid)"/><text y="-28" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--fg)">ش</text></g>
      <g transform="translate(40 570)"><path d="M0 0h80M0-5v10M40-3v6M80-5v10" style="stroke:var(--fg-2)" stroke-width="1.5"/><text x="40" y="18" text-anchor="middle" style="font-size:10px;fill:var(--muted)">10 م</text></g>
    </svg>`;
  }

  Pages.dashboard = {
    shell: 'app', title: 'نتائج التحليل',
    render() {
      const a = analysis(state.currentId);
      const p = M.parcel;
      const isSaved = state.saved.has(a.id);
      const comfort = M.comfortShare();
      const wr = C.windRose('annual');
      const facade = 'W';
      const fd = M.facades[facade];
      const lat = a.parcel === p.id ? p.lat : (24.81 + (+a.parcel % 97) / 10000);
      const lng = a.parcel === p.id ? p.lng : (46.61 + (+a.parcel % 89) / 10000);

      const tabs = [['ov', 'gauge', 'نظرة عامة'], ['sun', 'sun', 'الشمس'], ['wind', 'wind', 'الرياح'], ['heat', 'thermo', 'الحرارة'], ['ctx', 'building', 'البيئة المحيطة'], ['recs', 'pen', 'التوصيات'], ['plan', 'map', 'مخطط الموقع'], ['sum', 'checkCircle', 'الخلاصة']];

      return `
      <div class="container dash-head">
        <div class="crumbs"><span class="ok">${ic('check')}اختيار الموقع</span><span class="sep">←</span><span class="ok">${ic('check')}التحليل</span><span class="sep">←</span><span class="cur">النتائج</span></div>
        <div class="dash-title">
          <div><h1>${a.district} · قطعة ${a.parcel}</h1>
            <div class="meta">
              <span class="chip">${ic('pin')}${a.city} · مخطط <span class="num">${a.plan}</span></span>
              <span class="chip">${ic('area')}<span class="num">${fmt(a.area)}</span> م² · <span class="num">${a.dims}</span></span>
              <span class="chip">${ic('compass')}الواجهة ${a.facing}${a.corner ? ' · زاوية' : ''}</span>
              <span class="chip mono" style="font-family:var(--font-mono)">${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E</span>
              <span class="chip">${ic('calendar')}${fmtDate(a.date)}</span>
            </div></div>
          <div class="dash-actions">
            <button class="btn btn-outline btn-save" type="button" id="d-save" aria-pressed="${isSaved}">${ic('bookmark')}<span class="lbl-md">${isSaved ? 'محفوظ' : 'حفظ التحليل'}</span></button>
            <button class="btn btn-outline" type="button" id="d-export">${ic('download')}<span class="lbl-md">تصدير التقرير</span></button>
            <button class="btn btn-outline btn-icon" type="button" id="d-share" aria-label="مشاركة الرابط" title="مشاركة">${ic('share')}</button>
            <a class="btn btn-primary" href="#map">${ic('plus')}<span class="lbl-md">تحليل جديد</span></a>
          </div>
        </div>
        <div class="mock-banner">${ic('info')}<span>نموذج أولي: القيم المعروضة بيانات توضيحية مبنية على متوسطات مناخية تقريبية للرياض، وليست تحليلًا معتمدًا لهذه القطعة.</span></div>
      </div>

      <nav class="dash-tabs" aria-label="أقسام التحليل"><div class="container">
        ${tabs.map((t, i) => `<a href="#dashboard" data-tab="${t[0]}" class="${i === 0 ? 'active' : ''}">${ic(t[1])}${t[2]}</a>`).join('')}
        <div class="view-toggle"><div class="segmented" role="group" aria-label="مستوى التفاصيل"><button type="button" data-mode="simple" aria-pressed="${state.mode === 'simple'}">مبسّط</button><button type="button" data-mode="tech" aria-pressed="${state.mode === 'tech'}">تقني</button></div></div>
      </div></nav>

      <div class="container" style="padding-bottom:56px">

        <!-- OVERVIEW -->
        <section class="dsec" id="ov">
          <div class="overview">
            <div class="card score-card">
              ${ring(a.score)}
              <div>
                <h2>التقييم البيئي للموقع</h2>
                <p class="verdict">${scoreWord(a.score)} — موقع مناسب للسكن مع معالجات للتظليل</p>
                <p class="explain simple-only">هذه الأرض تتمتع بتهوية جيدة وإضاءة طبيعية ممتازة وبيئة محيطة هادئة. التحدي الأكبر هو حرارة الشمس على الواجهة الغربية في الصيف، ويمكن حله بقرارات تصميمية بسيطة في مرحلة مبكرة.</p>
                <p class="explain tech-only">التقييم مرجّح من خمسة عوامل: التعرض الشمسي (25%)، الراحة الحرارية (25%)، التهوية الطبيعية (20%)، البيئة المحيطة (15%)، الإضاءة الطبيعية (15%). أدنى عاملين: التعرض الشمسي 66 والراحة الحرارية 68.</p>
                <div class="score-scale" aria-hidden="true"><i class="l" style="flex:60"></i><i class="m" style="flex:15"></i><i class="h" style="flex:25"></i><b class="mk" style="inset-inline-start:${a.score}%"></b></div>
                <div class="score-scale-labels" aria-hidden="true">${[0, 60, 75, 100].map(v => `<span style="inset-inline-start:${v}%">${v}</span>`).join('')}</div>
              </div>
            </div>
            <div class="card factor-list">
              <div class="panel-head" style="border:0;padding-bottom:4px"><h2 style="font-size:var(--fs-md)">تفصيل التقييم</h2><span class="faint" style="font-size:var(--fs-xs)">من 100</span></div>
              ${M.factors.map((f, i) => `<div class="frow"><span class="fi fi-${FACTOR_TONE[f.key]}">${ic(FACTOR_IC[f.key])}</span>
                <div><b>${f.name} <span class="chip ${f.score >= 80 ? 'chip-good' : f.score >= 65 ? 'chip-warn' : 'chip-risk'}" style="height:20px;font-size:11px;margin-inline-start:4px">${f.level}</span></b><small>${f.note}</small></div>
                <div class="bar"><i style="width:${f.score}%;background:${FACTOR_BAR[f.key]};animation-delay:${i * 80}ms"></i></div><span class="v">${f.score}</span></div>`).join('')}
            </div>
          </div>
          <div class="kpis">
            <div class="card kpi"><span class="k">${ic('sun', '', 'style="color:var(--sun)"')}متوسط الإشعاع اليومي</span><span class="v num">6.1 <small>ك.و.س/م²</small></span><span class="s s-warn">${ic('alert')}تعرض شمسي مرتفع</span></div>
            <div class="card kpi"><span class="k">${ic('wind', '', 'style="color:var(--wind)"')}الرياح السائدة</span><span class="v">شمالية غربية</span><span class="s s-good">${ic('checkCircle')}3.8 م/ث · تهوية جيدة</span></div>
            <div class="card kpi"><span class="k">${ic('thermo', '', 'style="color:var(--heat)"')}ساعات الراحة الحرارية</span><span class="v num">${comfort.comfort}% <small>من السنة</small></span><span class="s s-warn">${ic('alert')}راحة حرارية متوسطة</span></div>
            <div class="card kpi"><span class="k">${ic('thermo', '', 'style="color:var(--heat)"')}ذروة الحرارة</span><span class="v num">${Math.max(...M.climate.tmax)}° <small>يوليو</small></span><span class="s s-risk">${ic('alert')}صيف شديد الحرارة</span></div>
          </div>
        </section>

        <!-- SUN -->
        <section class="dsec" id="sun">
          <div class="dsec-head"><span class="fi fi-sun">${ic('sun')}</span><div><h2>الشمس والإشعاع الشمسي</h2><p>أين تشرق الشمس وتغرب على هذه القطعة، وأي الواجهات تتلقى أكبر قدر من الحرارة.</p></div></div>
          <div class="two">
            <div class="card chart-card">
              <div class="chart-head"><div><h3>مسار الشمس على مدار السنة</h3><p class="cap">مسقط أفقي: المركز هو سمت الرأس، والحلقات زوايا ارتفاع الشمس.</p></div></div>
              <div class="chart" id="c-sunpath" style="max-width:380px;margin-inline:auto">${C.sunPath()}</div>
              <div class="legend"><span><i class="line" style="background:var(--sun)"></i>21 يونيو (أطول نهار)</span><span><i class="line" style="background:var(--sun);opacity:.75"></i>الاعتدالان</span><span><i class="line" style="background:var(--sun);opacity:.55"></i>21 ديسمبر</span><span><i style="background:var(--heat);opacity:.25"></i>تعرض مرتفع</span></div>
            </div>
            <div class="card chart-card">
              <div class="chart-head"><div><h3>تحليل الواجهات</h3><p class="cap">اختر واجهة لعرض مؤشراتها البيئية.</p></div>
                <div class="facade-tabs" role="group" aria-label="الواجهة">${['N', 'E', 'S', 'W'].map(k => `<button type="button" data-facade="${k}" aria-pressed="${k === facade}">${M.facades[k].name.replace('ال', '')}</button>`).join('')}</div></div>
              <div id="facade-panel">${facadePanel(facade)}</div>
            </div>
          </div>
          <div class="two-1-2" style="margin-top:20px">
            <div class="card chart-card">
              <h3>التوجيه الموصى به</h3>
              <div style="display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;align-items:center">
                <div class="chart">${C.orientation()}</div>
                <p style="font-size:var(--fs-sm);color:var(--fg-2)">مدّ المبنى على محور <b>شرق – غرب</b> واجعل الواجهة الطويلة تطل على <b>الشمال</b>. يُقبل انحراف حتى 15° دون أثر كبير على الأداء.</p>
              </div>
              <h3 style="margin-top:6px">استراتيجيات التظليل المقترحة</h3>
              <div class="strategy">
                <div class="strat"><span class="sv">${C.stratGlyph('overhang')}</span><div><b>بروزات أفقية — الواجهة الجنوبية</b><p>تحجب شمس الصيف العالية وتسمح بشمس الشتاء المنخفضة.<span class="tech-only"> عمق 0.6–0.9 م.</span></p></div></div>
                <div class="strat"><span class="sv">${C.stratGlyph('fins')}</span><div><b>كاسرات رأسية — الشرقية والغربية</b><p>فعّالة مع الشمس المنخفضة صباحًا ومساءً.<span class="tech-only"> تباعد 30 سم، عمق 40 سم.</span></p></div></div>
                <div class="strat"><span class="sv">${C.stratGlyph('mashrabiya')}</span><div><b>مشربيات وشاشات مثقبة — الغربية</b><p>تظليل وخصوصية مع مرور الهواء، بروح العمارة المحلية.<span class="tech-only"> نفاذية 30–40%.</span></p></div></div>
              </div>
            </div>
            <div class="card chart-card">
              <div class="chart-head"><div><h3>الإشعاع الشمسي الشهري</h3><p class="cap">ك.و.س/م² يوميًا على سطح أفقي · مرّر المؤشر على الأعمدة</p></div><span class="chip chip-sun">${ic('sun')}الذروة في يونيو</span></div>
              <div class="chart" id="c-rad">${C.radiationBars()}</div>
              <div class="callout callout-warn">${ic('alert')}<div><b>المناطق الأعلى تعرضًا</b><p>الواجهة الغربية والسطح هما الأكثر تعرضًا من مايو إلى سبتمبر. عزل السطح وتظليل الغرب أولوية.</p></div></div>
            </div>
          </div>
        </section>

        <!-- WIND -->
        <section class="dsec" id="wind">
          <div class="dsec-head"><span class="fi fi-wind">${ic('wind')}</span><div><h2>الرياح والتهوية</h2><p>من أين تهب الرياح، وكيف يمكن استخدامها لتبريد المبنى طبيعيًا.</p></div></div>
          <div class="two">
            <div class="card chart-card">
              <div class="chart-head"><div><h3>وردة الرياح</h3><p class="cap">نسبة الوقت الذي تهب فيه الرياح من كل اتجاه، مقسمة حسب السرعة.</p></div>
                <div class="segmented" role="group" aria-label="الموسم"><button type="button" data-season="annual" aria-pressed="true">سنوي</button><button type="button" data-season="summer" aria-pressed="false">صيف</button><button type="button" data-season="winter" aria-pressed="false">شتاء</button></div></div>
              <div class="chart" id="c-wind" style="max-width:380px;margin-inline:auto">${wr.svg}</div>
              ${C.windLegend()}
            </div>
            <div style="display:grid;gap:16px;align-content:start">
              <div class="kpis" style="margin:0;grid-template-columns:1fr 1fr">
                <div class="card kpi"><span class="k">${ic('compass', '', 'style="color:var(--wind)"')}الاتجاه السائد</span><span class="v" id="w-dom">${M.DIRS_FULL[wr.dom]}</span><span class="s" style="color:var(--muted)" id="w-dom-p">${wr.totals[wr.dom].toFixed(1)}% من الوقت</span></div>
                <div class="card kpi"><span class="k">${ic('wind', '', 'style="color:var(--wind)"')}متوسط السرعة</span><span class="v num">3.8 <small>م/ث</small></span><span class="s s-good">${ic('checkCircle')}مناسبة للتهوية</span></div>
              </div>
              <div class="card chart-card">
                <h3>إمكانية التهوية الطبيعية</h3>
                <div style="display:flex;gap:14px;align-items:center"><div style="flex:1"><div class="ind-row" style="border:0;padding:0"><span>جيدة</span><span class="v num">84/100</span><div class="bar"><i style="width:84%;background:var(--wind)"></i></div></div></div></div>
                <p style="font-size:var(--fs-sm);color:var(--fg-2)">الرياح الشمالية الغربية منتظمة في <b>الربيع والخريف</b>، وهي الفترة التي تكون فيها التهوية الطبيعية مريحة. ضع فتحات متقابلة على الواجهتين <b>الشمالية الغربية</b> و<b>الجنوبية الشرقية</b>.</p>
                <p class="tech-only" style="font-size:var(--fs-xs);color:var(--muted)">نسبة السكون ${wr.calm.toFixed(0)}% · فرق الضغط التقديري بين الواجهتين ~6 باسكال عند 3.8 م/ث · نسبة فتحات المدخل إلى المخرج 1:1.25.</p>
              </div>
              <div class="callout callout-risk">${ic('dust')}<div><b>تنبيه: العواصف الترابية</b><p>نفس اتجاه الرياح المفيدة يحمل الغبار بين مارس ومايو. استخدم حاجزًا نباتيًا أو مرشحات في الفتحات المواجهة للشمال الغربي.</p></div></div>
            </div>
          </div>
        </section>

        <!-- HEAT -->
        <section class="dsec" id="heat">
          <div class="dsec-head"><span class="fi fi-heat">${ic('thermo')}</span><div><h2>الحرارة والراحة الحرارية</h2><p>متى يكون الجو مريحًا ومتى يحتاج المبنى إلى حماية من الحرارة.</p></div></div>
          <div class="two">
            <div class="card chart-card">
              <div class="chart-head"><div><h3>نطاق درجات الحرارة الشهري</h3><p class="cap">العظمى والصغرى لكل شهر، مقارنة بنطاق الراحة.</p></div></div>
              <div class="chart" id="c-temp">${C.tempRange()}</div>
            </div>
            <div class="card chart-card">
              <h3>مؤشرات الراحة الحرارية</h3>
              <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;gap:2px" aria-label="توزيع ساعات السنة">
                <i style="flex:${comfort.cold};background:var(--cold)"></i><i style="flex:${comfort.comfort};background:var(--good)"></i><i style="flex:${comfort.hot};background:var(--heat)"></i>
              </div>
              <div class="legend"><span><i style="background:var(--cold)"></i>بارد ومعتدل البرودة <b class="num">${comfort.cold}%</b></span><span><i style="background:var(--good)"></i>مريح <b class="num">${comfort.comfort}%</b></span><span><i style="background:var(--heat)"></i>دافئ إلى حار <b class="num">${comfort.hot}%</b></span></div>
              <div class="ind">
                <div class="ind-row"><span>أفضل أشهر الاستخدام الخارجي</span><span class="v">نوفمبر – مارس</span></div>
                <div class="ind-row"><span>ساعات تتجاوز 38°م سنويًا</span><span class="v num">~1,050 ساعة</span></div>
                <div class="ind-row"><span>الفرق بين الليل والنهار</span><span class="v num">12–15°م</span><span class="note">فرق كبير يجعل الكتلة الحرارية (الجدران السميكة) مفيدة.</span></div>
                <div class="ind-row tech-only"><span>درجات التبريد السنوية (CDD18)</span><span class="v num">4,420</span></div>
              </div>
              <div class="callout callout-info">${ic('pin')}<div><b>المناطق الحارة والباردة في القطعة</b><p>الحد الغربي والجنوبي هما الأكثر حرارة، والجزء الشرقي في ظل المبنى بعد الظهر هو الأبرد. انظر مخطط الموقع.</p></div></div>
            </div>
          </div>
          <div class="card chart-card" style="margin-top:20px">
            <div class="chart-head"><div><h3>التقويم الحراري</h3><p class="cap">كل خلية ساعة في يوم نموذجي من الشهر. الرمادي هو نطاق الراحة.</p></div>${C.thermalLegend()}</div>
            <div class="chart" id="c-cal" style="overflow-x:auto"><div style="min-width:560px">${C.thermalCalendar()}</div></div>
          </div>
        </section>

        <!-- CONTEXT -->
        <section class="dsec" id="ctx">
          <div class="dsec-head"><span class="fi fi-ctx">${ic('building')}</span><div><h2>البيئة المحيطة</h2><p>ما حول القطعة ضمن نطاق 500 م وتأثيره على قراراتك.</p></div></div>
          <div class="two">
            <div class="card chart-card">
              <h3>عناصر مؤثرة حول الموقع</h3>
              <div class="ctx-list">${M.context.map(c => `<div class="ctx-item"><span class="fi ${c.tone === 'veg' ? '' : 'fi-ctx'}" style="${c.tone === 'veg' ? 'background:var(--good-soft);color:var(--veg)' : ''}">${ic(c.icon)}</span><div><b>${c.name}</b><small>${c.detail}</small></div><span class="chip chip-${c.badge[0]}">${ic(c.badge[0] === 'good' ? 'check' : 'alert')}${c.badge[1]}</span></div>`).join('')}</div>
            </div>
            <div class="card chart-card">
              <h3>خريطة السياق</h3>
              <div class="chart" style="max-width:360px;margin-inline:auto">${C.contextMap()}</div>
            </div>
          </div>
          <div class="card chart-card" style="margin-top:20px">
            <div class="chart-head"><div><h3>الاشتراطات النظامية للقطعة</h3><p class="cap">قيم مرجعية تُطبَّق عليها التوصيات، وليست فحص امتثال.</p></div><span class="chip chip-outline">${ic('file')}كود البناء السعودي · مرجعي</span></div>
            <dl class="reg" style="margin:0">${M.regs.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd><span class="faint" style="font-size:var(--fs-xs)">${r[2]}</span></div>`).join('')}</dl>
            ${a.note ? `<div class="callout callout-warn">${ic('alert')}<div><b>ملاحظة على مستوى القطعة</b><p>${a.note}. ننصح بالتحقق مع الجهة المختصة قبل التصميم التفصيلي.</p></div></div>` : ''}
          </div>
        </section>

        <!-- RECOMMENDATIONS -->
        <section class="dsec" id="recs">
          <div class="dsec-head"><span class="fi fi-ochre">${ic('pen')}</span><div><h2>التصميم المقترح</h2><p>كل توصية مبنية على نتيجة محددة في التحليل، مع سببها وأثرها المتوقع. جميعها ضمن الاشتراطات النظامية للقطعة.</p></div></div>
          <div class="recs">
            ${M.recs.map((r, i) => `<article class="card card-hover rec">
              <div class="rec-top"><span class="rv">${C.recGlyph(r.icon)}</span><div class="t"><span class="cat">${r.cat}</span><h3>${r.title}</h3></div></div>
              <div class="rec-mid">
                <p class="rec-why"><b>لماذا؟ </b>${r.why}</p>
                <div class="rec-tags">${factorChip(r.factor)}${r.compliance ? `<span class="chip chip-good">${ic('check')}ضمن الاشتراطات</span>` : ''}</div>
                <div class="rec-tech tech-only"><b>تفاصيل تقنية: </b>${r.tech}</div>
              </div>
              <dl class="rec-foot" style="margin:0">
                <div><dt>العامل البيئي</dt><dd>${ic(FACTOR_IC[r.factor], '', `style="color:${FACTOR_BAR[r.factor]}"`)}${App.FACTOR_NAME[r.factor]}</dd></div>
                <div><dt>الأثر المتوقع</dt><dd><span class="impact" data-v="${r.impact}" aria-label="أثر ${['', 'منخفض', 'متوسط', 'مرتفع'][r.impact]}"><i></i><i></i><i></i></span>${['', 'منخفض', 'متوسط', 'مرتفع'][r.impact]}</dd></div>
                <div><dt>النتيجة</dt><dd style="font-weight:600">${r.impactText}</dd></div>
              </dl>
            </article>`).join('')}
          </div>
        </section>

        <!-- SITE PLAN -->
        <section class="dsec" id="plan">
          <div class="dsec-head"><span class="fi fi-navy">${ic('map')}</span><div><h2>مخطط الموقع البيئي</h2><p>كل ما سبق في رسم واحد: الشمس والرياح والحرارة، وأين نقترح وضع الكتلة والفناء.</p></div></div>
          <div class="card siteplan-wrap">
            <div class="siteplan" id="siteplan">${sitePlan()}</div>
            <div class="sp-side">
              <h3 style="font-size:var(--fs-md)">طبقات المخطط</h3>
              <div class="sp-layers">
                ${[['sun', 'var(--sun)', 'مسار الشمس'], ['wind', 'var(--wind)', 'الرياح السائدة'], ['heat', 'linear-gradient(90deg,var(--heat),var(--cold))', 'المناطق الحارة والباردة'], ['zones', 'var(--brand-solid)', 'المناطق المقترحة'], ['setbacks', 'repeating-linear-gradient(90deg,var(--fg-2) 0 4px,transparent 4px 7px)', 'حدود الارتدادات']].map(l => `<label class="sp-layer"><span class="sw" style="background:${l[1]}"></span>${l[2]}<span class="switch" style="margin-inline-start:auto"><input type="checkbox" data-spl="${l[0]}" checked aria-label="${l[2]}"></span></label>`).join('')}
              </div>
              <div class="callout callout-info">${ic('info')}<div><b>كيف تقرأ المخطط؟</b><p>الكتلة الداكنة شمالًا هي موضع الفراغات الرئيسية المقترح، والشريط الغربي للخدمات كحاجز حراري، والفناء شرقًا في الظل المسائي.</p></div></div>
              <p class="tech-only" style="font-size:var(--fs-xs);color:var(--muted)">مساحة الكتلة المقترحة في الدور الأرضي ≈ 420 م² (34% من القطعة) ضمن نسبة البناء المسموحة 60%.</p>
            </div>
          </div>
        </section>

        <!-- SUMMARY -->
        <section class="dsec" id="sum">
          <div class="dsec-head"><span class="fi fi-good" style="background:var(--good-soft);color:var(--good)">${ic('checkCircle')}</span><div><h2>أهم 3 قرارات تصميمية للموقع</h2><p>إذا لم تقرأ غير هذا القسم، فهذه القرارات هي ما يجب مناقشته مع المعماري أولًا.</p></div></div>
          <div class="decisions">
            ${M.decisions.map((d, i) => `<div class="decision"><span class="n num">${i + 1}</span><h3>${d.title}</h3><p>${d.text}</p><span class="chip">${ic(FACTOR_IC[d.factor])}${App.FACTOR_NAME[d.factor]}</span></div>`).join('')}
          </div>
          <div class="summary-actions">
            <span class="proto-note">${ic('info')}هذه نتائج توضيحية من نموذج أولي.</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-outline btn-save" type="button" id="d-save2" aria-pressed="${isSaved}">${ic('bookmark')}${isSaved ? 'محفوظ' : 'حفظ التحليل'}</button>
              <button class="btn btn-outline" type="button" id="d-export2">${ic('download')}تصدير التقرير</button>
              <a class="btn btn-primary" href="#map">${ic('map')}حلّل موقعًا آخر</a>
            </div>
          </div>
        </section>
      </div>`;
    },
    mount(root) {
      const a = analysis(state.currentId);
      // score ring
      requestAnimationFrame(() => {
        const arc = root.querySelector('#ring-arc'); arc.setAttribute('stroke-dasharray', arc.dataset.to);
        const num = root.querySelector('#score-num'); const target = a.score; const t0 = performance.now();
        const step = now => { const t = Math.min(1, (now - t0) / 1100); num.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
      // tooltips
      ['#c-sunpath', '#c-rad', '#c-wind', '#c-temp', '#c-cal'].forEach(s => C.tips(root.querySelector(s)));
      // façade selector
      root.querySelectorAll('[data-facade]').forEach(b => b.onclick = () => {
        root.querySelectorAll('[data-facade]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        root.querySelector('#facade-panel').innerHTML = facadePanel(b.dataset.facade);
      });
      // wind season
      root.querySelectorAll('[data-season]').forEach(b => b.onclick = () => {
        root.querySelectorAll('[data-season]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        const wr = C.windRose(b.dataset.season);
        const host = root.querySelector('#c-wind'); const tip = host.querySelector('.tip');
        host.innerHTML = wr.svg; if (tip) host.appendChild(tip);
        root.querySelector('#w-dom').textContent = M.DIRS_FULL[wr.dom];
        root.querySelector('#w-dom-p').textContent = wr.totals[wr.dom].toFixed(1) + '% من الوقت';
      });
      // mode
      root.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
        state.mode = b.dataset.mode; persist(); App.applyMode();
        root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === state.mode)));
      });
      // site plan layers
      root.querySelectorAll('[data-spl]').forEach(c => c.onchange = () => root.querySelectorAll(`#siteplan .lyr[data-l="${c.dataset.spl}"]`).forEach(g => g.classList.toggle('off', !c.checked)));
      // save / export / share
      const saveBtns = [root.querySelector('#d-save'), root.querySelector('#d-save2')];
      const syncSave = () => saveBtns.forEach((b, i) => { const on = state.saved.has(a.id); b.setAttribute('aria-pressed', String(on)); const lbl = on ? 'محفوظ' : 'حفظ التحليل'; if (i === 0) b.querySelector('.lbl-md').textContent = lbl; else b.lastChild.textContent = lbl; });
      saveBtns.forEach(b => b.onclick = () => {
        const on = !state.saved.has(a.id); on ? state.saved.add(a.id) : state.saved.delete(a.id); persist(); syncSave();
        toast(on ? 'تم حفظ التحليل في المحفوظات' : 'أُزيل من المحفوظات', { icon: 'bookmark', action: on ? { label: 'عرض', fn: () => { location.hash = '#saved'; } } : null });
      });
      [root.querySelector('#d-export'), root.querySelector('#d-export2')].forEach(b => b.onclick = () => exportModal(a));
      root.querySelector('#d-share').onclick = () => {
        const url = location.href.split('#')[0] + '#dashboard';
        Promise.resolve().then(() => navigator.clipboard.writeText(url)).then(() => toast('تم نسخ رابط التحليل', { icon: 'copy' })).catch(() => toast('رابط المشاركة: ' + url, { icon: 'share', ms: 6000 }));
      };
      // tabs: smooth scroll + scroll spy
      const links = [...root.querySelectorAll('[data-tab]')];
      links.forEach(l => l.addEventListener('click', e => { e.preventDefault(); document.getElementById(l.dataset.tab).scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
      const io = new IntersectionObserver(ents => ents.forEach(en => {
        if (en.isIntersecting) { links.forEach(l => l.classList.toggle('active', l.dataset.tab === en.target.id)); const act = links.find(l => l.dataset.tab === en.target.id); act && act.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      }), { rootMargin: '-35% 0px -60% 0px' });
      root.querySelectorAll('.dsec').forEach(s => io.observe(s));
      this.unmount = () => io.disconnect();
    },
  };

  function facadePanel(k) {
    const f = M.facades[k];
    const vc = { good: ['callout-good', 'checkCircle', 'مناسبة للفتحات الكبيرة'], warn: ['callout-warn', 'alert', 'تحتاج تظليلًا'], risk: ['callout-risk', 'alert', 'تحتاج حماية حرارية'] }[f.verdict];
    const row = (label, v, pct, color, note, tech) => `<div class="ind-row ${tech ? 'tech-only' : ''}"><span>${label}</span><span class="v num">${v}</span><div class="bar"><i style="width:${pct}%;background:${color}"></i></div>${note ? `<span class="note">${note}</span>` : ''}</div>`;
    return `<div style="display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;align-items:start">
      ${C.facadeKey(k)}
      <div class="ind">
        ${row('الإشعاع الشمسي', f.rad + ' ك.و.س/م²/يوم', f.rad / 5 * 100, 'var(--sun)', '')}
        ${row('نسبة الظل الطبيعي', f.shade + '%', f.shade, 'var(--ctx)', '')}
        ${row('مؤشر انفتاح الرياح', f.open.toFixed(2), f.open * 100, 'var(--wind)', '')}
        ${row('معامل رؤية السماء (SVF)', f.svf.toFixed(2), f.svf * 100, 'var(--ochre)', '', true)}
      </div></div>
      <div class="callout ${vc[0]}" style="margin-top:14px">${ic(vc[1])}<div><b>الواجهة ${f.name}: ${vc[2]}</b><p>${f.text}</p></div></div>`;
  }
})();
