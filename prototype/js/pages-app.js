/* Workspace pages: home, history, saved, profile. */
(function () {
  const { state, persist, fmt, fmtDate, scorePill, statusChip, thumbSVG, toast, patternSVG } = App;
  const M = window.MOCK;
  const Pages = window.Pages;
  const live = () => M.analyses.filter(a => !state.deleted.has(a.id));
  const savedList = () => live().filter(a => state.saved.has(a.id));

  function openAnalysis(id) { state.currentId = id; persist(); location.hash = '#dashboard'; }

  /* sparkline: analyses per month (last 6 months) */
  function sparkline() {
    const vals = [2, 3, 2, 4, 5, 3], w = 120, h = 36, max = 6;
    const pts = vals.map((v, i) => [i * (w / (vals.length - 1)), h - 4 - (v / max) * (h - 8)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true" style="overflow:visible" direction="ltr">
      <path d="${d} L${w} ${h} L0 ${h}Z" style="fill:var(--ochre);opacity:.12"/><path d="${d}" fill="none" stroke-width="2" style="stroke:var(--ochre)"/>
      <circle cx="${pts[5][0]}" cy="${pts[5][1]}" r="3.5" style="fill:var(--ochre);stroke:var(--surface)" stroke-width="2"/></svg>`;
  }

  function startArt() {
    return `<svg viewBox="0 0 600 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="sg" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="rgba(255,255,255,.05)"/></pattern></defs>
      <rect width="600" height="320" fill="url(#sg)"/>
      <g transform="translate(-30 30) rotate(-10 120 160)" fill="none" stroke="rgba(255,255,255,.13)">
        ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${-40 + c * 120}" y="${20 + r * 90}" width="108" height="78"/><path d="M${-40 + c * 120} ${59 + r * 90}h108M${-13 + c * 120} ${20 + r * 90}v78M${14 + c * 120} ${20 + r * 90}v78M${41 + c * 120} ${20 + r * 90}v78" stroke-dasharray="2 4"/>`).join('')).join('')}
        <rect x="80" y="110" width="54" height="39" fill="rgba(196,138,69,.6)" stroke="#e9c48f" stroke-width="2"/>
      </g>
      <g transform="translate(100 112)"><path d="M0 26C-8 18-14 12-14 4a14 14 0 0 1 28 0c0 8-6 14-14 22z" fill="#f6f5f1"/><circle cy="4" r="5" fill="#c48a45"/></g>
    </svg>`;
  }

  /* ---------------- HOME ---------------- */
  Pages.home = {
    shell: 'app', title: 'الرئيسية',
    render() {
      const last = live()[0];
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'صباح الخير' : 'مساء الخير';
      return `<div class="container">
        <div class="page-head" style="padding-bottom:16px"><div><h1>${greet}، ${M.user.first}</h1><p>مساحة عملك لتحليل المواقع وتحويلها إلى قرارات تصميمية.</p></div>
          <span class="proto-note">${ic('info')}البيانات في هذا النموذج توضيحية</span></div>
        <div class="home-hero">
          <section class="start-card">
            <div class="bg">${startArt()}</div>
            <div><span class="greet">${ic('pin')}الخطوة الأولى دائمًا</span>
              <h2 style="margin-top:10px">حلّل موقعًا جديدًا</h2>
              <p>حدّد قطعة الأرض على الخريطة، وسنحلل الشمس والرياح والحرارة والبيئة المحيطة بها خلال دقيقة.</p></div>
            <div class="row"><a class="btn btn-accent btn-lg" href="#map">${ic('map')}اختر موقعًا من الخريطة</a><a class="btn btn-outline btn-lg" href="#map" data-coords>${ic('hash')}إدخال إحداثيات</a></div>
          </section>
          <div class="stat-stack">
            <a class="card card-hover stat" href="#dashboard" data-open="${last ? last.id : ''}">
              <span class="si fi-ochre">${ic('target')}</span>
              <div><span class="lbl">آخر تحليل</span><div class="val">${last ? `${last.district} <small>· قطعة ${last.parcel}</small>` : '—'}</div><span class="sub">${last ? fmtDate(last.date) : ''}</span></div>
              ${last ? scorePill(last.score) : ''}
            </a>
            <a class="card card-hover stat" href="#saved">
              <span class="si fi-navy">${ic('bookmark')}</span>
              <div><span class="lbl">المواقع المحفوظة</span><div class="val num">${savedList().length} <small>مواقع</small></div><span class="sub">آخرها ${savedList()[0] ? savedList()[0].district : '—'}</span></div>
              ${ic('chevL', '', 'style="width:20px;height:20px;color:var(--faint)"')}
            </a>
            <div class="card stat">
              <span class="si fi-wind">${ic('trend')}</span>
              <div><span class="lbl">التحليلات هذا الشهر</span><div class="val num">3 <small>تحليلات</small></div><span class="sub s-good">${ic('trend', '', 'style="width:13px;height:13px;display:inline;vertical-align:-2px"')} +1 عن الشهر الماضي</span></div>
              ${sparkline()}
            </div>
          </div>
        </div>

        <div class="home-cols">
          <section class="card">
            <div class="panel-head"><h2>${ic('history')}التحليلات الأخيرة</h2><a class="link" href="#history" style="font-size:var(--fs-sm)">عرض السجل</a></div>
            ${live().slice(0, 4).map(a => `
              <a class="recent-row" href="#dashboard" data-open="${a.id}">
                <div class="mini-thumb">${thumbSVG(a.seed, { noPin: true })}</div>
                <div style="min-width:0"><h3>${a.district} · قطعة ${a.parcel}</h3><div class="a-meta"><span>${ic('area')}<span class="num">${fmt(a.area)}</span> م²</span><span>${ic('calendar')}${fmtDate(a.date)}</span></div></div>
                ${scorePill(a.score)}<span class="go">${ic('chevL')}</span>
              </a>`).join('')}
          </section>
          <section class="card">
            <div class="panel-head"><h2>${ic('sparkle')}رؤى بيئية سريعة</h2><span class="chip">الرياض · أكتوبر</span></div>
            ${M.insights.map(i => `<div class="insight"><span class="fi fi-${i.tone}">${ic(i.icon)}</span><div><b>${i.title}</b><p>${i.text}</p></div></div>`).join('')}
          </section>
        </div>

        <section class="card" style="margin-top:20px">
          <div class="panel-head"><h2>${ic('bookmark')}مواقعك المحفوظة</h2><a class="link" href="#saved" style="font-size:var(--fs-sm)">إدارة المحفوظات</a></div>
          <div class="saved-strip">
            ${savedList().slice(0, 4).map(a => `<a class="saved-mini" href="#dashboard" data-open="${a.id}"><div class="a-thumb">${thumbSVG(a.seed)}</div><div class="t"><span>${a.district}</span>${scorePill(a.score)}</div></a>`).join('') || '<p class="muted">لا توجد مواقع محفوظة بعد.</p>'}
          </div>
        </section>

        <div class="shortcuts">
          ${[
            ['#map', 'fi-navy', 'map', 'تحليل جديد', 'من الخريطة'],
            ['#dashboard', 'fi-ochre', 'fileText', 'تصدير آخر تقرير', 'PDF للعميل', 'export'],
            ['#history', 'fi-wind', 'history', 'سجل التحليلات', `${live().length} تحليلات`],
            ['#profile', 'fi-ctx', 'settings', 'التفضيلات', 'العرض واللغة', 'prefs'],
          ].map(s => `<a class="card card-hover shortcut" href="${s[0]}" ${s[5] === 'export' ? 'data-export' : ''} ${s[5] === 'prefs' ? 'data-scroll="prefs"' : ''}><span class="fi ${s[1]}">${ic(s[2])}</span><span>${s[3]}<small>${s[4]}</small></span></a>`).join('')}
        </div>
      </div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-open]').forEach(a => a.addEventListener('click', e => { if (a.dataset.open) { e.preventDefault(); openAnalysis(a.dataset.open); } }));
      const ex = root.querySelector('[data-export]');
      ex && ex.addEventListener('click', e => { e.preventDefault(); App.exportModal(App.analysis(live()[0].id)); });
      const co = root.querySelector('[data-coords]');
      co && co.addEventListener('click', () => { state.mapMode = 'coords'; });
    },
  };

  /* ---------------- HISTORY ---------------- */
  const hist = { q: '', filter: 'all', view: 'grid', sort: 'new' };
  function historyItems() {
    let items = live();
    if (hist.q) items = items.filter(a => (a.district + a.parcel + a.plan).includes(hist.q.trim()));
    if (hist.filter === 'review') items = items.filter(a => a.status === 'review');
    if (hist.filter === 'saved') items = items.filter(a => state.saved.has(a.id));
    if (hist.filter === 'high') items = items.filter(a => a.score >= 80);
    if (hist.sort === 'score') items = [...items].sort((a, b) => b.score - a.score);
    return items;
  }
  function analysisCard(a, ctx) {
    const isSaved = state.saved.has(a.id);
    return `<article class="card card-hover a-card" data-id="${a.id}">
      <div class="a-thumb">${thumbSVG(a.seed)}${scorePill(a.score)}<span class="status">${ctx === 'saved' ? '' : statusChip(a)}</span></div>
      <div class="a-body"><h3>${a.district} · قطعة ${a.parcel}</h3>
        <div class="a-meta"><span>${ic('pin')}${a.city} · مخطط <span class="num">${a.plan}</span></span><span>${ic('area')}<span class="num">${fmt(a.area)}</span> م²</span><span>${ic('calendar')}${fmtDate(a.date)}</span></div>
        ${a.note ? `<div class="a-note">${ic('alert')}${a.note}</div>` : ''}
      </div>
      <div class="a-actions">
        <button class="btn btn-primary btn-sm" data-act="open">${ic('eye')}فتح التحليل</button>
        ${ctx === 'saved'
          ? `<button class="btn btn-outline btn-sm" data-act="unsave" title="إزالة من المحفوظات">${ic('bookmark', '', 'style="fill:currentColor;color:var(--ochre)"')}إزالة</button>`
          : `<button class="btn btn-outline btn-sm btn-icon btn-save" data-act="save" aria-pressed="${isSaved}" aria-label="${isSaved ? 'إزالة من المحفوظات' : 'حفظ'}" title="${isSaved ? 'محفوظ' : 'حفظ'}">${ic('bookmark')}</button>
             <button class="btn btn-outline btn-sm btn-icon" data-act="delete" aria-label="حذف" title="حذف">${ic('trash')}</button>`}
      </div>
    </article>`;
  }
  function historyTable(items) {
    return `<div class="table-wrap"><table class="data"><thead><tr><th>الموقع</th><th>التاريخ</th><th>المساحة</th><th>التقييم</th><th>الحالة</th><th>ملاحظات</th><th><span class="sr-only">إجراءات</span></th></tr></thead><tbody>
      ${items.map(a => `<tr data-id="${a.id}"><td><div style="display:flex;gap:12px;align-items:center"><div class="mini-thumb">${thumbSVG(a.seed, { noPin: true })}</div><div><b>${a.district}</b><div class="faint" style="font-size:var(--fs-xs)">قطعة ${a.parcel} · مخطط ${a.plan}</div></div></div></td>
        <td class="num">${fmtDate(a.date)}</td><td class="num">${fmt(a.area)} م²</td><td>${scorePill(a.score)}</td><td>${statusChip(a)}</td>
        <td style="font-size:var(--fs-xs);color:${a.note ? 'var(--warn)' : 'var(--faint)'}">${a.note || '—'}</td>
        <td><div style="display:flex;gap:4px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-act="open">فتح</button><button class="btn btn-ghost btn-sm btn-icon btn-save" data-act="save" aria-pressed="${state.saved.has(a.id)}" aria-label="حفظ">${ic('bookmark')}</button><button class="btn btn-ghost btn-sm btn-icon" data-act="delete" aria-label="حذف">${ic('trash')}</button></div></td></tr>`).join('')}
      </tbody></table></div>`;
  }
  function emptyState(icon, title, text, cta) {
    return `<div class="empty"><div class="ico">${ic(icon)}</div><h3>${title}</h3><p>${text}</p>${cta || ''}</div>`;
  }

  function wireCardActions(root, ctx, rerender) {
    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]'); if (!btn) return;
      const host = btn.closest('[data-id]'); const id = host.dataset.id; const a = App.analysis(id);
      const act = btn.dataset.act;
      if (act === 'open') openAnalysis(id);
      if (act === 'save') {
        const on = !state.saved.has(id); on ? state.saved.add(id) : state.saved.delete(id); persist();
        btn.setAttribute('aria-pressed', String(on));
        toast(on ? `تم حفظ ${a.district} · قطعة ${a.parcel}` : 'أُزيل من المحفوظات', { icon: 'bookmark' });
      }
      if (act === 'delete') {
        const bar = btn.closest('.a-actions, td > div');
        const prev = bar.innerHTML;
        bar.innerHTML = `<span class="confirm-inline">${ic('alert', '', 'style="width:16px;height:16px"')}حذف هذا التحليل؟</span><button class="btn btn-ghost btn-sm" data-cancel>إلغاء</button><button class="btn btn-danger btn-sm" data-confirm>حذف</button>`;
        bar.querySelector('[data-cancel]').onclick = ev => { ev.stopPropagation(); bar.innerHTML = prev; };
        bar.querySelector('[data-confirm]').onclick = ev => {
          ev.stopPropagation();
          host.classList.add('removing');
          setTimeout(() => {
            state.deleted.add(id); state.saved.delete(id); persist(); rerender();
            toast('تم حذف التحليل', { icon: 'trash', action: { label: 'تراجع', fn: () => { state.deleted.delete(id); persist(); rerender(); } } });
          }, 260);
        };
      }
      if (act === 'unsave') {
        host.classList.add('removing');
        setTimeout(() => {
          state.saved.delete(id); persist(); rerender();
          toast('أُزيل من المحفوظات', { icon: 'bookmark', action: { label: 'تراجع', fn: () => { state.saved.add(id); persist(); rerender(); } } });
        }, 260);
      }
    });
  }

  Pages.history = {
    shell: 'app', title: 'السجل',
    render() {
      return `<div class="container">
        <div class="page-head"><div><h1>سجل التحليلات</h1><p>كل المواقع التي حللتها على معمار، من الأحدث إلى الأقدم.</p></div>
          <a class="btn btn-primary" href="#map">${ic('plus')}تحليل جديد</a></div>
        <div class="toolbar">
          <div class="search input-wrap">${ic('search')}<input class="input" id="h-q" placeholder="ابحث بالحي أو رقم القطعة" value="${hist.q}"></div>
          <div class="filter-chips" role="group" aria-label="تصفية">
            ${[['all', 'الكل'], ['review', 'يحتاج مراجعة'], ['saved', 'المحفوظة'], ['high', 'تقييم 80+']].map(f => `<button type="button" data-f="${f[0]}" aria-pressed="${hist.filter === f[0]}">${f[1]}</button>`).join('')}
          </div>
          <div style="margin-inline-start:auto;display:flex;gap:8px;align-items:center">
            <select class="input" id="h-sort" style="height:38px;width:auto;font-size:var(--fs-sm)" aria-label="الترتيب"><option value="new" ${hist.sort === 'new' ? 'selected' : ''}>الأحدث أولًا</option><option value="score" ${hist.sort === 'score' ? 'selected' : ''}>الأعلى تقييمًا</option></select>
            <div class="segmented" role="group" aria-label="طريقة العرض"><button type="button" data-v="grid" aria-pressed="${hist.view === 'grid'}" aria-label="شبكة">${ic('grid')}</button><button type="button" data-v="list" aria-pressed="${hist.view === 'list'}" aria-label="قائمة">${ic('list')}</button></div>
          </div>
        </div>
        <div id="h-list"></div>
      </div>`;
    },
    mount(root) {
      const list = root.querySelector('#h-list');
      const draw = () => {
        const items = historyItems();
        if (!items.length) list.innerHTML = emptyState('history', hist.q || hist.filter !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد تحليلات بعد', hist.q || hist.filter !== 'all' ? 'جرّب كلمة بحث أخرى أو أزل عوامل التصفية.' : 'ابدأ بتحديد قطعة أرض على الخريطة وسيظهر تحليلها هنا.', `<a class="btn btn-primary" href="#map">${ic('map')}حلّل موقعًا</a>`);
        else list.innerHTML = hist.view === 'grid' ? `<div class="grid-cards">${items.map(a => analysisCard(a, 'history')).join('')}</div>` : historyTable(items);
      };
      draw();
      root.querySelector('#h-q').addEventListener('input', e => { hist.q = e.target.value; draw(); });
      root.querySelector('#h-sort').addEventListener('change', e => { hist.sort = e.target.value; draw(); });
      root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { hist.filter = b.dataset.f; root.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); });
      root.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { hist.view = b.dataset.v; root.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); });
      wireCardActions(list, 'history', draw);
    },
  };

  /* ---------------- SAVED ---------------- */
  Pages.saved = {
    shell: 'app', title: 'المحفوظات',
    render() {
      return `<div class="container">
        <div class="page-head"><div><h1>المواقع المحفوظة</h1><p>مساحتك الخاصة للمواقع التي تعمل عليها أو تقارن بينها.</p></div>
          <a class="btn btn-outline" href="#history">${ic('history')}من السجل</a></div>
        <div id="s-summary"></div>
        <div id="s-list"></div>
      </div>`;
    },
    mount(root) {
      const list = root.querySelector('#s-list'), sum = root.querySelector('#s-summary');
      const draw = () => {
        const items = savedList();
        if (items.length) {
          const avg = Math.round(items.reduce((s, a) => s + a.score, 0) / items.length);
          const best = items.reduce((b, a) => a.score > b.score ? a : b);
          const area = items.reduce((s, a) => s + a.area, 0);
          sum.innerHTML = `<div class="kpis" style="margin:0 0 20px">
            <div class="card kpi"><span class="k">${ic('bookmark')}مواقع محفوظة</span><span class="v num">${items.length}</span></div>
            <div class="card kpi"><span class="k">${ic('gauge')}متوسط التقييم</span><span class="v num">${avg}<small>/100</small></span></div>
            <div class="card kpi"><span class="k">${ic('star')}الأفضل بيئيًا</span><span class="v" style="font-size:var(--fs-md)">${best.district}</span><span class="s s-good">${ic('check')}${best.score}/100</span></div>
            <div class="card kpi"><span class="k">${ic('area')}إجمالي المساحات</span><span class="v num">${fmt(area)}<small> م²</small></span></div></div>`;
          list.innerHTML = `<div class="grid-cards">${items.map(a => analysisCard(a, 'saved')).join('')}</div>`;
        } else {
          sum.innerHTML = '';
          list.innerHTML = emptyState('bookmark', 'لا توجد مواقع محفوظة', 'احفظ أي تحليل من لوحة النتائج أو من السجل ليظهر هنا للرجوع إليه بسرعة.', `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><a class="btn btn-primary" href="#map">${ic('map')}حلّل موقعًا</a><a class="btn btn-outline" href="#history">تصفح السجل</a></div>`);
        }
      };
      draw();
      wireCardActions(list, 'saved', draw);
    },
  };

  /* ---------------- PROFILE ---------------- */
  Pages.profile = {
    shell: 'app', title: 'الملف الشخصي',
    render() {
      const u = M.user;
      const sec = (id, icon, title, sub, body, foot = true) => `<section class="card psec" id="${id}"><div class="psec-head"><div><h2>${title}</h2><p>${sub}</p></div></div><div class="psec-body">${body}</div>${foot ? `<div class="psec-foot"><button class="btn btn-ghost btn-sm" type="button" data-reset>إلغاء</button><button class="btn btn-primary btn-sm" type="button" data-save>حفظ التغييرات</button></div>` : ''}</section>`;
      return `<div class="container">
        <div class="page-head"><div><h1>الملف الشخصي والإعدادات</h1><p>معلوماتك وتفضيلات العرض وإعدادات الحساب.</p></div></div>
        <div class="card prof-hero" style="margin-bottom:24px">
          <span class="avatar avatar-lg">${u.initials}</span>
          <div><h2>${u.name}</h2><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"><span class="chip chip-navy">${ic('pen')}${u.role === 'architect' ? 'معماري' : 'صاحب أرض'}</span><span class="chip">${ic('building')}${u.org}</span><span class="chip">عضو منذ ${u.joined}</span></div></div>
          <div class="stats"><a href="#history"><b class="num">${live().length}</b><span>تحليلات في السجل</span></a><a href="#saved"><b class="num">${savedList().length}</b><span>مواقع محفوظة</span></a></div>
        </div>
        <div class="profile">
          <nav class="side-nav" aria-label="أقسام الإعدادات">
            ${[['personal', 'user', 'المعلومات الشخصية'], ['email', 'mail', 'البريد الإلكتروني'], ['password', 'lock', 'كلمة المرور'], ['prefs', 'settings', 'التفضيلات'], ['language', 'globe', 'اللغة'], ['notifs', 'bell', 'الإشعارات'], ['account', 'key', 'إعدادات الحساب']].map((s, i) => `<a href="#profile" data-sec="${s[0]}" class="${i === 0 ? 'active' : ''}">${ic(s[1])}${s[2]}</a>`).join('')}
          </nav>
          <div class="prof-sections">
            ${sec('personal', 'user', 'المعلومات الشخصية', 'تظهر في تقاريرك المصدّرة.', `
              <div class="form-grid">
                <div class="field"><label for="p-name">الاسم الكامل<span class="req">*</span></label><input class="input" id="p-name" value="${u.name}"></div>
                <div class="field"><label for="p-phone">رقم الجوال</label><input class="input" id="p-phone" dir="ltr" value="${u.phone}" style="text-align:right"></div>
                <div class="field"><label for="p-org">جهة العمل</label><input class="input" id="p-org" value="${u.org}"></div>
                <div class="field"><label for="p-city">المدينة</label><select class="input" id="p-city"><option>الرياض</option><option>جدة</option><option>الدمام</option><option>مكة المكرمة</option><option>المدينة المنورة</option><option>أبها</option></select></div>
                <div class="field" style="grid-column:1/-1"><span class="label">نوع الحساب</span><div class="role-pick">
                  <button type="button" class="role" aria-pressed="${u.role === 'architect'}" data-role>${ic('pen')}<span><b>معماري أو مصمم</b><span>تفاصيل تقنية افتراضيًا</span></span></button>
                  <button type="button" class="role" aria-pressed="${u.role !== 'architect'}" data-role>${ic('house')}<span><b>صاحب أرض</b><span>عرض مبسّط افتراضيًا</span></span></button></div></div>
              </div>`)}
            ${sec('email', 'mail', 'البريد الإلكتروني', 'يُستخدم لتسجيل الدخول واستلام التقارير.', `
              <div class="field"><label for="p-email">البريد الحالي<span class="req">*</span></label><div class="input-wrap">${ic('mail')}<input class="input" id="p-email" dir="ltr" value="${u.email}" style="text-align:right"></div>
              <span class="hint" style="display:flex;gap:6px;align-items:center;color:var(--good)">${ic('checkCircle', '', 'style="width:14px;height:14px"')}تم التحقق من البريد</span></div>`)}
            ${sec('password', 'lock', 'كلمة المرور', 'آخر تغيير قبل 3 أشهر.', `
              <div class="form-grid">
                <div class="field" style="grid-column:1/-1"><label for="p-pw0">كلمة المرور الحالية<span class="req">*</span></label><input class="input" id="p-pw0" type="password" placeholder="••••••••"></div>
                <div class="field"><label for="p-pw1">كلمة المرور الجديدة<span class="req">*</span></label><input class="input" id="p-pw1" type="password" placeholder="8 أحرف على الأقل"></div>
                <div class="field"><label for="p-pw2">تأكيد كلمة المرور<span class="req">*</span></label><input class="input" id="p-pw2" type="password" placeholder="أعد الكتابة"></div>
              </div>`)}
            ${sec('prefs', 'settings', 'التفضيلات', 'كيف تُعرض نتائج التحليل.', `
              <div class="pref-row"><div><b>مستوى التفاصيل في لوحة النتائج</b><small>المبسّط يشرح بلغة عامة، والتقني يعرض القيم الهندسية.</small></div>
                <div class="segmented" role="group"><button type="button" data-mode="simple" aria-pressed="${state.mode === 'simple'}">مبسّط</button><button type="button" data-mode="tech" aria-pressed="${state.mode === 'tech'}">تقني</button></div></div>
              <div class="pref-row"><div><b>المظهر</b><small>فاتح أو داكن أو حسب إعدادات جهازك.</small></div>
                <div class="segmented" role="group">${[['light', 'sun', 'فاتح'], ['dark', 'moon', 'داكن'], ['system', 'phone', 'تلقائي']].map(t => `<button type="button" data-theme-set="${t[0]}" aria-pressed="${state.theme === t[0]}">${ic(t[1])}${t[2]}</button>`).join('')}</div></div>
              <div class="pref-row"><div><b>وحدات القياس</b><small>المساحات والمسافات ودرجات الحرارة.</small></div>
                <select class="input" id="p-units" style="width:auto;height:38px"><option>متري (م، م²، °م)</option><option>إمبراطوري (قدم، °ف)</option></select></div>
              <div class="pref-row"><div><b>المدينة الافتراضية للخريطة</b><small>تفتح الخريطة عليها عند بدء تحليل جديد.</small></div>
                <select class="input" id="p-mapcity" style="width:auto;height:38px"><option>الرياض</option><option>جدة</option><option>الدمام</option></select></div>`)}
            ${sec('language', 'globe', 'اللغة', 'لغة الواجهة والتقارير.', `
              <div class="pref-row"><div><b>لغة الواجهة</b><small>الإنجليزية قيد الإعداد وستتوفر قريبًا.</small></div>${App.langSwitch()}</div>
              <div class="pref-row"><div><b>لغة التقارير الافتراضية</b><small>يمكن تغييرها عند كل تصدير.</small></div>
                <div class="segmented" role="group"><button type="button" aria-pressed="true" data-rl>العربية</button><button type="button" aria-pressed="false" data-rl>English <span class="soon">قريبًا</span></button></div></div>`, false)}
            ${sec('notifs', 'bell', 'الإشعارات', 'اختر ما يصلك عبر البريد.', [
              ['n1', 'اكتمال التحليل', 'عند جاهزية نتائج موقع جديد.', true],
              ['n2', 'تنبيهات المواقع المحفوظة', 'تغيرات موسمية مهمة مثل موجات الحر والعواصف الترابية.', true],
              ['n3', 'ملخص شهري', 'نشاطك وتحليلاتك خلال الشهر.', false],
              ['n4', 'أخبار المنصة', 'ميزات جديدة ونصائح تصميمية.', false],
            ].map(n => `<div class="pref-row"><div><b>${n[1]}</b><small>${n[2]}</small></div><label class="switch"><input type="checkbox" id="${n[0]}" ${n[3] ? 'checked' : ''} aria-label="${n[1]}"></label></div>`).join(''))}
            <section class="card psec danger-zone" id="account"><div class="psec-head"><div><h2>إعدادات الحساب</h2><p>تسجيل الخروج وإدارة بياناتك.</p></div></div>
              <div class="psec-body">
                <div class="pref-row"><div><b>تصدير بياناتي</b><small>نسخة من جميع تحليلاتك ومواقعك المحفوظة.</small></div><button class="btn btn-outline btn-sm" type="button" data-export-data>${ic('download')}طلب نسخة</button></div>
                <div class="pref-row"><div><b>تسجيل الخروج</b><small>من هذا الجهاز.</small></div><a class="btn btn-outline btn-sm" href="#logout">${ic('logout')}تسجيل الخروج</a></div>
                <div class="pref-row"><div><b style="color:var(--risk)">حذف الحساب</b><small>يحذف جميع تحليلاتك نهائيًا ولا يمكن التراجع عنه.</small></div><button class="btn btn-danger btn-sm" type="button" data-delete-acc>${ic('trash')}حذف الحساب</button></div>
              </div></section>
          </div>
        </div>
      </div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-save]').forEach(b => b.onclick = () => toast('تم حفظ التغييرات'));
      root.querySelectorAll('[data-reset]').forEach(b => b.onclick = () => toast('تم التراجع عن التعديلات', { icon: 'history' }));
      root.querySelectorAll('[data-role]').forEach(b => b.onclick = () => root.querySelectorAll('[data-role]').forEach(x => x.setAttribute('aria-pressed', String(x === b))));
      root.querySelectorAll('[data-rl]').forEach(b => b.onclick = () => { if (b.textContent.includes('English')) toast('تقارير الإنجليزية ستتوفر قريبًا', { icon: 'globe' }); });
      root.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
        state.mode = b.dataset.mode; persist(); App.applyMode();
        root.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        toast(state.mode === 'tech' ? 'سيتم عرض التفاصيل التقنية في لوحة النتائج' : 'سيتم عرض النتائج بأسلوب مبسّط');
      });
      root.querySelectorAll('[data-theme-set]').forEach(b => b.onclick = () => {
        state.theme = b.dataset.themeSet; persist(); App.applyTheme();
        root.querySelectorAll('[data-theme-set]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
      root.querySelectorAll('.switch input').forEach(s => s.addEventListener('change', () => toast(s.checked ? 'تم تفعيل الإشعار' : 'تم إيقاف الإشعار', { icon: 'bell', ms: 2000 })));
      root.querySelector('[data-export-data]').onclick = () => toast('سنرسل نسخة بياناتك إلى بريدك (نموذج تجريبي)', { icon: 'mail' });
      root.querySelector('[data-delete-acc]').onclick = () => App.modal(`
        <div class="modal-head"><div><h3>حذف الحساب نهائيًا؟</h3><p>سيتم حذف ${live().length} تحليلات و${savedList().length} مواقع محفوظة. لا يمكن التراجع عن هذا الإجراء.</p></div><button class="close-x" data-close aria-label="إغلاق">${ic('x')}</button></div>
        <div class="modal-body"><div class="callout callout-risk">${ic('alert')}<div><b>نموذج أولي</b><p>لن يُحذف أي شيء فعليًا في هذه النسخة.</p></div></div></div>
        <div class="modal-foot"><button class="btn btn-ghost" data-close>إلغاء</button><button class="btn btn-danger" data-close data-ok>${ic('trash')}حذف الحساب</button></div>`,
        bd => bd.querySelector('[data-ok]').addEventListener('click', () => toast('هذا إجراء تجريبي — لم يُحذف الحساب', { icon: 'info' })));
      // side-nav scroll spy
      const links = [...root.querySelectorAll('[data-sec]')];
      links.forEach(l => l.addEventListener('click', e => { e.preventDefault(); document.getElementById(l.dataset.sec).scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
      const io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.dataset.sec === en.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
      root.querySelectorAll('.psec').forEach(s => io.observe(s));
      this.unmount = () => io.disconnect();
    },
  };
})();
