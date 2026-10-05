/* Hand-built SVG charts. Every mark is placed by one scale; text uses theme tokens. */
(function () {
  const M = window.MOCK;
  const C = window.Charts = {};

  /* Shared hover tooltip: any element with data-tip inside `host` shows its text. */
  C.tips = function (host) {
    let tip = host.querySelector(':scope > .tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; host.appendChild(tip); }
    const show = e => {
      const t = e.target.closest('[data-tip]'); if (!t || !host.contains(t)) { tip.hidden = true; return; }
      tip.innerHTML = t.dataset.tip; tip.hidden = false;
      const r = host.getBoundingClientRect();
      let x = e.clientX - r.left; const y = e.clientY - r.top;
      x = Math.max(70, Math.min(r.width - 70, x));
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
      host.querySelectorAll('.is-hover').forEach(el => el.classList.remove('is-hover'));
      t.classList.add('is-hover');
    };
    host.addEventListener('pointermove', show);
    host.addEventListener('pointerleave', () => { tip.hidden = true; host.querySelectorAll('.is-hover').forEach(el => el.classList.remove('is-hover')); });
  };

  /* ---------------- Sun path (stereographic-like polar plot) ---------------- */
  C.sunPath = function () {
    const S = 340, cx = S / 2, cy = S / 2, R = 140;
    const pt = (alt, az) => { const r = R * (90 - alt) / 90; return [cx + r * Math.sin(az * Math.PI / 180), cy - r * Math.cos(az * Math.PI / 180)]; };
    let s = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="مخطط مسار الشمس للموقع">`;
    // high exposure sector: west, afternoon
    const a1 = pt(0, 235), a2 = pt(0, 305);
    s += `<path d="M${cx} ${cy}L${a1[0].toFixed(1)} ${a1[1].toFixed(1)}A${R} ${R} 0 0 1 ${a2[0].toFixed(1)} ${a2[1].toFixed(1)}Z" style="fill:var(--heat);opacity:.1"/>`;
    // rings
    [0, 30, 60].forEach(alt => { s += `<circle cx="${cx}" cy="${cy}" r="${R * (90 - alt) / 90}" fill="none" class="${alt ? 'gridl' : 'axis'}"/>`; });
    for (let az = 0; az < 360; az += 30) { const p = pt(0, az); s += `<path d="M${cx} ${cy}L${p[0].toFixed(1)} ${p[1].toFixed(1)}" class="gridl"/>`; }
    s += `<text x="${cx + 4}" y="${cy - R * 60 / 90 + 12}">30°</text><text x="${cx + 4}" y="${cy - R * 30 / 90 + 12}">60°</text>`;
    // cardinal labels
    [['ش', 0], ['ق', 90], ['ج', 180], ['غ', 270]].forEach(([l, az]) => { const p = pt(-14, az); s += `<text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" style="font-weight:700;fill:var(--fg);font-size:13px">${l}</text>`; });
    // parcel footprint (25 × 50 m, north up)
    s += `<rect x="${cx - 9}" y="${cy - 18}" width="18" height="36" style="fill:var(--ochre);fill-opacity:.3;stroke:var(--brand-solid)" stroke-width="1.5"/>`;
    // arcs
    const days = [{ doy: 172, name: '21 يونيو', op: 1, dash: '' }, { doy: 80, name: 'الاعتدالان', op: .75, dash: '5 4' }, { doy: 355, name: '21 ديسمبر', op: .55, dash: '1 4' }];
    days.forEach(d => {
      const pts = [];
      for (let h = 4; h <= 20; h += .1) { const p = M.sunPos(d.doy, h); if (p.alt >= 0) pts.push(pt(p.alt, p.az)); }
      s += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${d.dash}" style="stroke:var(--sun);opacity:${d.op}"/>`;
      for (let h = 6; h <= 18; h++) {
        const p = M.sunPos(d.doy, h); if (p.alt < 0) continue;
        const q = pt(p.alt, p.az);
        s += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${h % 3 === 0 ? 4 : 2.6}" style="fill:var(--sun);stroke:var(--surface)" stroke-width="1.5" opacity="${d.op}"/>`;
        s += `<circle class="hit" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="9" data-tip="<b>${d.name} · ${String(h).padStart(2, '0')}:00</b><br>ارتفاع ${Math.round(p.alt)}° · سمت ${Math.round(p.az)}°"/>`;
      }
      // direct label at solar noon
      const n = M.sunPos(d.doy, 11), q = pt(n.alt, n.az);
      s += `<text x="${q[0] + 6}" y="${q[1] + (d.doy === 172 ? -10 : 16)}" text-anchor="middle" style="font-weight:600;fill:var(--fg-2);paint-order:stroke;stroke:var(--surface);stroke-width:3px">${d.name}</text>`;
    });
    // hour labels on summer arc
    [6, 9, 15, 18].forEach(h => { const p = M.sunPos(172, h); const q = pt(p.alt, p.az); s += `<text x="${q[0]}" y="${q[1] - 8}" text-anchor="middle" style="font-size:10px">${h}:00</text>`; });
    const w = pt(10, 270);
    s += `<text x="${w[0] + 14}" y="${w[1] + 40}" style="fill:var(--heat);font-weight:700;font-size:10px">تعرض مرتفع بعد الظهر</text>`;
    s += `</svg>`;
    return s;
  };

  /* ---------------- Monthly radiation bars ---------------- */
  C.radiationBars = function () {
    const W = 560, H = 220, l = 34, r = 10, t = 16, b = 28;
    const iw = W - l - r, ih = H - t - b, max = 8;
    const y = v => t + ih - (v / max) * ih;
    const bw = iw / 12;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="الإشعاع الشمسي الشهري" direction="ltr">`;
    [0, 2, 4, 6, 8].forEach(v => { s += `<path d="M${l} ${y(v)}H${W - r}" class="${v ? 'gridl' : 'axis'}"/><text x="${l - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
    const peak = M.climate.ghi.indexOf(Math.max(...M.climate.ghi));
    M.climate.ghi.forEach((v, i) => {
      const x = l + i * bw + 4, h = (v / max) * ih;
      s += `<path d="M${x} ${y(0)}V${y(v) + 4}a4 4 0 0 1 4 -4h${bw - 16}a4 4 0 0 1 4 4V${y(0)}Z" style="fill:var(--sun);opacity:${i === peak ? 1 : .55}"/>`;
      s += `<rect class="hit" x="${l + i * bw}" y="${t}" width="${bw}" height="${ih}" data-tip="<b>${M.MONTHS[i]}</b><br>${v.toFixed(1)} ك.و.س/م² يوميًا"/>`;
      s += `<text x="${x + (bw - 8) / 2}" y="${H - 8}" text-anchor="middle" style="font-size:10px">${M.MONTHS[i]}</text>`;
    });
    const px = l + peak * bw + 4 + (bw - 8) / 2;
    s += `<text x="${px}" y="${y(M.climate.ghi[peak]) - 6}" text-anchor="middle" style="font-weight:700;fill:var(--fg)">${M.climate.ghi[peak]}</text>`;
    s += `</svg>`;
    return s;
  };

  /* ---------------- Orientation compass ---------------- */
  C.orientation = function () {
    const S = 220, c = S / 2;
    return `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="التوجيه الموصى به">
      <circle cx="${c}" cy="${c}" r="92" fill="none" class="axis"/>
      <circle cx="${c}" cy="${c}" r="62" fill="none" class="gridl" stroke-dasharray="3 4"/>
      <path d="M${c} ${c}L${c + 92 * Math.sin(-15 * Math.PI / 180)} ${c - 92 * Math.cos(-15 * Math.PI / 180)}A92 92 0 0 1 ${c + 92 * Math.sin(15 * Math.PI / 180)} ${c - 92 * Math.cos(15 * Math.PI / 180)}Z" style="fill:var(--good);opacity:.16"/>
      <rect x="${c - 52}" y="${c - 22}" width="104" height="44" rx="3" style="fill:var(--brand-solid);opacity:.9"/>
      <rect x="${c - 52}" y="${c - 22}" width="104" height="10" style="fill:var(--good)"/>
      <text x="${c}" y="${c + 10}" text-anchor="middle" style="fill:#fff;font-weight:600;font-size:11px">محور شرق – غرب</text>
      <path d="M${c} ${c - 26}V${c - 74}" stroke-width="2.5" style="stroke:var(--good)" marker-end="url(#or-ar)"/>
      <defs><marker id="or-ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" style="fill:var(--good)"/></marker></defs>
      <text x="${c}" y="12" text-anchor="middle" style="font-weight:700;fill:var(--fg);font-size:13px">ش</text>
      <text x="${c}" y="${S - 2}" text-anchor="middle" style="font-weight:700;font-size:12px">ج</text>
      <text x="${S - 6}" y="${c + 4}" text-anchor="end" style="font-weight:700;font-size:12px">ق</text>
      <text x="6" y="${c + 4}" style="font-weight:700;font-size:12px">غ</text>
      <text x="${c + 34}" y="${c - 66}" style="fill:var(--good);font-weight:600;font-size:10px">±15°</text>
    </svg>`;
  };

  /* ---------------- Wind rose ---------------- */
  const WIND_STEPS = [.28, .5, .75, 1];
  C.windRose = function (season = 'annual') {
    const data = M.wind[season];
    const S = 360, c = S / 2, R = 140;
    const totals = data.map(d => d.reduce((a, b) => a + b, 0));
    const maxT = Math.ceil(Math.max(...totals) / 5) * 5;
    const rr = v => (v / maxT) * R;
    let s = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="وردة الرياح">`;
    for (let v = 5; v <= maxT; v += 5) s += `<circle cx="${c}" cy="${c}" r="${rr(v)}" fill="none" class="${v === maxT ? 'axis' : 'gridl'}"/><text x="${c + 3}" y="${c - rr(v) + 11}" style="font-size:9.5px">${v}%</text>`;
    for (let i = 0; i < 16; i++) { const a = i * 22.5 * Math.PI / 180; s += `<path d="M${c} ${c}L${c + R * Math.sin(a)} ${c - R * Math.cos(a)}" class="gridl"/>`; }
    const half = 22.5 / 2 * .78;
    data.forEach((bins, i) => {
      let acc = 0;
      const az = i * 22.5;
      bins.forEach((v, k) => {
        const r0 = rr(acc), r1 = rr(acc + v) - (k < 3 ? 1 : 0); acc += v;
        if (r1 <= r0) return;
        const a0 = (az - half) * Math.PI / 180, a1 = (az + half) * Math.PI / 180;
        const P = (r, a) => `${(c + r * Math.sin(a)).toFixed(1)} ${(c - r * Math.cos(a)).toFixed(1)}`;
        s += `<path d="M${P(r0, a0)}L${P(r1, a0)}A${r1} ${r1} 0 0 1 ${P(r1, a1)}L${P(r0, a1)}A${r0} ${r0} 0 0 0 ${P(r0, a0)}Z" style="fill:var(--wind);opacity:${WIND_STEPS[k]}"/>`;
      });
      const a0 = (az - 11.25) * Math.PI / 180, a1 = (az + 11.25) * Math.PI / 180, rH = R;
      const tip = `<b>${M.DIRS_FULL[i]}</b><br>${totals[i].toFixed(1)}% من الوقت<br>فوق 6 م/ث: ${bins[3].toFixed(1)}%`;
      s += `<path class="hit" d="M${c} ${c}L${c + rH * Math.sin(a0)} ${c - rH * Math.cos(a0)}A${rH} ${rH} 0 0 1 ${c + rH * Math.sin(a1)} ${c - rH * Math.cos(a1)}Z" data-tip="${tip}"/>`;
    });
    [['ش', 0], ['ق', 90], ['ج', 180], ['غ', 270]].forEach(([l, az]) => { const a = az * Math.PI / 180; s += `<text x="${c + (R + 14) * Math.sin(a)}" y="${c - (R + 14) * Math.cos(a) + 4}" text-anchor="middle" style="font-weight:700;fill:var(--fg);font-size:13px">${l}</text>`; });
    const dom = totals.indexOf(Math.max(...totals));
    const da = dom * 22.5 * Math.PI / 180;
    s += `<text x="${c + (rr(totals[dom]) + 8) * Math.sin(da) - 4}" y="${c - (rr(totals[dom]) + 8) * Math.cos(da)}" text-anchor="end" style="font-weight:700;fill:var(--fg)">${totals[dom].toFixed(1)}%</text>`;
    s += `</svg>`;
    return { svg: s, dom, totals, calm: Math.max(0, 100 - totals.reduce((a, b) => a + b, 0)) };
  };
  C.windLegend = () => `<div class="legend">${M.windBins.map((b, k) => `<span><i style="background:var(--wind);opacity:${WIND_STEPS[k]}"></i>${b} م/ث</span>`).join('')}</div>`;

  /* ---------------- Temperature range ---------------- */
  C.tempRange = function () {
    const W = 560, H = 240, l = 34, r = 10, t = 14, b = 28;
    const iw = W - l - r, ih = H - t - b, min = 0, max = 50;
    const y = v => t + ih - ((v - min) / (max - min)) * ih;
    const bw = iw / 12;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="نطاق درجات الحرارة الشهري" direction="ltr">`;
    s += `<rect x="${l}" y="${y(27)}" width="${iw}" height="${y(21) - y(27)}" style="fill:var(--good);opacity:.12"/>`;
    s += `<text x="${l + 6}" y="${y(27) - 5}" text-anchor="end" direction="rtl" style="fill:var(--good);font-weight:600">نطاق الراحة 21–27°</text>`;
    [0, 10, 20, 30, 40, 50].forEach(v => { s += `<path d="M${l} ${y(v)}H${W - r}" class="${v ? 'gridl' : 'axis'}"/><text x="${l - 6}" y="${y(v) + 4}" text-anchor="end">${v}°</text>`; });
    M.climate.tmax.forEach((hi, i) => {
      const lo = M.climate.tmin[i], cx = l + i * bw + bw / 2;
      s += `<path d="M${cx} ${y(lo)}V${y(hi)}" stroke-width="10" stroke-linecap="round" style="stroke:var(--heat);opacity:${.35 + (hi - 20) / 24 * .65}"/>`;
      s += `<circle cx="${cx}" cy="${y((hi + lo) / 2)}" r="3" style="fill:var(--surface);stroke:var(--heat)" stroke-width="1.5"/>`;
      s += `<rect class="hit" x="${l + i * bw}" y="${t}" width="${bw}" height="${ih}" data-tip="<b>${M.MONTHS[i]}</b><br>العظمى ${hi}° · الصغرى ${lo}°"/>`;
      s += `<text x="${cx}" y="${H - 8}" text-anchor="middle" style="font-size:10px">${M.MONTHS[i]}</text>`;
    });
    const pk = M.climate.tmax.indexOf(Math.max(...M.climate.tmax));
    s += `<text x="${l + pk * bw + bw / 2}" y="${y(M.climate.tmax[pk]) - 9}" text-anchor="middle" style="font-weight:700;fill:var(--fg)">${M.climate.tmax[pk]}°</text>`;
    s += `</svg>`;
    return s;
  };

  /* ---------------- Thermal calendar (month × hour) ---------------- */
  const BAND_STYLE = {
    cold: 'fill:var(--cold);fill-opacity:.85', cool: 'fill:var(--cold);fill-opacity:.4', comfort: 'fill:var(--comfort);fill-opacity:1',
    warm: 'fill:var(--heat);fill-opacity:.3', hot: 'fill:var(--heat);fill-opacity:.62', vhot: 'fill:var(--heat);fill-opacity:1',
  };
  C.thermalCalendar = function () {
    const cw = 40, ch = 26, l = 64, t = 6, gap = 3;
    const W = l + 24 * cw + 4, H = t + 12 * ch + 26;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="التقويم الحراري" direction="ltr">`;
    for (let m = 0; m < 12; m++) {
      s += `<text x="${l - 8}" y="${t + m * ch + ch / 2 + 4}" text-anchor="end" style="font-size:13px">${M.MONTHS[m]}</text>`;
      for (let h = 0; h < 24; h++) {
        const T = M.hourTemp(m, h), bd = M.band(T);
        s += `<rect x="${l + h * cw + gap / 2}" y="${t + m * ch + gap / 2}" width="${cw - gap}" height="${ch - gap}" rx="2" style="${BAND_STYLE[bd.key]}" data-tip="<b>${M.MONTHS[m]} · ${String(h).padStart(2, '0')}:00</b><br>${T.toFixed(1)}°م · ${bd.name}"/>`;
      }
    }
    [0, 3, 6, 9, 12, 15, 18, 21].forEach(h => { s += `<text x="${l + h * cw + cw / 2}" y="${H - 6}" text-anchor="middle" style="font-size:13px">${String(h).padStart(2, '0')}:00</text>`; });
    s += `</svg>`;
    return s;
  };
  C.thermalLegend = () => `<div class="legend">${M.thermalBands.map(b => `<span><i style="${BAND_STYLE[b.key].replace(/fill-opacity/g, 'opacity').replace(/fill:/g, 'background:')}${b.key === 'comfort' ? ';outline:1px solid var(--line-strong)' : ''}"></i>${b.name}</span>`).join('')}</div>`;

  /* ---------------- Context map (radius rings) ---------------- */
  C.contextMap = function () {
    const S = 320, c = S / 2, k = 0.26; // px per metre
    const poi = (dx, dy, icon, label, color) => `<g transform="translate(${c + dx * k} ${c + dy * k})"><circle r="11" style="fill:var(--surface);stroke:${color}" stroke-width="2"/><text y="4" text-anchor="middle" style="font-size:10px;font-weight:700;fill:${color}">${icon}</text><text y="24" text-anchor="middle" style="font-size:10px;font-weight:600;fill:var(--fg-2)">${label}</text></g>`;
    return `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="البيئة المحيطة ضمن نطاق 500 م">
      <rect width="${S}" height="${S}" rx="12" style="fill:var(--map-ground)"/>
      <rect x="0" y="${c - 480 * k - 8}" width="${S}" height="16" style="fill:var(--map-artery);stroke:var(--map-artery-edge)"/>
      <rect x="${c - 80 * k}" y="${c + 120 * k}" width="${250 * k}" height="${220 * k}" rx="4" style="fill:var(--map-park)"/>
      ${[250, 500].map(r => `<circle cx="${c}" cy="${c}" r="${r * k}" fill="none" stroke-dasharray="4 4" style="stroke:var(--ctx);opacity:.6"/><text x="${c + r * k * .7 + 4}" y="${c - r * k * .7}" style="font-size:10px;fill:var(--ctx);font-weight:600">${r} م</text>`).join('')}
      ${poi(-10, 230, 'ح', 'حديقة', 'var(--veg)')}
      ${poi(-260, -40, 'م', 'مسجد', 'var(--ctx)')}
      ${poi(300, 360, 'د', 'مدرسة', 'var(--ctx)')}
      <text x="${c}" y="${c - 480 * k + 4}" text-anchor="middle" style="font-size:10px;font-weight:600;fill:var(--muted)">طريق أنس بن مالك</text>
      <rect x="${c - 4}" y="${c - 8}" width="8" height="16" style="fill:var(--ochre);stroke:var(--brand-solid)" stroke-width="1.5"/>
      <g transform="translate(${S - 24} 24)"><path d="M0-10 5 7 0 3-5 7z" style="fill:var(--fg)"/><text y="-13" text-anchor="middle" style="font-size:10px;font-weight:700;fill:var(--fg)">ش</text></g>
    </svg>`;
  };

  /* ---------------- Façade key plan ---------------- */
  C.facadeKey = function (f) {
    const on = k => k === f ? 'var(--ochre)' : 'var(--line-strong)';
    const w = k => k === f ? 5 : 2;
    return `<svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true">
      <rect x="35" y="15" width="50" height="90" style="fill:var(--surface-2)"/>
      <path d="M35 15H85" stroke-width="${w('N')}" style="stroke:${on('N')}"/><path d="M85 15V105" stroke-width="${w('E')}" style="stroke:${on('E')}"/>
      <path d="M35 105H85" stroke-width="${w('S')}" style="stroke:${on('S')}"/><path d="M35 15V105" stroke-width="${w('W')}" style="stroke:${on('W')}"/>
      <text x="60" y="10" text-anchor="middle" style="font-size:10px;font-weight:700;fill:var(--fg)">ش</text>
      <text x="60" y="118" text-anchor="middle" style="font-size:10px;fill:var(--muted)">ج</text>
      <text x="96" y="64" text-anchor="middle" style="font-size:10px;fill:var(--muted)">ق</text>
      <text x="24" y="64" text-anchor="middle" style="font-size:10px;fill:var(--muted)">غ</text>
    </svg>`;
  };

  /* ---------------- Recommendation glyphs ---------------- */
  C.recGlyph = function (kind) {
    const base = 'fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
    const g = {
      orient: `<rect x="14" y="22" width="36" height="20" rx="2" style="fill:var(--brand-solid);opacity:.85"/><path d="M32 18V6" ${base} style="stroke:var(--good)"/><path d="M27 10l5-5 5 5" ${base} style="stroke:var(--good)"/><text x="32" y="58" text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--muted)">ش ↑</text>`,
      shade: `<path d="M12 10v44" ${base} style="stroke:var(--fg-2)"/><path d="M12 14h22M12 26h18M12 38h14" ${base} style="stroke:var(--ochre)"/><circle cx="50" cy="12" r="6" style="fill:var(--sun)"/><path d="M45 17 30 32" ${base} stroke-dasharray="2 4" style="stroke:var(--sun)"/>`,
      vent: `<rect x="16" y="14" width="32" height="36" rx="2" ${base} style="stroke:var(--fg-2)"/><path d="M6 20c8 0 14 6 22 12s16 10 30 10" ${base} style="stroke:var(--wind)"/><path d="M52 38l6 4-6 4" ${base} style="stroke:var(--wind)"/>`,
      garden: `<rect x="10" y="10" width="44" height="44" rx="2" ${base} style="stroke:var(--fg-2)"/><rect x="10" y="10" width="44" height="22" style="fill:var(--brand-solid);opacity:.85"/><circle cx="24" cy="44" r="6" style="fill:var(--veg)"/><circle cx="40" cy="42" r="8" style="fill:var(--veg);opacity:.7"/>`,
      window: `<rect x="12" y="10" width="40" height="44" rx="2" ${base} style="stroke:var(--fg-2)"/><rect x="18" y="18" width="10" height="14" style="fill:var(--wind);opacity:.4"/><rect x="36" y="18" width="10" height="28" style="fill:var(--wind);opacity:.4"/><path d="M12 54h40" ${base} style="stroke:var(--heat)"/>`,
      dust: `<path d="M44 8v48" stroke-width="5" stroke-linecap="round" style="stroke:var(--veg)"/><path d="M6 18h18M10 28h22M6 38h16" ${base} stroke-dasharray="2 4" style="stroke:var(--ctx)"/><path d="M50 32h8" ${base} style="stroke:var(--wind)"/>`,
    }[kind];
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${g}</svg>`;
  };

  /* ---------------- Strategy section glyphs ---------------- */
  C.stratGlyph = function (kind) {
    const s = {
      overhang: '<path d="M8 6v28" stroke-width="2" style="stroke:var(--fg-2)"/><path d="M8 10h16" stroke-width="3" style="stroke:var(--ochre)"/><path d="M30 2 12 22" stroke-dasharray="2 3" stroke-width="1.5" style="stroke:var(--sun)"/>',
      fins: '<path d="M6 8h28" stroke-width="2" style="stroke:var(--fg-2)"/><path d="M10 8v20M18 8v20M26 8v20" stroke-width="3" style="stroke:var(--ochre)"/>',
      mashrabiya: '<rect x="6" y="6" width="28" height="28" fill="none" stroke-width="2" style="stroke:var(--fg-2)"/><path d="M6 13h28M6 20h28M6 27h28M13 6v28M20 6v28M27 6v28" stroke-width="1.2" style="stroke:var(--ochre)"/>',
    }[kind];
    return `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">${s}</svg>`;
  };
})();
