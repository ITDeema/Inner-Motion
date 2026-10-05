/* Map page: simulated GIS parcel selection on a drawn vector map (1 unit = 1 metre). */
(function () {
  const { state, persist, fmt, toast, rng } = App;
  const M = window.MOCK;
  const Pages = window.Pages;

  const WORLD = { w: 1700, h: 1100 };
  const COLS = [40, 305, 570, 835, 1175, 1440];
  const ROWS = [140, 260, 380, 500, 620, 740, 860, 980];
  const BW = 250, BH = 100;
  const ART_V = [1100, 1160];   // طريق عثمان بن عفان
  const ART_H = [60, 120];      // طريق أنس بن مالك
  const PARK = { x: 305, y: 500, w: 250, h: 220 };
  const SCHOOL = { x: 570, y: 740, w: 250, h: 220 };
  const SEL_ORIGIN = { x: 317.5, y: 405 }; // centre of parcel 1427

  /* ---------- model ---------- */
  function buildParcels() {
    const r = rng(42);
    const parcels = [];
    ROWS.forEach((by, row) => COLS.forEach((bx, col) => {
      const inPark = bx === PARK.x && by >= PARK.y && by < PARK.y + PARK.h;
      const inSchool = bx === SCHOOL.x && by >= SCHOOL.y && by < SCHOOL.y + SCHOOL.h;
      if (inPark || inSchool) return;
      const east = bx > ART_V[0];
      const pw = east ? 50 : 25, n = BW / pw;
      for (let rib = 0; rib < 2; rib++) for (let i = 0; i < n; i++) {
        const x = bx + i * pw, y = by + rib * 50;
        const num = 1427 + ((row - 2) * 6 + (col - 1)) * 20 + rib * 10 + i;
        const forcedVacant = num === 1427 || num === 1431;
        const built = !forcedVacant && r() < (east ? .75 : .55);
        const corner = i === 0 || i === n - 1;
        parcels.push({
          id: String(num), x, y, w: pw, d: 50, built, corner, east,
          facing: rib === 0 ? 'شمالية' : 'جنوبية',
          district: east ? 'حي حطين' : 'حي الملقا',
          plan: east ? '3110' : '3021',
          mosque: col === 0 && row === 3 && rib === 0 && i === n - 1,
          bf: built ? { inset: 3 + r() * 2, depth: 26 + r() * 14 } : null,
        });
      }
    }));
    return parcels;
  }
  let PARCELS = null;
  const parcelById = id => PARCELS.find(p => p.id === id);
  function geo(p) {
    const cx = p.x + p.w / 2, cy = p.y + p.d / 2;
    return { lat: (24.8187 + (SEL_ORIGIN.y - cy) * 0.000009).toFixed(4), lng: (46.6152 + (cx - SEL_ORIGIN.x) * 0.0000099).toFixed(4) };
  }

  /* ---------- drawing ---------- */
  function mapSVG() {
    let s = '';
    s += `<rect class="ground road" x="-400" y="-400" width="${WORLD.w + 800}" height="${WORLD.h + 800}" style="fill:var(--map-road)"/>`;
    // districts boundary sits in the artery median
    // arteries
    s += `<rect x="${ART_V[0]}" y="-400" width="${ART_V[1] - ART_V[0]}" height="${WORLD.h + 800}" style="fill:var(--map-artery);stroke:var(--map-artery-edge)"/>`;
    s += `<rect x="-400" y="${ART_H[0]}" width="${WORLD.w + 800}" height="${ART_H[1] - ART_H[0]}" style="fill:var(--map-artery);stroke:var(--map-artery-edge)"/>`;
    s += `<path d="M${(ART_V[0] + ART_V[1]) / 2} -400V${WORLD.h + 400}M-400 ${(ART_H[0] + ART_H[1]) / 2}H${WORLD.w + 400}" stroke-width="2" stroke-dasharray="14 10" style="stroke:var(--map-artery-edge)"/>`;
    // blocks
    ROWS.forEach(by => COLS.forEach(bx => { s += `<rect class="block-bg" x="${bx}" y="${by}" width="${BW}" height="${BH}" style="fill:var(--map-block)"/>`; }));
    // park
    s += `<rect class="park" x="${PARK.x}" y="${PARK.y}" width="${PARK.w}" height="${PARK.h}" rx="6" style="fill:var(--map-park)"/>`;
    s += `<path d="M${PARK.x + 20} ${PARK.y + 180} C ${PARK.x + 80} ${PARK.y + 120}, ${PARK.x + 150} ${PARK.y + 170}, ${PARK.x + 230} ${PARK.y + 60}" fill="none" stroke-width="5" stroke-linecap="round" style="stroke:var(--map-road);opacity:.8"/>`;
    const tr = rng(7);
    for (let k = 0; k < 46; k++) s += `<circle cx="${(PARK.x + 12 + tr() * (PARK.w - 24)).toFixed(1)}" cy="${(PARK.y + 12 + tr() * (PARK.h - 24)).toFixed(1)}" r="${(4 + tr() * 5).toFixed(1)}" style="fill:var(--veg);opacity:.45"/>`;
    // school
    s += `<rect class="block-bg" x="${SCHOOL.x}" y="${SCHOOL.y}" width="${SCHOOL.w}" height="${SCHOOL.h}" style="fill:var(--map-block)"/>`;
    s += `<rect x="${SCHOOL.x + 20}" y="${SCHOOL.y + 20}" width="120" height="70" class="bldg" style="fill:var(--map-built)"/><rect x="${SCHOOL.x + 20}" y="${SCHOOL.y + 110}" width="210" height="90" rx="4" style="fill:var(--map-park);opacity:.7"/>`;
    // parcels
    s += `<g class="parcels">`;
    PARCELS.forEach(p => {
      s += `<rect class="parcel ${p.built ? 'built' : ''}" data-p="${p.id}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.d}"><title>قطعة ${p.id}</title></rect>`;
      if (p.bf) {
        const front = p.facing === 'شمالية' ? p.y + p.bf.inset + 2 : p.y + p.d - p.bf.inset - 2 - p.bf.depth;
        s += `<rect class="bldg" x="${(p.x + 2.5).toFixed(1)}" y="${front.toFixed(1)}" width="${p.w - 5}" height="${p.bf.depth.toFixed(1)}" style="stroke:var(--line-strong);stroke-width:.5"/>`;
      }
    });
    s += `</g>`;
    // POIs
    const mq = PARCELS.find(p => p.mosque);
    if (mq) s += poi(mq.x + mq.w / 2, mq.y + mq.d / 2, 'مسجد');
    s += poi(SCHOOL.x + 80, SCHOOL.y + 55, 'مدرسة');
    // heat layer
    s += `<g class="heat-layer" style="mix-blend-mode:multiply"><defs>
        <radialGradient id="hot"><stop offset="0" style="stop-color:var(--heat);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--heat);stop-opacity:0"/></radialGradient>
        <radialGradient id="cool"><stop offset="0" style="stop-color:var(--cold);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--cold);stop-opacity:0"/></radialGradient></defs>
      <ellipse cx="1130" cy="400" rx="150" ry="700" fill="url(#hot)"/><ellipse cx="700" cy="90" rx="900" ry="120" fill="url(#hot)"/>
      <ellipse cx="960" cy="620" rx="160" ry="160" fill="url(#hot)" opacity=".6"/>
      <ellipse cx="430" cy="610" rx="220" ry="200" fill="url(#cool)"/><ellipse cx="695" cy="900" rx="140" ry="110" fill="url(#cool)" opacity=".7"/></g>`;
    // districts boundary
    s += `<g class="districts"><path d="M1130 -400V${WORLD.h + 400}" fill="none" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" style="stroke:var(--ctx);opacity:.6"/>
      <text x="560" y="1075" text-anchor="middle" style="fill:var(--ctx);font-size:30px;font-weight:700;opacity:.4;font-family:var(--font-display)">حي الملقا</text>
      <text x="1420" y="1075" text-anchor="middle" style="fill:var(--ctx);font-size:30px;font-weight:700;opacity:.4;font-family:var(--font-display)">حي حطين</text></g>`;
    // labels
    s += `<g class="map-labels" style="font-family:var(--font-body);font-weight:600;fill:var(--map-label)">
      <text x="640" y="95" text-anchor="middle" style="font-size:14px">طريق أنس بن مالك</text>
      <text transform="translate(1135 640) rotate(90)" text-anchor="middle" style="font-size:14px">طريق عثمان بن عفان</text>
      <text x="430" y="374" text-anchor="middle" style="font-size:9px">شارع الرمّاح · 20 م</text>
      <text x="430" y="254" text-anchor="middle" style="font-size:9px">شارع وادي الدواسر · 20 م</text>
      <text transform="translate(301 470) rotate(90)" text-anchor="middle" style="font-size:8px">شارع 15 م</text>
      <text x="${PARK.x + PARK.w / 2}" y="${PARK.y + PARK.h / 2}" text-anchor="middle" style="font-size:12px;fill:var(--veg)">حديقة الملقا</text>
    </g>`;
    s += `<g id="sel-layer"></g><g id="loc-layer"></g>`;
    return s;
  }
  function poi(x, y, label) {
    return `<g transform="translate(${x} ${y})" style="pointer-events:none"><circle r="9" style="fill:var(--surface);stroke:var(--ctx)" stroke-width="2"/><circle r="3.5" style="fill:var(--ctx)"/><text y="22" text-anchor="middle" style="font-size:10px;font-weight:600;fill:var(--ctx)">${label}</text></g>`;
  }
  function selectionSVG(p) {
    const cx = p.x + p.w / 2;
    const top = p.y;
    return `<rect class="sel-outline" x="${p.x - 4}" y="${p.y - 4}" width="${p.w + 8}" height="${p.d + 8}"/>
      <g style="stroke:var(--fg-2);stroke-width:.8" fill="none"><path d="M${p.x} ${p.y + p.d + 10}h${p.w}M${p.x} ${p.y + p.d + 6}v8M${p.x + p.w} ${p.y + p.d + 6}v8"/>
      <path d="M${p.x + p.w + 10} ${p.y}v${p.d}M${p.x + p.w + 6} ${p.y}h8M${p.x + p.w + 6} ${p.y + p.d}h8"/></g>
      <text x="${cx}" y="${p.y + p.d + 22}" text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--fg)">${p.w} م</text>
      <text x="${p.x + p.w + 14}" y="${p.y + p.d / 2 + 3}" text-anchor="end" style="font-size:9px;font-weight:700;fill:var(--fg)">${p.d} م</text>
      <g transform="translate(${cx} ${top - 4})"><g class="pin-drop"><path d="M0 0C-7-8-12-13-12-21a12 12 0 0 1 24 0c0 8-5 13-12 21z" style="fill:var(--brand-solid);stroke:var(--surface)" stroke-width="1.5"/><circle cy="-21" r="4.4" style="fill:var(--ochre)"/></g></g>`;
  }

  function parcelDiagram(p) {
    // simple architectural plan of the parcel: dims, streets, north
    const W = 320, H = 200, sc = Math.min(124 / p.d, 180 / p.w);
    const pw = p.w * sc, ph = p.d * sc, x0 = (W - pw) / 2 + 10, y0 = (H - ph) / 2 + 6;
    const north = p.facing === 'شمالية';
    return `<svg viewBox="0 0 ${W} ${H}" aria-label="مخطط القطعة">
      <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v6" style="stroke:var(--line-strong)" stroke-width="1"/></pattern></defs>
      <rect x="0" y="${north ? y0 - 30 : y0 + ph + 6}" width="${W}" height="24" style="fill:var(--bg-sunken)"/>
      <text x="${W / 2 + 40}" y="${north ? y0 - 14 : y0 + ph + 22}" text-anchor="middle" style="font-size:10px;fill:var(--muted);font-weight:600">شارع ${north ? 20 : 20} م</text>
      ${p.corner ? `<rect x="${x0 - 30}" y="0" width="24" height="${H}" style="fill:var(--bg-sunken)"/><text transform="translate(${x0 - 15} ${H / 2}) rotate(90)" text-anchor="middle" style="font-size:10px;fill:var(--muted);font-weight:600">شارع 15 م</text>` : ''}
      <rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" style="fill:url(#hatch);stroke:var(--brand-solid)" stroke-width="2"/>
      <rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" style="fill:var(--ochre);fill-opacity:.18"/>
      <path d="M${x0} ${y0 + ph + (north ? 12 : -8)}h${pw}" style="stroke:var(--fg-2)" stroke-width=".8"/>
      <text x="${x0 + pw / 2}" y="${y0 + ph + (north ? 24 : -12)}" text-anchor="middle" style="font-size:10px;font-weight:700;fill:var(--fg)">${p.w} م</text>
      <path d="M${x0 + pw + 10} ${y0}v${ph}" style="stroke:var(--fg-2)" stroke-width=".8"/>
      <text x="${x0 + pw + 16}" y="${y0 + ph / 2 + 4}" text-anchor="end" style="font-size:10px;font-weight:700;fill:var(--fg)">${p.d} م</text>
      <text x="${x0 + pw / 2}" y="${y0 + ph / 2 + 5}" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--navy);font-family:var(--font-display);paint-order:stroke;stroke:var(--surface-2);stroke-width:3px">${fmt(p.w * p.d)} م²</text>
      <g transform="translate(${W - 26} 30)"><circle r="16" style="fill:var(--surface);stroke:var(--line-strong)"/><path d="M0-10 5 7 0 3-5 7z" style="fill:var(--brand-solid)"/><text y="-20" text-anchor="middle" style="font-size:10px;font-weight:700;fill:var(--fg)">ش</text></g>
    </svg>`;
  }

  /* ---------- page ---------- */
  Pages.map = {
    shell: 'app', title: 'تحليل موقع',
    render() {
      const coords = state.mapMode === 'coords';
      return `<div class="map-page" id="map-page">
        <div class="map-canvas" id="map-canvas"><svg id="map-svg" role="application" aria-label="خريطة تفاعلية لاختيار قطعة الأرض"></svg></div>

        <div class="map-ui map-top">
          <div style="display:grid;gap:0;width:min(420px,100%)">
            <div class="map-search input-wrap">${ic('search')}<input class="input" id="m-q" placeholder="ابحث عن حي أو شارع أو رقم قطعة" autocomplete="off" aria-label="بحث على الخريطة"></div>
            <div class="glass coord-form" id="coord-form" ${coords ? '' : 'hidden'}>
              <div class="field"><label for="c-lat">خط العرض</label><input class="input mono" id="c-lat" value="24.8187" inputmode="decimal"></div>
              <div class="field"><label for="c-lng">خط الطول</label><input class="input mono" id="c-lng" value="46.6152" inputmode="decimal"></div>
              <button class="btn btn-primary" type="button" id="c-go">انتقل</button>
            </div>
          </div>
          <div class="segmented glass mode-toggle" role="group" aria-label="طريقة التحديد" style="padding:3px">
            <button type="button" data-mm="click" aria-pressed="${!coords}">${ic('target')}النقر على الخريطة</button>
            <button type="button" data-mm="coords" aria-pressed="${coords}">${ic('hash')}الإحداثيات</button>
          </div>
          <div class="glass steps-mini" aria-label="مراحل التحليل"><span class="on"><span class="dot">1</span>اختيار الموقع</span><span class="sep"></span><span><span class="dot">2</span>التحليل</span><span class="sep"></span><span><span class="dot">3</span>النتائج</span></div>
        </div>

        <div class="map-ui map-controls">
          <div class="glass ctrl-group"><button type="button" id="z-in" aria-label="تكبير">${ic('plus')}</button><button type="button" id="z-out" aria-label="تصغير">${ic('minus')}</button></div>
          <div class="glass ctrl-group">
            <button type="button" id="b-loc" aria-label="موقعي الحالي">${ic('locate')}</button>
            <button type="button" id="b-north" class="compass-btn" aria-label="إعادة ضبط العرض والاتجاه">${ic('north')}</button>
            <button type="button" id="b-layers" aria-label="طبقات الخريطة" aria-pressed="false">${ic('layers')}</button>
          </div>
        </div>
        <div class="glass layers-panel" id="layers-panel" hidden>
          <h4>نوع الخريطة</h4>
          <div class="basemaps">
            <button type="button" data-base="map" aria-pressed="true"><span class="sw" style="background:linear-gradient(135deg,var(--map-block) 50%,var(--map-road) 50%)"></span>خريطة</button>
            <button type="button" data-base="sat" aria-pressed="false"><span class="sw" style="background:linear-gradient(135deg,#a89b80 50%,#6f8a59 50%)"></span>قمر صناعي</button>
            <button type="button" data-base="plan" aria-pressed="false"><span class="sw" style="background:var(--brand-solid);background-image:linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px);background-size:8px 8px"></span>مخطط</button>
          </div>
          <h4>الطبقات</h4>
          ${[['parcels', 'area', 'حدود القطع', true], ['districts', 'map', 'حدود الأحياء', true], ['labels', 'road', 'أسماء الشوارع', true], ['heat', 'thermo', 'الحرارة السطحية', false]].map(l => `<div class="layer-row"><span>${ic(l[1])}${l[2]}</span><label class="switch"><input type="checkbox" data-layer="${l[0]}" ${l[3] ? 'checked' : ''} aria-label="${l[2]}"></label></div>`).join('')}
          <div id="heat-legend" hidden><div style="height:8px;border-radius:4px;background:linear-gradient(270deg,var(--heat),var(--comfort),var(--cold))"></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px"><span>أكثر حرارة</span><span>أبرد</span></div></div>
        </div>

        <div class="glass map-hint" id="map-hint">${ic('pin')}انقر على قطعة أرض لتحديدها وعرض بياناتها</div>
        <div class="glass map-scale"><span class="bar"></span><span id="scale-lbl">50 m</span></div>
        <div id="panel-slot"></div>
      </div>`;
    },
    mount(root) {
      if (!PARCELS) PARCELS = buildParcels();
      const page = root.querySelector('#map-page');
      const canvas = root.querySelector('#map-canvas');
      const svg = root.querySelector('#map-svg');
      svg.innerHTML = mapSVG();
      const selLayer = svg.querySelector('#sel-layer');
      const locLayer = svg.querySelector('#loc-layer');
      let view = { x: 0, y: 0, w: 760, h: 500 };
      let selected = null;

      function fit(center, width) {
        const r = canvas.getBoundingClientRect();
        const aspect = r.height / Math.max(r.width, 1);
        const w = Math.max(160, Math.min(1800, width || view.w));
        view = { w, h: w * aspect, x: center.x - w / 2, y: center.y - (w * aspect) / 2 };
      }
      function apply() {
        if (!svg.isConnected) return;
        svg.setAttribute('viewBox', `${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}`);
        const r = canvas.getBoundingClientRect();
        const mPer60 = 60 * view.w / Math.max(r.width, 1);
        const nice = [10, 20, 25, 50, 100, 200, 250, 500].find(n => n >= mPer60 * .6) || 500;
        root.querySelector('.map-scale .bar').style.width = (nice / view.w * r.width).toFixed(0) + 'px';
        root.querySelector('#scale-lbl').textContent = nice + ' m';
      }
      function flyTo(center, width, ms = 650) {
        const from = { ...view };
        const r = canvas.getBoundingClientRect(); const aspect = r.height / Math.max(r.width, 1);
        const tw = width || view.w, th = tw * aspect;
        const to = { w: tw, h: th, x: center.x - tw / 2, y: center.y - th / 2 };
        const t0 = performance.now();
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const step = now => {
          const t = reduce ? 1 : Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3);
          view = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e };
          apply(); if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
      const initial = state.selectedParcel ? parcelById(state.selectedParcel) : null;
      const isMobile = innerWidth < 760;
      fit(initial ? { x: initial.x + initial.w / 2 + (isMobile ? 0 : 60), y: initial.y + 25 + (isMobile ? 60 : 0) } : { x: 560, y: 520 }, isMobile ? 520 : 1150);
      apply();
      const ro = new ResizeObserver(() => { fit({ x: view.x + view.w / 2, y: view.y + view.h / 2 }, view.w); apply(); });
      ro.observe(canvas);

      /* select */
      function select(p, opts = {}) {
        svg.querySelectorAll('.parcel.selected').forEach(el => el.classList.remove('selected'));
        if (!p) { selected = null; selLayer.innerHTML = ''; root.querySelector('#panel-slot').innerHTML = ''; root.querySelector('#map-hint').hidden = false; return; }
        selected = p; state.selectedParcel = p.id;
        svg.querySelector(`.parcel[data-p="${p.id}"]`).classList.add('selected');
        selLayer.innerHTML = selectionSVG(p);
        root.querySelector('#map-hint').hidden = true;
        renderPanel(p);
        focusParcel(p, opts.fly ? Math.min(view.w, innerWidth < 760 ? 420 : 700) : view.w);
      }
      function focusParcel(p, width) {
        // keep the parcel clear of the info panel (left side in RTL, bottom sheet on phones)
        const r = canvas.getBoundingClientRect(); const k = width / Math.max(r.width, 1);
        const mobile = innerWidth < 760;
        const cx = p.x + p.w / 2 - (mobile ? 0 : 205 * k), cy = p.y + p.d / 2 + (mobile ? r.height * .26 * k : 0);
        flyTo({ x: cx, y: cy }, width, 500);
      }
      function renderPanel(p) {
        const g = geo(p);
        root.querySelector('#panel-slot').innerHTML = `<aside class="glass parcel-panel" aria-label="بيانات القطعة المحددة">
          <div class="pp-head"><div style="min-width:0"><span class="eyebrow">الموقع المحدد</span><h3 style="margin-top:4px">قطعة ${p.id} · مخطط ${p.plan}</h3><p>${ic('pin')}${p.district}، الرياض</p></div>
            <button class="close-x" type="button" data-pp-close aria-label="إلغاء التحديد">${ic('x')}</button></div>
          <div class="pp-body">
            <div class="pp-diagram">${parcelDiagram(p)}</div>
            <dl class="kv" style="margin:0">
              <div><dt>${ic('area')}مساحة الأرض</dt><dd class="num">${fmt(p.w * p.d)} م²</dd></div>
              <div><dt>${ic('ruler')}الأبعاد</dt><dd class="num">${p.w} × ${p.d} م</dd></div>
              <div class="wide"><dt>${ic('locate')}الإحداثيات</dt><dd><span class="mono">${g.lat}° N, ${g.lng}° E</span></dd></div>
              <div><dt>${ic('map')}المنطقة</dt><dd>${p.district}</dd></div>
              <div><dt>${ic('compass')}اتجاه الشمال</dt><dd>الواجهة ${p.facing}</dd></div>
              <div><dt>${ic('road')}الشوارع</dt><dd>${p.corner ? 'زاوية · 20 م و15 م' : 'شارع 20 م'}</dd></div>
              <div><dt>${ic('house')}الاستخدام</dt><dd>${p.east ? 'سكني تجاري' : 'سكني — فلل'}</dd></div>
            </dl>
            ${p.built ? `<div class="callout callout-info">${ic('info')}<div><b>قطعة مبنية</b><p>سيُحلَّل الموقع مع اعتبار المبنى القائم جزءًا من السياق.</p></div></div>` : `<div class="callout callout-good">${ic('checkCircle')}<div><b>أرض فضاء جاهزة للتحليل</b><p>لا توجد عوائق بنائية داخل حدود القطعة.</p></div></div>`}
          </div>
          <div class="pp-foot">
            <button class="btn btn-primary btn-lg btn-block" type="button" id="start-analysis">${ic('gauge')}ابدأ التحليل</button>
            <span class="proto-note">${ic('clock')}يستغرق التحليل أقل من دقيقة · محاكاة</span>
          </div>
        </aside>`;
        root.querySelector('[data-pp-close]').onclick = () => select(null);
        root.querySelector('#start-analysis').onclick = () => startAnalysis(p);
      }
      function startAnalysis(p) {
        let a = M.analyses.find(x => x.parcel === p.id && !state.deleted.has(x.id));
        if (!a) {
          const r = rng(+p.id);
          a = { id: 'n' + p.id, parcel: p.id, plan: p.plan, district: p.district, city: 'الرياض', area: p.w * p.d, dims: `${p.w} × ${p.d} م`, score: 68 + Math.round(r() * 20), date: new Date().toISOString().slice(0, 10), status: 'done', seed: (+p.id % 17) + 1, facing: p.facing, corner: p.corner };
          M.analyses.unshift(a);
        } else {
          a.date = new Date().toISOString().slice(0, 10);
        }
        state.currentId = a.id; persist();
        location.hash = '#analyzing';
      }

      /* pan / zoom */
      let drag = null;
      canvas.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false, target: e.target };
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 5) return;
        drag.moved = true; canvas.classList.add('dragging');
        const r = canvas.getBoundingClientRect(); const k = view.w / r.width;
        view.x = drag.vx - dx * k; view.y = drag.vy - dy * k; apply();
      });
      const end = e => {
        if (!drag) return;
        canvas.classList.remove('dragging');
        if (!drag.moved) {
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const t = el && el.closest && el.closest('.parcel');
          if (t) select(parcelById(t.dataset.p));
        }
        drag = null;
      };
      canvas.addEventListener('pointerup', end);
      canvas.addEventListener('pointercancel', () => { drag = null; canvas.classList.remove('dragging'); });
      function zoomAt(f, cx, cy) {
        const r = canvas.getBoundingClientRect();
        const px = cx == null ? .5 : (cx - r.left) / r.width, py = cy == null ? .5 : (cy - r.top) / r.height;
        const nw = Math.max(160, Math.min(1800, view.w * f)); const nh = nw * view.h / view.w;
        view.x += (view.w - nw) * px; view.y += (view.h - nh) * py; view.w = nw; view.h = nh; apply();
      }
      canvas.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY > 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY); }, { passive: false });
      root.querySelector('#z-in').onclick = () => flyTo({ x: view.x + view.w / 2, y: view.y + view.h / 2 }, view.w / 1.5, 300);
      root.querySelector('#z-out').onclick = () => flyTo({ x: view.x + view.w / 2, y: view.y + view.h / 2 }, view.w * 1.5, 300);
      root.querySelector('#b-north').onclick = () => flyTo({ x: 560, y: 520 }, innerWidth < 760 ? 520 : 1150);
      root.querySelector('#b-loc').onclick = () => {
        const pt = { x: 455, y: 420 };
        locLayer.innerHTML = `<g transform="translate(${pt.x} ${pt.y})"><circle r="10" class="pulse-ring" style="fill:var(--wind)"/><circle r="7" style="fill:var(--wind);stroke:#fff" stroke-width="2.5"/></g>`;
        flyTo(pt, 520); toast('تم تحديد موقعك التقريبي (محاكاة)', { icon: 'locate' });
      };

      /* layers */
      const lp = root.querySelector('#layers-panel'), lb = root.querySelector('#b-layers');
      lb.onclick = () => { lp.hidden = !lp.hidden; lb.setAttribute('aria-pressed', String(!lp.hidden)); };
      root.querySelectorAll('[data-base]').forEach(b => b.onclick = () => {
        root.querySelectorAll('[data-base]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        canvas.classList.toggle('sat', b.dataset.base === 'sat');
        canvas.classList.toggle('plan', b.dataset.base === 'plan');
      });
      root.querySelectorAll('[data-layer]').forEach(c => c.onchange = () => {
        const l = c.dataset.layer;
        if (l === 'heat') { canvas.classList.toggle('show-heat', c.checked); root.querySelector('#heat-legend').hidden = !c.checked; }
        else canvas.classList.toggle('hide-' + l, !c.checked);
      });

      /* search */
      const q = root.querySelector('#m-q');
      const wrap = q.parentElement;
      const showSuggest = () => {
        const v = q.value.trim();
        const items = M.searchIndex.filter(s => !v || s.label.includes(v) || s.sub.includes(v));
        let box = wrap.querySelector('.suggest');
        if (!box) { box = document.createElement('div'); box.className = 'glass suggest'; wrap.appendChild(box); }
        box.innerHTML = items.length ? items.map((s, i) => `<button type="button" data-si="${M.searchIndex.indexOf(s)}">${ic(s.type === 'parcel' ? 'area' : s.type === 'street' ? 'road' : 'map')}<span>${s.label}<small>${s.sub}</small></span></button>`).join('') : `<p class="muted" style="padding:10px;font-size:var(--fs-sm)">لا توجد نتائج. جرّب اسم حي أو رقم قطعة.</p>`;
        box.querySelectorAll('[data-si]').forEach(b => b.onclick = () => {
          const s = M.searchIndex[+b.dataset.si]; q.value = s.label; box.remove();
          if (s.type === 'parcel') select(parcelById(s.parcel), { fly: true });
          else if (s.label === 'حي حطين') flyTo({ x: 1420, y: 600 }, 900);
          else if (s.type === 'street') flyTo({ x: 640, y: 120 }, 900);
          else flyTo({ x: 520, y: 520 }, 1000);
        });
      };
      q.addEventListener('focus', showSuggest);
      q.addEventListener('input', showSuggest);
      document.addEventListener('pointerdown', this._outside = e => { if (!e.target.closest('.map-search')) { const b = wrap.querySelector('.suggest'); b && b.remove(); } });

      /* coordinates mode */
      root.querySelectorAll('[data-mm]').forEach(b => b.onclick = () => {
        state.mapMode = b.dataset.mm;
        root.querySelectorAll('[data-mm]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        root.querySelector('#coord-form').hidden = b.dataset.mm !== 'coords';
      });
      root.querySelector('#c-go').onclick = () => {
        const lat = parseFloat(root.querySelector('#c-lat').value), lng = parseFloat(root.querySelector('#c-lng').value);
        if (isNaN(lat) || isNaN(lng)) { toast('أدخل الإحداثيات بصيغة عشرية، مثل 24.8187', { icon: 'alert' }); return; }
        const x = SEL_ORIGIN.x + (lng - 46.6152) / 0.0000099, y = SEL_ORIGIN.y - (lat - 24.8187) / 0.000009;
        const hit = PARCELS.find(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.d);
        if (hit) { select(hit, { fly: true }); toast(`تم العثور على قطعة ${hit.id} عند الإحداثيات`, { icon: 'locate' }); }
        else { flyTo({ x, y }, 600); toast('لا توجد قطعة عند هذه النقطة؛ انقر على أقرب قطعة', { icon: 'info' }); }
      };

      if (initial) select(initial, { fly: true });
      this.unmount = () => { ro.disconnect(); document.removeEventListener('pointerdown', this._outside); };
    },
  };
})();
