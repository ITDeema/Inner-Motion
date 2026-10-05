/* Mock data for the prototype. Nothing here is a real, verified analysis. */
(function () {
  const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const MONTHS_SHORT = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];

  const user = {
    name: 'سارة العتيبي',
    first: 'سارة',
    initials: 'س',
    email: 'sara.alotaibi@example.com',
    phone: '+966 55 012 3456',
    role: 'architect', // architect | owner
    org: 'مكتب أفق للاستشارات الهندسية',
    city: 'الرياض',
    joined: 'مارس 2026',
  };

  /* Analyses history (newest first). `parcel` keys feed thumbnails and the map. */
  const analyses = [
    { id: 'a1427', parcel: '1427', plan: '3021', district: 'حي الملقا', city: 'الرياض', area: 1250, dims: '25 × 50 م', score: 78, date: '2026-10-05', status: 'done', seed: 3, facing: 'شمالية', corner: true },
    { id: 'a0233', parcel: '233', plan: '2840', district: 'حي النرجس', city: 'الرياض', area: 900, dims: '30 × 30 م', score: 84, date: '2026-10-03', status: 'done', seed: 7, facing: 'جنوبية', corner: false },
    { id: 'a0518', parcel: '518', plan: '2655', district: 'حي الياسمين', city: 'الرياض', area: 625, dims: '25 × 25 م', score: 71, date: '2026-10-01', status: 'review', note: 'القطعة قريبة من الحد الأدنى للارتدادات', seed: 11, facing: 'غربية', corner: false },
    { id: 'a0077', parcel: '77', plan: '3110', district: 'حي حطين', city: 'الرياض', area: 1800, dims: '36 × 50 م', score: 88, date: '2026-09-21', status: 'done', seed: 5, facing: 'شرقية', corner: true },
    { id: 'a1210', parcel: '1210', plan: '2977', district: 'حي العارض', city: 'الرياض', area: 450, dims: '18 × 25 م', score: 63, date: '2026-09-12', status: 'review', note: 'مساحة القطعة صغيرة نسبيًا لتطبيق التظليل الذاتي', seed: 2, facing: 'جنوبية', corner: false },
    { id: 'a0942', parcel: '942', plan: '2702', district: 'حي القيروان', city: 'الرياض', area: 720, dims: '24 × 30 م', score: 74, date: '2026-08-30', status: 'done', seed: 9, facing: 'شمالية', corner: false },
    { id: 'a0305', parcel: '305', plan: '1984', district: 'حي الصحافة', city: 'الرياض', area: 1000, dims: '25 × 40 م', score: 69, date: '2026-08-19', status: 'done', seed: 13, facing: 'غربية', corner: true },
    { id: 'a1431', parcel: '1431', plan: '3021', district: 'حي الملقا', city: 'الرياض', area: 1100, dims: '22 × 50 م', score: 80, date: '2026-08-05', status: 'done', seed: 4, facing: 'شمالية', corner: false },
  ];

  const saved = ['a1427', 'a0233', 'a0077', 'a0305'];

  /* Riyadh-like climate normals (illustrative). */
  const climate = {
    tmax: [20.2, 23.4, 27.6, 33.2, 39.1, 42.4, 43.6, 43.5, 40.5, 34.6, 26.9, 21.6],
    tmin: [8.4, 10.7, 14.6, 20.1, 25.5, 27.4, 29.0, 28.7, 25.9, 20.6, 14.4, 9.9],
    ghi: [4.3, 5.1, 5.7, 6.3, 7.1, 7.7, 7.5, 7.1, 6.5, 5.6, 4.6, 4.1], // kWh/m²/day
    rh: [43, 35, 30, 27, 17, 11, 11, 13, 14, 20, 34, 45],
  };

  /* Wind rose: 16 sectors from N clockwise; percentages per speed bin (m/s). */
  const DIRS = ['ش', 'ش ش ق', 'ش ق', 'ق ش ق', 'ق', 'ق ج ق', 'ج ق', 'ج ج ق', 'ج', 'ج ج غ', 'ج غ', 'غ ج غ', 'غ', 'غ ش غ', 'ش غ', 'ش ش غ'];
  const DIRS_FULL = ['شمالي', 'شمالي شمالي شرقي', 'شمالي شرقي', 'شرقي شمالي شرقي', 'شرقي', 'شرقي جنوبي شرقي', 'جنوبي شرقي', 'جنوبي جنوبي شرقي', 'جنوبي', 'جنوبي جنوبي غربي', 'جنوبي غربي', 'غربي جنوبي غربي', 'غربي', 'غربي شمالي غربي', 'شمالي غربي', 'شمالي شمالي غربي'];
  const windBins = ['0–2', '2–4', '4–6', '+6'];
  const wind = {
    annual: [
      [2.2, 3.4, 2.1, 0.9], [1.4, 2.0, 1.0, 0.3], [1.0, 1.4, 0.6, 0.2], [0.9, 1.2, 0.5, 0.1],
      [1.1, 1.6, 0.7, 0.2], [1.3, 2.1, 1.0, 0.3], [1.5, 2.4, 1.2, 0.4], [1.0, 1.5, 0.6, 0.2],
      [0.8, 1.0, 0.4, 0.1], [0.6, 0.8, 0.3, 0.1], [0.6, 0.9, 0.4, 0.1], [0.8, 1.2, 0.6, 0.2],
      [1.2, 2.0, 1.3, 0.5], [1.8, 3.2, 2.4, 1.0], [2.6, 4.6, 3.7, 1.8], [2.4, 4.1, 3.0, 1.3],
    ],
    summer: [
      [2.0, 3.6, 2.6, 1.3], [1.0, 1.6, 0.8, 0.2], [0.6, 0.9, 0.3, 0.1], [0.5, 0.7, 0.2, 0.1],
      [0.6, 0.8, 0.3, 0.1], [0.7, 1.0, 0.4, 0.1], [0.8, 1.2, 0.5, 0.1], [0.6, 0.8, 0.3, 0.1],
      [0.4, 0.6, 0.2, 0.1], [0.4, 0.5, 0.2, 0.1], [0.4, 0.6, 0.3, 0.1], [0.6, 1.0, 0.5, 0.2],
      [1.2, 2.2, 1.6, 0.7], [2.0, 3.8, 3.1, 1.5], [2.8, 5.4, 4.6, 2.6], [2.5, 4.6, 3.6, 1.8],
    ],
    winter: [
      [2.4, 3.2, 1.6, 0.6], [1.7, 2.3, 1.1, 0.3], [1.3, 1.8, 0.8, 0.2], [1.2, 1.6, 0.7, 0.2],
      [1.6, 2.4, 1.1, 0.3], [2.0, 3.2, 1.6, 0.5], [2.2, 3.6, 1.9, 0.7], [1.4, 2.2, 0.9, 0.3],
      [1.1, 1.4, 0.6, 0.2], [0.8, 1.0, 0.4, 0.1], [0.8, 1.1, 0.5, 0.1], [0.9, 1.3, 0.6, 0.2],
      [1.1, 1.7, 0.9, 0.3], [1.4, 2.4, 1.6, 0.6], [2.0, 3.4, 2.6, 1.0], [2.2, 3.4, 2.3, 0.9],
    ],
  };

  /* Façade indicators for the selected parcel. */
  const facades = {
    N: { name: 'الشمالية', rad: 1.9, shade: 68, open: 0.71, svf: 0.58, verdict: 'good', text: 'أقل الواجهات تعرضًا للشمس المباشرة، ومثالية للنوافذ الكبيرة والفراغات الرئيسية.' },
    E: { name: 'الشرقية', rad: 3.6, shade: 34, open: 0.48, svf: 0.62, verdict: 'warn', text: 'تعرّض صباحي مرتفع بزاوية منخفضة؛ تحتاج كاسرات رأسية أو مشربيات.' },
    S: { name: 'الجنوبية', rad: 3.1, shade: 41, open: 0.44, svf: 0.66, verdict: 'warn', text: 'شمس عالية في الصيف يسهل حجبها بكاسرات أفقية وبروزات بعمق 60–90 سم.' },
    W: { name: 'الغربية', rad: 4.2, shade: 22, open: 0.63, svf: 0.55, verdict: 'risk', text: 'الأكثر تعرضًا للإشعاع وقت الذروة الحرارية بعد الظهر؛ قلّل الفتحات واستخدم جدارًا معزولًا.' },
  };

  const factors = [
    { key: 'sun', name: 'التعرض الشمسي', score: 66, level: 'مرتفع', note: 'يتطلب معالجة تظليل للواجهتين الغربية والجنوبية' },
    { key: 'wind', name: 'التهوية الطبيعية', score: 84, level: 'جيدة', note: 'رياح شمالية غربية منتظمة تسمح بتهوية عابرة' },
    { key: 'heat', name: 'الراحة الحرارية', score: 68, level: 'متوسطة', note: 'صيف حار طويل وفترات مريحة في الربيع والخريف' },
    { key: 'ctx', name: 'البيئة المحيطة', score: 90, level: 'ممتازة', note: 'حديقة قريبة وكثافة بنائية منخفضة' },
    { key: 'light', name: 'الإضاءة الطبيعية', score: 94, level: 'ممتازة', note: 'سماء مفتوحة وانعدام عوائق مرتفعة' },
  ];

  const context = [
    { icon: 'trees', tone: 'veg', name: 'حديقة الحي', detail: 'على بعد 220 م جنوبًا · تلطّف الحرارة المحلية', badge: ['good', 'إيجابي'] },
    { icon: 'building', tone: 'ctx', name: 'المباني المجاورة', detail: 'ارتفاع متوسط دوران · لا تحجب الشمس الشتوية', badge: ['good', 'إيجابي'] },
    { icon: 'road', tone: 'ctx', name: 'طريق أنس بن مالك', detail: 'طريق رئيسي على بعد 480 م شمالًا · مصدر ضوضاء وحرارة', badge: ['warn', 'متوسط'] },
    { icon: 'dust', tone: 'ctx', name: 'الغبار والعواصف الترابية', detail: 'نشاط مرتفع بين مارس ومايو من الجهة الشمالية الغربية', badge: ['risk', 'مرتفع'] },
    { icon: 'mosque', tone: 'ctx', name: 'مسجد ومدرسة', detail: 'خلال 400 م سيرًا · خدمات يومية قريبة', badge: ['good', 'إيجابي'] },
  ];

  const regs = [
    ['نسبة البناء القصوى', '60%', '750 م²'],
    ['أقصى ارتفاع', 'أرضي + أول + ملحق', '12 م'],
    ['ارتداد الشارع', '1/5 عرض الشارع', '4 م شمالًا · 3 م غربًا'],
    ['ارتداد الجيران', '2 م', 'جنوبًا وشرقًا'],
  ];

  const recs = [
    {
      cat: 'التوجيه', icon: 'orient', title: 'وجّه الفراغات الرئيسية والمعيشة نحو الشمال، ومدّ المبنى على محور شرق–غرب.',
      why: 'الواجهة الشمالية تستقبل أقل إشعاع مباشر (1.9 ك.و.س/م² يوميًا) مع إضاءة طبيعية ثابتة طوال اليوم.',
      factor: 'sun', impact: 3, impactText: 'خفض الحمل الحراري حتى 15%', compliance: true,
      tech: 'نسبة الواجهة الطويلة إلى القصيرة 1.6:1 تقريبًا · زاوية انحراف مقبولة ±15° عن الشمال.',
    },
    {
      cat: 'التظليل', icon: 'shade', title: 'استخدم كاسرات رأسية ومشربيات على الواجهة الغربية، وبروزات أفقية على الجنوبية.',
      why: 'الواجهة الغربية الأعلى تعرضًا (4.2 ك.و.س/م² يوميًا) في وقت ذروة الحرارة بين 2 و5 مساءً.',
      factor: 'sun', impact: 3, impactText: 'خفض حرارة الأسطح حتى 8°م', compliance: true,
      tech: 'عمق بروز جنوبي 0.6–0.9 م · زاوية قطع 60° · كاسرات غربية بتباعد 30 سم.',
    },
    {
      cat: 'التهوية', icon: 'vent', title: 'ضع الفتحات على الواجهتين الشمالية الغربية والجنوبية الشرقية لتحقيق تهوية عابرة.',
      why: 'الرياح السائدة شمالية غربية بمتوسط 3.8 م/ث، وتهب بانتظام في الربيع والخريف.',
      factor: 'wind', impact: 2, impactText: 'ساعات تهوية طبيعية +420 ساعة/سنة', compliance: true,
      tech: 'نسبة فتحات المدخل إلى المخرج 1:1.25 · مرشحات غبار في الفتحات المواجهة للشمال الغربي.',
    },
    {
      cat: 'المساحات الخارجية', icon: 'garden', title: 'اجعل الحديقة والفناء في الجهة الشرقية والشمالية الشرقية من القطعة.',
      why: 'هذه المنطقة تقع في ظل المبنى بعد الظهر، وهي الأقل حرارة خلال ساعات الاستخدام المسائي.',
      factor: 'heat', impact: 2, impactText: 'ظل طبيعي 68% بعد الظهر', compliance: true,
      tech: 'مسطح أخضر ≥ 15% من المساحة المفتوحة · أشجار نفضية على الحد الغربي للفناء.',
    },
    {
      cat: 'الواجهات والنوافذ', icon: 'window', title: 'قلّل نسبة الزجاج في الواجهتين الغربية والجنوبية، واستخدم زجاجًا مزدوجًا عاكسًا.',
      why: 'كل متر مربع زجاج غربي يضيف حملًا حراريًا أعلى بثلاثة أضعاف تقريبًا من الزجاج الشمالي.',
      factor: 'heat', impact: 2, impactText: 'تحسين الراحة الحرارية الداخلية', compliance: true,
      tech: 'نسبة النوافذ إلى الجدار ≤ 25% غربًا و ≤ 40% شمالًا · SHGC ≤ 0.25 · U ≤ 1.9 واط/م²·ك.',
    },
    {
      cat: 'الحماية من الغبار', icon: 'dust', title: 'خصص سورًا نباتيًا أو جدارًا مصمتًا على الحد الشمالي الغربي.',
      why: 'العواصف الترابية الموسمية تأتي من نفس اتجاه الرياح المفيدة؛ الحاجز يرشّحها دون إغلاق التهوية.',
      factor: 'ctx', impact: 1, impactText: 'تقليل الغبار الداخل للفناء', compliance: true,
      tech: 'ارتفاع الحاجز 2.4–3 م · نفاذية 40–50% للحفاظ على حركة الهواء.',
    },
  ];

  const decisions = [
    { title: 'افتح المبنى على الشمال، وأغلقه نسبيًا على الغرب', text: 'ضع غرف المعيشة والنوافذ الكبيرة شمالًا، والخدمات والسلالم والمخازن غربًا كحاجز حراري.', factor: 'sun' },
    { title: 'ظلّل الواجهتين الغربية والجنوبية قبل أي قرار آخر', text: 'التظليل الخارجي هو أكبر أثر منفرد على الراحة الحرارية والاستهلاك في هذا الموقع.', factor: 'heat' },
    { title: 'استفد من الرياح الشمالية الغربية مع حماية من الغبار', text: 'فتحات متقابلة لتهوية عابرة في الربيع والخريف، مع حاجز نباتي يرشّح الغبار.', factor: 'wind' },
  ];

  const insights = [
    { tone: 'heat', icon: 'thermo', title: 'ذروة حرارية متوقعة هذا الأسبوع', text: 'درجات عظمى بين 38 و40°م في الرياض؛ الفترة المثالية لزيارة المواقع قبل 10 صباحًا.' },
    { tone: 'wind', icon: 'wind', title: 'بداية موسم الرياح الخريفية', text: 'الرياح الشمالية الغربية تزداد انتظامًا؛ فرصة جيدة لاختبار التهوية العابرة في مشاريعك.' },
    { tone: 'sun', icon: 'sun', title: 'الاعتدال الخريفي مضى قبل أسبوعين', text: 'زاوية الشمس الظهرية الآن 61° تقريبًا؛ البروزات الجنوبية بعمق 60 سم تظلل النوافذ بالكامل.' },
  ];

  const searchIndex = [
    { type: 'parcel', label: 'قطعة 1427 · مخطط 3021', sub: 'حي الملقا، الرياض', parcel: '1427' },
    { type: 'parcel', label: 'قطعة 1431 · مخطط 3021', sub: 'حي الملقا، الرياض', parcel: '1431' },
    { type: 'district', label: 'حي الملقا', sub: 'شمال الرياض' },
    { type: 'district', label: 'حي حطين', sub: 'شمال غرب الرياض' },
    { type: 'district', label: 'حي النرجس', sub: 'شمال الرياض' },
    { type: 'street', label: 'طريق أنس بن مالك', sub: 'حي الملقا، الرياض' },
  ];

  /* ---- Solar geometry (approximate, solar time) ---- */
  const LAT = 24.8187;
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;
  function sunPos(dayOfYear, hour, lat = LAT) {
    const decl = 23.44 * Math.sin(rad((360 / 365) * (284 + dayOfYear)));
    const H = 15 * (hour - 12);
    const sinAlt = Math.sin(rad(lat)) * Math.sin(rad(decl)) + Math.cos(rad(lat)) * Math.cos(rad(decl)) * Math.cos(rad(H));
    const alt = deg(Math.asin(sinAlt));
    let cosAz = (Math.sin(rad(decl)) - sinAlt * Math.sin(rad(lat))) / (Math.cos(rad(alt)) * Math.cos(rad(lat)));
    cosAz = Math.max(-1, Math.min(1, cosAz));
    let az = deg(Math.acos(cosAz));
    if (H > 0) az = 360 - az;
    return { alt, az };
  }

  /* Hourly temperature model for the thermal calendar. */
  function hourTemp(m, h) {
    const mean = (climate.tmax[m] + climate.tmin[m]) / 2;
    const amp = (climate.tmax[m] - climate.tmin[m]) / 2;
    return mean + amp * Math.cos((2 * Math.PI * (h - 15)) / 24);
  }
  const thermalBands = [
    { max: 16, key: 'cold', name: 'بارد' },
    { max: 21, key: 'cool', name: 'معتدل البرودة' },
    { max: 27, key: 'comfort', name: 'مريح' },
    { max: 32, key: 'warm', name: 'دافئ' },
    { max: 38, key: 'hot', name: 'حار' },
    { max: 99, key: 'vhot', name: 'شديد الحرارة' },
  ];
  function band(t) { return thermalBands.find(b => t < b.max); }
  function comfortShare() {
    let c = 0, hot = 0, cold = 0;
    for (let m = 0; m < 12; m++) for (let h = 0; h < 24; h++) {
      const k = band(hourTemp(m, h)).key;
      if (k === 'comfort') c++; else if (k === 'hot' || k === 'vhot' || k === 'warm') hot++; else cold++;
    }
    const n = 12 * 24;
    return { comfort: Math.round(c / n * 100), hot: Math.round(hot / n * 100), cold: Math.round(cold / n * 100) };
  }

  window.MOCK = {
    MONTHS, MONTHS_SHORT, DIRS, DIRS_FULL, windBins,
    user, analyses, saved, climate, wind, facades, factors, context, regs, recs, decisions, insights, searchIndex,
    sunPos, hourTemp, thermalBands, band, comfortShare, LAT,
    parcel: {
      id: '1427', plan: '3021', district: 'حي الملقا', city: 'الرياض', area: 1250, w: 25, d: 50,
      lat: 24.8187, lng: 46.6152, facing: 'شمالية', streetN: 20, streetW: 15, use: 'سكني — فلل', corner: true,
    },
  };
})();
