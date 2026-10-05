/* Public pages: landing, sign up, sign in, logout. */
(function () {
  const { brand, langSwitch, toast, patternSVG } = App;
  const Pages = window.Pages;

  /* ---------- Hero composition ---------- */
  function heroSVG() {
    let blocks = '';
    const bw = 150, bh = 92, st = 16;
    for (let y = -60; y < 640; y += bh + st) {
      for (let x = -80; x < 700; x += bw + st) {
        const isSelBlock = x === 252 && y === 264;
        const park = (x === -80 + 2 * (bw + st) && y === -60 + 4 * (bh + st));
        if (park) { blocks += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" style="fill:var(--map-park)"/>`; for (let k = 0; k < 9; k++) blocks += `<circle cx="${x + 18 + (k % 5) * 28}" cy="${y + 24 + Math.floor(k / 5) * 40}" r="7" style="fill:var(--veg);opacity:.5"/>`; continue; }
        blocks += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" style="fill:var(--map-block)"/>`;
        for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
          const px = x + i * 25, py = y + r * 46;
          if (isSelBlock && r === 0 && i === 2) continue;
          const built = ((i * 7 + r * 3 + x + y) % 5) < 3;
          blocks += `<rect x="${px + .6}" y="${py + .6}" width="23.8" height="44.8" style="fill:var(${built ? '--map-built' : '--map-parcel'});stroke:var(--map-road-edge);stroke-width:.6"/>`;
          if (built) blocks += `<rect x="${px + 4}" y="${py + 6}" width="16" height="${26 + (i % 3) * 4}" style="fill:var(--map-built);stroke:var(--line-strong);stroke-width:.6"/>`;
        }
      }
    }
    // selected parcel: x 302..352, y 264..310 (two merged parcels)
    return `<svg viewBox="0 0 600 560" aria-hidden="true">
      <defs>
        <radialGradient id="hg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(285 290) scale(120 150)"><stop offset="0" style="stop-color:var(--heat);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--heat);stop-opacity:0"/></radialGradient>
        <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" style="fill:var(--wind)"/></marker>
      </defs>
      <rect width="600" height="560" style="fill:var(--map-ground)"/>
      <g transform="rotate(-9 300 290)">
        ${blocks}
        <rect x="80" y="100" width="420" height="380" style="fill:url(#hg)"/>
        <rect x="302" y="264" width="25" height="46" style="fill:var(--ochre);fill-opacity:.32;stroke:var(--brand-solid);stroke-width:2.5"/>
        <rect x="298" y="260" width="33" height="54" class="sel-outline"/>
        <g style="stroke:var(--fg-2);stroke-width:1" fill="none"><path d="M302 324h25M302 320v8M327 320v8"/><path d="M340 264v46M336 264h8M336 310h8"/></g>
        <text x="314.5" y="340" text-anchor="middle" style="fill:var(--fg-2);font-size:11px;font-weight:600">25 م</text>
        <text x="356" y="291" text-anchor="middle" style="fill:var(--fg-2);font-size:11px;font-weight:600">50 م</text>
      </g>
      <!-- sun path projected on plan: arc swinging through the south -->
      <path d="M470 230 Q 300 520 120 260" fill="none" style="stroke:var(--sun)" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
      ${[0.15, 0.32, 0.5, 0.68, 0.85].map(t => { const x = (1 - t) * (1 - t) * 470 + 2 * (1 - t) * t * 300 + t * t * 120; const y = (1 - t) * (1 - t) * 230 + 2 * (1 - t) * t * 520 + t * t * 260; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" style="fill:var(--sun)"/>`; }).join('')}
      <g transform="translate(206 392)"><circle r="20" style="fill:var(--sun);opacity:.18"/><circle r="11" style="fill:var(--sun)"/></g>
      <!-- wind from the north-west -->
      ${[0, 1, 2, 3].map(i => `<path d="M${40 + i * 24} ${70 + i * 34} q 70 30 120 80 t 110 70" fill="none" class="wind-flow" style="stroke:var(--wind)" stroke-width="2" stroke-linecap="round" opacity="${.85 - i * .12}" ${i === 1 ? 'marker-end="url(#ah)"' : ''}/>`).join('')}
      <!-- pin -->
      <g transform="translate(314 244)"><g class="pin-drop"><path d="M0 34C-10 23-18 15-18 4a18 18 0 0 1 36 0c0 11-8 19-18 30z" style="fill:var(--brand-solid)"/><circle cy="4" r="6.5" style="fill:var(--ochre)"/></g></g>
      <ellipse cx="314" cy="280" rx="14" ry="3" style="fill:var(--brand-solid);opacity:.25"/>
      <!-- north arrow -->
      <g transform="translate(548 60)"><circle r="22" style="fill:var(--surface);stroke:var(--line-strong)"/><path d="M0-14 7 9 0 4-7 9z" style="fill:var(--brand-solid)"/><text y="-26" text-anchor="middle" style="fill:var(--fg);font-size:12px;font-weight:700">ش</text></g>
    </svg>`;
  }

  function miniRing(v, size = 46) {
    const r = size / 2 - 4, c = 2 * Math.PI * r;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="5" style="stroke:var(--line)"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" style="stroke:var(--good)"/></svg>`;
  }

  Pages.landing = {
    shell: 'public', title: 'افهم موقعك. صمّم بذكاء.',
    render() {
      return `
      <header class="land-nav"><div class="container">
        ${brand(false, '#landing')}
        <nav class="land-links" aria-label="أقسام الصفحة">
          <a href="#landing" data-scroll="how">كيف يعمل</a><a href="#landing" data-scroll="what">ماذا نحلل</a><a href="#landing" data-scroll="decide">من التحليل إلى القرار</a><a href="#landing" data-scroll="who">لمن معمار؟</a>
        </nav>
        <div class="end">${langSwitch()}<a class="btn btn-ghost" href="#signin">تسجيل الدخول</a><a class="btn btn-primary" href="#signup">ابدأ مجانًا</a></div>
      </div></header>

      <section class="hero"><div class="container hero-grid">
        <div>
          <span class="eyebrow">منصة التحليل البيئي للمواقع المعمارية</span>
          <h1 style="margin-top:18px">افهم موقعك.<span class="accent">صمّم بذكاء.</span></h1>
          <p class="hero-lede">اختر قطعة الأرض من الخريطة، ويحلّل معمار الشمس والرياح والحرارة والبيئة المحيطة بها، ثم يحوّل النتائج إلى قرارات تصميمية واضحة تفيد المعماري وصاحب الأرض على حد سواء.</p>
          <div class="hero-ctas">
            <a class="btn btn-primary btn-lg" href="#map">${ic('pin')}ابدأ تحليل موقعك</a>
            <a class="btn btn-outline btn-lg" href="#landing" data-scroll="how">${ic('play')}اكتشف كيف يعمل</a>
          </div>
          <div class="hero-flow" aria-label="مسار العمل">
            <span class="step">${ic('pin')}الموقع</span>${ic('arrowL', 'arrow')}
            <span class="step">${ic('gauge')}التحليل</span>${ic('arrowL', 'arrow')}
            <span class="step">${ic('eye')}الفهم</span>${ic('arrowL', 'arrow')}
            <span class="step">${ic('pen')}القرار التصميمي</span>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-map">${heroSVG()}</div>
          <div class="float-card fc-score">${miniRing(78)}<div><span class="k">التقييم البيئي</span><b class="num">78<small style="font-size:.6em;color:var(--muted)">/100</small></b></div></div>
          <div class="float-card fc-wind"><span class="k">${ic('wind')}<span>الرياح السائدة</span></span><b>شمالية غربية</b><span class="muted num">3.8 م/ث في المتوسط</span></div>
          <div class="float-card fc-sun"><span class="k">${ic('sun')}<span>التعرض الشمسي</span></span><b>مرتفع غربًا</b><span class="muted num">4.2 ك.و.س/م² يوميًا</span></div>
          <div class="float-card fc-rec"><span class="k" style="color:var(--ochre-700);font-weight:700">${ic('pen')}<span>توصية</span></span><span style="font-size:var(--fs-sm);font-weight:600;color:var(--fg);display:block;margin-top:4px;line-height:1.6">وجّه الفراغات الرئيسية نحو الشمال وظلّل الواجهة الغربية</span></div>
        </div>
      </div></section>

      <section class="land-section alt" id="how"><div class="container">
        <div class="land-head"><span class="eyebrow">كيف يعمل</span><h2>أربع خطوات من قطعة أرض إلى قرار تصميمي</h2><p class="section-sub">لا تحتاج إلى خبرة في المحاكاة البيئية. اختر الموقع، ونتولى الباقي.</p></div>
        <div class="steps">
          ${[
            ['pin', 'اختر الأرض من الخريطة', 'ابحث بالحي أو رقم القطعة أو الإحداثيات، ثم انقر على حدود الأرض لتحديدها.'],
            ['gauge', 'نحلّل الموقع', 'نقرأ مسار الشمس واتجاهات الرياح ودرجات الحرارة والبيئة المحيطة بالقطعة.'],
            ['eye', 'افهم النتائج', 'لوحة بصرية تشرح كل عامل بلغة بسيطة، مع تفاصيل تقنية للمعماريين.'],
            ['pen', 'اتخذ القرار', 'توصيات عملية للتوجيه والتظليل والتهوية وتوزيع الفراغات، جاهزة للمشاركة.'],
          ].map((s, i) => `<div class="step-cell"><span class="n">0${i + 1}</span><div class="ic">${ic(s[0])}</div><h3>${s[1]}</h3><p>${s[2]}</p></div>`).join('')}
        </div>
      </div></section>

      <section class="land-section" id="what"><div class="container">
        <div class="land-head"><span class="eyebrow">ماذا نحلل</span><h2>كل عامل بيئي يؤثر على تصميمك، في مكان واحد</h2><p class="section-sub">لكل عامل لون ثابت في المنصة، لتعرف ما تقرؤه من النظرة الأولى.</p></div>
        <div class="factors">
          ${[
            ['sun', 'sun', 'الشمس والإشعاع الشمسي', 'مسار الشمس على مدار السنة، والإشعاع على كل واجهة، وأفضل توجيه للمبنى.', ['مسار الشمس', 'إشعاع الواجهات', 'زوايا التظليل']],
            ['wind', 'wind', 'الرياح والتهوية', 'وردة الرياح الموسمية وسرعاتها، وفرص التهوية الطبيعية العابرة.', ['وردة الرياح', 'التهوية العابرة', 'الغبار']],
            ['heat', 'thermo', 'الحرارة والراحة الحرارية', 'أنماط الحرارة اليومية والموسمية، وساعات الراحة، والمناطق الحارة والباردة في القطعة.', ['تقويم حراري', 'ساعات الراحة', 'مناطق الحرارة']],
            ['ctx', 'building', 'البيئة المحيطة', 'المباني المجاورة والمساحات الخضراء والطرق ومصادر الضوضاء والغبار.', ['الجوار', 'المساحات الخضراء', 'الضوضاء']],
            ['ochre', 'sunrise', 'الإضاءة الطبيعية', 'معامل رؤية السماء والعوائق المحيطة وإمكانات الإضاءة النهارية.', ['رؤية السماء', 'العوائق']],
            ['navy', 'file', 'الاشتراطات النظامية', 'نسبة البناء والارتدادات والارتفاعات المسموحة كمرجع عند تطبيق التوصيات.', ['نسبة البناء', 'الارتدادات']],
          ].map(f => `<div class="card card-hover factor"><div class="fi fi-${f[0]}">${ic(f[1])}</div><h3>${f[2]}</h3><p>${f[3]}</p><div class="metrics">${f[4].map(m => `<span class="chip">${m}</span>`).join('')}</div></div>`).join('')}
        </div>
      </div></section>

      <section class="land-section alt" id="decide"><div class="container">
        <div class="land-head"><span class="eyebrow">من التحليل إلى القرار</span><h2>لا نعرض أرقامًا فقط. نترجمها إلى ما يجب أن تفعله.</h2></div>
        <div class="translate">
          <div class="card tr-col data">
            <h3>${ic('gauge')}ما يقيسه التحليل</h3>
            <div class="tr-row" style="color:var(--fg-2)">${ic('sun', '', 'style="color:var(--sun)"')}<div><b>إشعاع الواجهة الغربية 4.2 ك.و.س/م² يوميًا</b><br>الأعلى بين الواجهات، في وقت ذروة الحرارة.</div></div>
            <div class="tr-row" style="color:var(--fg-2)">${ic('wind', '', 'style="color:var(--wind)"')}<div><b>رياح شمالية غربية بنسبة 31% من ساعات السنة</b><br>بمتوسط سرعة 3.8 م/ث.</div></div>
            <div class="tr-row" style="color:var(--fg-2)">${ic('thermo', '', 'style="color:var(--heat)"')}<div><b>20% فقط من ساعات السنة ضمن نطاق الراحة</b><br>صيف حار طويل من مايو إلى سبتمبر.</div></div>
          </div>
          <div class="tr-arrow" aria-hidden="true">${ic('arrowL')}</div>
          <div class="card tr-col decide">
            <h3>${ic('pen')}ما يعنيه لتصميمك</h3>
            <div class="tr-row">${ic('check')}<div><b>قلّل الفتحات غربًا واستخدم كاسرات رأسية</b>، وضع الخدمات والسلالم على هذه الواجهة.</div></div>
            <div class="tr-row">${ic('check')}<div><b>افتح نوافذ متقابلة شمال غرب – جنوب شرق</b> لتهوية عابرة في الربيع والخريف.</div></div>
            <div class="tr-row">${ic('check')}<div><b>اجعل الفناء في الجهة الشرقية</b> حيث الظل بعد الظهر، لاستخدام مسائي مريح.</div></div>
          </div>
        </div>
      </div></section>

      <section class="land-section" id="who"><div class="container">
        <div class="land-head"><span class="eyebrow">لمن معمار؟</span><h2>للمعماري الذي يريد العمق، ولصاحب الأرض الذي يريد الوضوح</h2></div>
        <div class="audience">
          <div class="card aud"><span class="chip chip-navy tag">${ic('pen')}للمعماريين والمصممين</span><h3>قرارات مبكرة مبنية على بيانات الموقع</h3>
            <ul>
              <li>${ic('checkCircle')}مسار شمس دقيق ووردة رياح موسمية وتقويم حراري لكل قطعة.</li>
              <li>${ic('checkCircle')}مؤشرات لكل واجهة: الإشعاع والظل ومعامل رؤية السماء.</li>
              <li>${ic('checkCircle')}توصيات بقيم تقنية (نسبة النوافذ، عمق البروزات، معامل الزجاج).</li>
              <li>${ic('checkCircle')}تقرير PDF لعرضه على العميل في الاجتماع الأول.</li>
            </ul></div>
          <div class="card aud"><span class="chip chip-sun tag">${ic('house')}لأصحاب الأراضي</span><h3>اعرف ما تعنيه أرضك قبل أن تبدأ</h3>
            <ul>
              <li>${ic('checkCircle')}تقييم واحد من 100 يلخص ملاءمة الموقع بيئيًا.</li>
              <li>${ic('checkCircle')}شرح مبسط لكل عامل دون مصطلحات معقدة.</li>
              <li>${ic('checkCircle')}أهم ثلاثة قرارات يجب مناقشتها مع المعماري.</li>
              <li>${ic('checkCircle')}احفظ عدة قطع وقارن بينها قبل الشراء.</li>
            </ul></div>
        </div>
      </div></section>

      <section class="container"><div class="cta-band">
        <div class="pattern">${patternSVG('cta-pat', '#e9c48f')}</div>
        <div><h2>جاهز لتفهم موقعك؟</h2><p>حدّد أرضك على الخريطة وشاهد التحليل الكامل خلال دقيقة. لا تحتاج إلى حساب لتجربة النموذج.</p></div>
        <a class="btn btn-accent btn-lg" href="#map">${ic('pin')}ابدأ تحليل موقعك</a>
      </div></section>

      <footer class="footer"><div class="container">
        ${brand(false, '#landing')}
        <span>نموذج أولي تفاعلي · جميع البيانات المعروضة توضيحية وغير معتمدة</span>
        <span class="num">© 2026 معمار</span>
      </div></footer>`;
    },
    mount() {
      const nav = App.$('.land-nav');
      const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      this.unmount = () => window.removeEventListener('scroll', onScroll);
    },
  };

  /* ---------- Auth ---------- */
  function authArt(quote, meta) {
    return `<aside class="auth-art" aria-hidden="true">
      <svg class="art-svg" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
        <defs><pattern id="bp" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="rgba(255,255,255,.06)"/></pattern>
          <radialGradient id="glow" cx="70%" cy="30%" r="60%"><stop offset="0" stop-color="#1d4a75"/><stop offset="1" stop-color="#0a2440" stop-opacity="0"/></radialGradient></defs>
        <rect width="600" height="800" fill="url(#bp)"/><rect width="600" height="800" fill="url(#glow)"/>
        <g transform="translate(300 330) rotate(-12)" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2">
          <rect x="-210" y="-150" width="190" height="120"/><rect x="0" y="-150" width="190" height="120"/>
          <rect x="-210" y="-10" width="190" height="120"/><rect x="0" y="-10" width="190" height="120"/>
          <path d="M-210 -90h190M0 -90h190M-210 50h190M0 50h190M-115 -150v240M95 -150v240" stroke-dasharray="3 5"/>
          <rect x="0" y="-150" width="95" height="60" fill="#c48a45" fill-opacity=".55" stroke="#e9c48f" stroke-width="2"/>
        </g>
        <path d="M80 560 Q 300 360 540 560" fill="none" stroke="#e9c48f" stroke-width="1.5" stroke-dasharray="2 8" stroke-linecap="round"/>
        <circle cx="430" cy="466" r="12" fill="#e9c48f"/><circle cx="430" cy="466" r="24" fill="#e9c48f" opacity=".15"/>
        ${[0, 1, 2].map(i => `<path d="M${40 + i * 30} ${120 + i * 40} q 80 40 150 90 t 140 70" fill="none" stroke="#5fc0d8" stroke-width="1.6" class="wind-flow" opacity="${.6 - i * .15}"/>`).join('')}
      </svg>
      <div class="art-top">${brand(true, '#landing')}</div>
      <div class="art-bottom"><blockquote>${quote}</blockquote><div class="meta">${meta}</div>
        <div class="stat-row"><div><b class="num">12</b><span>مؤشرًا بيئيًا لكل قطعة</span></div><div><b class="num">4</b><span>واجهات بتحليل مستقل</span></div><div><b class="num">6</b><span>توصيات تصميمية</span></div></div>
      </div>
    </aside>`;
  }
  function pwField(id, label, ph, extra = '') {
    return `<div class="field"><label for="${id}">${label}<span class="req" aria-hidden="true">*</span></label>
      <div class="input-wrap">${ic('lock')}<input class="input" id="${id}" type="password" placeholder="${ph}" autocomplete="new-password" aria-required="true"><button class="input-action" type="button" data-toggle-pw="${id}" aria-label="إظهار كلمة المرور">${ic('eye')}</button></div>${extra}</div>`;
  }
  function wirePw(root) {
    root.querySelectorAll('[data-toggle-pw]').forEach(b => b.onclick = () => {
      const inp = root.querySelector('#' + b.dataset.togglePw);
      const show = inp.type === 'password'; inp.type = show ? 'text' : 'password';
      b.innerHTML = ic(show ? 'eyeOff' : 'eye'); b.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
    });
  }

  Pages.signup = {
    shell: 'public', title: 'إنشاء حساب',
    render() {
      return `<div class="auth">
        <div class="auth-form-side">
          <div class="auth-top">${brand(false, '#landing')}${langSwitch()}</div>
          <div class="auth-body"><form class="auth-card" id="su-form" novalidate>
            <div><h1>أنشئ حسابك</h1><p class="sub">ابدأ بتحليل أول موقع خلال دقائق.</p></div>
            <div class="field"><span class="label">نوع الحساب</span>
              <div class="role-pick" role="group" aria-label="نوع الحساب">
                <button type="button" class="role" aria-pressed="true" data-role="architect">${ic('pen')}<span><b>معماري أو مصمم</b><span>تفاصيل تقنية كاملة</span></span></button>
                <button type="button" class="role" aria-pressed="false" data-role="owner">${ic('house')}<span><b>صاحب أرض</b><span>شرح مبسط وتوصيات</span></span></button>
              </div></div>
            <div class="field"><label for="su-name">الاسم الكامل<span class="req" aria-hidden="true">*</span></label><div class="input-wrap">${ic('user')}<input class="input" id="su-name" placeholder="مثال: سارة العتيبي" autocomplete="name" aria-required="true"></div></div>
            <div class="field"><label for="su-email">البريد الإلكتروني<span class="req" aria-hidden="true">*</span></label><div class="input-wrap">${ic('mail')}<input class="input" id="su-email" type="email" dir="ltr" placeholder="you@example.com" autocomplete="email" aria-required="true" style="text-align:right"></div></div>
            ${pwField('su-pw', 'كلمة المرور', '8 أحرف على الأقل', '<div class="strength" id="su-strength" data-s="0" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="hint">استخدم أحرفًا وأرقامًا ورمزًا واحدًا على الأقل.</span>')}
            ${pwField('su-pw2', 'تأكيد كلمة المرور', 'أعد كتابة كلمة المرور')}
            <label class="check"><input type="checkbox" id="su-terms">أوافق على <a class="link" href="#signup">الشروط والأحكام</a> و<a class="link" href="#signup">سياسة الخصوصية</a></label>
            <button class="btn btn-primary btn-lg btn-block" type="submit">إنشاء الحساب</button>
            <div class="divider">أو</div>
            <button class="btn btn-google btn-lg btn-block" type="button" data-google>${googleG}المتابعة باستخدام Google</button>
            <p style="text-align:center;font-size:var(--fs-sm);color:var(--muted)">لديك حساب؟ <a class="link" href="#signin">سجّل الدخول</a></p>
          </form></div>
          <div class="auth-foot"><span>نموذج أولي — لن يتم إنشاء حساب فعلي</span><a href="#home" class="link">تصفح دون حساب</a></div>
        </div>
        ${authArt('كل قطعة أرض لها مناخها الخاص. صمّم بناءً عليه.', 'معمار يقرأ الشمس والرياح والحرارة لكل موقع على حدة.')}
      </div>`;
    },
    mount(root) {
      wirePw(root);
      root.querySelectorAll('[data-role]').forEach(b => b.onclick = () => root.querySelectorAll('[data-role]').forEach(x => x.setAttribute('aria-pressed', String(x === b))));
      const pw = root.querySelector('#su-pw'), st = root.querySelector('#su-strength');
      pw.addEventListener('input', () => {
        const v = pw.value; let s = 0;
        if (v.length >= 1) s = 1; if (v.length >= 8) s = 2; if (v.length >= 8 && /\d/.test(v) && /[A-Za-z؀-ۿ]/.test(v)) s = 3; if (s === 3 && /[^\w\s]/.test(v)) s = 4;
        st.dataset.s = s;
      });
      root.querySelector('#su-form').addEventListener('submit', e => {
        e.preventDefault();
        const role = root.querySelector('[data-role][aria-pressed="true"]').dataset.role;
        App.state.mode = role === 'architect' ? 'tech' : 'simple'; App.persist(); App.applyMode();
        location.hash = '#home'; toast('أهلًا بك في معمار! تم إنشاء حسابك (نموذج تجريبي)');
      });
      root.querySelector('[data-google]').onclick = () => { location.hash = '#home'; toast('تم الدخول باستخدام Google (نموذج تجريبي)'); };
    },
  };

  Pages.signin = {
    shell: 'public', title: 'تسجيل الدخول',
    render() {
      return `<div class="auth">
        <div class="auth-form-side">
          <div class="auth-top">${brand(false, '#landing')}${langSwitch()}</div>
          <div class="auth-body"><form class="auth-card" id="si-form" novalidate>
            <div><h1>مرحبًا بعودتك</h1><p class="sub">سجّل الدخول لمتابعة تحليل مواقعك.</p></div>
            <button class="btn btn-google btn-lg btn-block" type="button" data-google>${googleG}تسجيل الدخول باستخدام Google</button>
            <div class="divider">أو بالبريد الإلكتروني</div>
            <div class="field"><label for="si-email">البريد الإلكتروني<span class="req" aria-hidden="true">*</span></label><div class="input-wrap">${ic('mail')}<input class="input" id="si-email" type="email" dir="ltr" value="sara.alotaibi@example.com" autocomplete="email" aria-required="true" style="text-align:right"></div></div>
            ${pwField('si-pw', 'كلمة المرور', '••••••••')}
            <div class="row-between"><label class="check"><input type="checkbox" id="si-remember" checked>تذكرني</label><a class="link" href="#signin" data-forgot style="font-size:var(--fs-sm)">نسيت كلمة المرور؟</a></div>
            <button class="btn btn-primary btn-lg btn-block" type="submit">${ic('login')}تسجيل الدخول</button>
            <p style="text-align:center;font-size:var(--fs-sm);color:var(--muted)">ليس لديك حساب؟ <a class="link" href="#signup">إنشاء حساب</a></p>
          </form></div>
          <div class="auth-foot"><span>نموذج أولي — أي بيانات تسمح بالدخول</span><a href="#home" class="link">تصفح دون حساب</a></div>
        </div>
        ${authArt('من قطعة أرض على الخريطة إلى قرار تصميمي واضح.', 'تحليلاتك المحفوظة بانتظارك.')}
      </div>`;
    },
    mount(root) {
      wirePw(root);
      root.querySelector('#si-pw').value = 'mimar2026';
      root.querySelector('#si-form').addEventListener('submit', e => { e.preventDefault(); location.hash = '#home'; toast('تم تسجيل الدخول بنجاح'); });
      root.querySelector('[data-google]').onclick = () => { location.hash = '#home'; toast('تم الدخول باستخدام Google (نموذج تجريبي)'); };
      root.querySelector('[data-forgot]').onclick = e => { e.preventDefault(); toast('أرسلنا رابط إعادة التعيين إلى بريدك (نموذج تجريبي)', { icon: 'mail' }); };
    },
  };

  Pages.logout = {
    shell: 'public', title: 'تسجيل الخروج',
    render() {
      return `<div class="center-page blueprint"><div class="card logout-card" id="lo-card">
        ${brand()}
        <div class="ico">${ic('logout')}</div>
        <h1>هل تريد تسجيل الخروج؟</h1>
        <p>ستبقى تحليلاتك ومواقعك المحفوظة في حسابك، ويمكنك العودة إليها في أي وقت.</p>
        <div class="kept"><span>${ic('history', '', 'style="width:16px;height:16px;display:inline;vertical-align:-3px"')} <b class="num">${MOCK.analyses.filter(a => !App.state.deleted.has(a.id)).length}</b> تحليلات</span><span>·</span><span>${ic('bookmark', '', 'style="width:16px;height:16px;display:inline;vertical-align:-3px"')} <b class="num">${App.state.saved.size}</b> محفوظات</span></div>
        <div class="actions"><button class="btn btn-outline btn-lg" type="button" data-back>${ic('arrowR')}العودة</button><button class="btn btn-primary btn-lg" type="button" data-out>${ic('logout')}تسجيل الخروج</button></div>
      </div></div>`;
    },
    mount(root) {
      root.querySelector('[data-back]').onclick = () => { history.length > 1 ? history.back() : (location.hash = '#home'); };
      root.querySelector('[data-out]').onclick = () => {
        const c = root.querySelector('#lo-card');
        c.innerHTML = `${brand(false, '#landing')}<div class="ico" style="background:var(--good-soft);color:var(--good)">${ic('checkCircle')}</div>
          <h1>تم تسجيل خروجك</h1><p>نراك قريبًا. موقعك القادم بانتظار التحليل.</p>
          <div class="actions"><a class="btn btn-outline btn-lg" href="#landing">الصفحة الرئيسية</a><a class="btn btn-primary btn-lg" href="#signin">${ic('login')}تسجيل الدخول</a></div>`;
      };
    },
  };
})();
