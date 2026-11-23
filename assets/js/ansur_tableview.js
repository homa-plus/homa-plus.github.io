(async function () {
  'use strict';
  const boot = document.getElementById('boot');
  const fail = (msg) => {
    if (!boot) return;
    boot.textContent = '';
    const d = document.createElement('div');
    d.className = 'alert alert-danger m-3 text-start';
    d.textContent = msg;
    boot.appendChild(d);
  };

  /* ===== ХУК МОДЕЛИ «Проверьте меня детально» — ПОКА ЗАГЛУШКА =====
     ctx = {
       fields: ['stature', ...],        // поля с введёнными значениями
       own:    { stature: 1475, ... },  // эти значения в единицах таблицы (мм и т.д.)
       rows:   [0, 5, 7, ...],          // индексы строк таблицы после всех фильтров
       model:  M                        // M.cols[field][i] — значение, M.sex[i] — 1=муж, 2=жен
     }
     onProgress(0..1) — для полосы прогресса (считать порциями, отдавая управление: await new Promise(r => setTimeout(r)))
     Вернуть { male: 0..1 } — вероятность «мальчик»; null — модель не подключена. */
  async function computeDetailed(ctx, onProgress) {
    return null;
  }

  try {
    const missing = [];
    if (typeof LoadANSUR !== 'function') missing.push('LoadANSUR() (assets/js/ansur_tables.js)');
    if (typeof PetiteVue === 'undefined') missing.push('petite-vue');
    if (typeof Chart === 'undefined') missing.push('Chart.js');
    if (missing.length) throw new Error('Не загружено: ' + missing.join(', '));

    const FM   = typeof fieldMappings    !== 'undefined' ? fieldMappings    : {};
    const SP   = typeof specialFields    !== 'undefined' ? specialFields    : {};
    const CATS = typeof categories       !== 'undefined' ? categories       : {};
    const CATM = typeof categoryMappings !== 'undefined' ? categoryMappings : {};
    const MOSM = typeof mappingsMOS      !== 'undefined' ? mappingsMOS      : {};

    const rows = await LoadANSUR();
    const M = AnsurLib.buildModel({ rows, FM, SP, CATS, CATM, MOSM });

    // ---------- состояние ----------
    const LS_KEY = 'ansur2.viewer.v1';
    const own = {}, bad = {}, nameSet = new Set();
    const cats = M.cats.map(c => ({ key: c.key, title: c.title, help: c.help, open: false, helpOpen: false, fields: c.fields }));
    for (const c of cats) for (const f of c.fields) { own[f.name] = ''; bad[f.name] = false; nameSet.add(f.name); }
    const fieldNames = [...nameSet];
    const defaults = {};     // «значения по умолчанию» = среднее по текущим фильтрам (показываются бледным placeholder)
    for (const f of fieldNames) defaults[f] = '';
    if (cats.length) cats[0].open = true;
    try {   // свои значения переживают перезагрузку страницы
      const j = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (j && j.own) for (const [k, v] of Object.entries(j.own)) if (k in own) own[k] = String(v);
    } catch (e) {}

    const ownRaw = {};       // разобранные значения (в единицах таблицы), не реактивные
    let idx = [];            // индексы строк после фильтров
    let chart = null;
    let timer = 0;
    let filterKey = null;    // снимок фильтров: средние и выборка пересчитываются только когда он изменился

    const S = PetiteVue.reactive({
      q: '',
      cats, own, bad, defaults,
      axes: [],
      filters: { age: '', sex: '', cls: '', ageBad: false, clsBad: false },
      multi: [
        { key: 'birth', title: 'Место рождения',  cols: false, open: false, search: '', selected: [], options: M.birthOptions },
        { key: 'mos',   title: 'Должность (код)', cols: true,  open: false, search: '', selected: [], options: M.mosOptions },
      ],
      filterText: '',
      statRows: [],
      summary: { total: M.N, shown: M.N, male: 0, female: 0 },
      ownFieldCount: 0,
      detail: { busy: false, progress: 0, text: '' },

      schedule, refresh, runDetail,

      // --- левая панель
      fieldVisible: (f) => {
        const q = S.q.trim().toLowerCase();
        return !q || (f.label + ' ' + f.en + ' ' + f.name).toLowerCase().includes(q);
      },
      catVisible: (cat) => cat.fields.some(f => S.fieldVisible(f)),
      catOwn: (cat) => cat.fields.filter(f => S.own[f.name] !== '').length,
      clearOwn: () => { for (const f of fieldNames) S.own[f] = ''; refresh(); },

      // --- оси графика
      axisLabel: (name) => { const i = S.axes.indexOf(name); return i === 0 ? 'X' : i === 1 ? 'Y' : '○'; },
      axisClass: (name) => { const i = S.axes.indexOf(name); return i === 0 ? 'btn-primary' : i === 1 ? 'btn-warning' : 'btn-outline-secondary'; },
      axisName: (i) => S.axes[i] ? M.labelOf(S.axes[i]) : '—',
      toggleAxis: (name) => {
        const i = S.axes.indexOf(name);
        if (i >= 0) S.axes.splice(i, 1);
        else { if (S.axes.length >= 2) S.axes.shift(); S.axes.push(name); }
        refresh();
      },
      swapAxes: () => { S.axes.reverse(); refresh(); },
      clearAxes: () => { S.axes.splice(0); refresh(); },

      // --- фильтры
      resetFilters: () => {
        S.filters.age = ''; S.filters.sex = ''; S.filters.cls = '';
        for (const m of S.multi) { m.selected.splice(0); m.search = ''; m.open = false; }
        refresh();
      },
      toggleMs: (m) => { for (const x of S.multi) x.open = x === m ? !x.open : false; },
      msVisible: (m) => {
        const q = m.search.trim().toLowerCase();
        return q ? m.options.filter(o => o.hay.includes(q)) : m.options;
      },
      msLabel: (m) => {
        const n = m.selected.length;
        if (!n) return 'Любое';
        return (n <= 3 ? m.selected.join(', ') : m.selected.slice(0, 3).join(', ') + '…') + '  (' + n + ')';
      },
      msToggle: (m, v) => {
        const i = m.selected.indexOf(v);
        if (i >= 0) m.selected.splice(i, 1); else m.selected.push(v);
        refresh();
      },
      msPickVisible: (m) => {
        for (const o of S.msVisible(m)) if (!m.selected.includes(o.value)) m.selected.push(o.value);
        refresh();
      },
      msClear: (m) => { m.selected.splice(0); refresh(); },
    });

    // ---------- расчёты ----------
    function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 120); }

    function parseAllOwn() {
      let cnt = 0;
      for (const f of fieldNames) {
        const v = M.parseOwn(f, S.own[f]);
        if (v === null) { ownRaw[f] = null; if (S.bad[f]) S.bad[f] = false; }
        else if (Number.isFinite(v)) { ownRaw[f] = v; cnt++; if (S.bad[f]) S.bad[f] = false; }
        else { ownRaw[f] = null; if (!S.bad[f]) S.bad[f] = true; }
      }
      S.ownFieldCount = cnt;
    }

    // 2.3 значения по умолчанию: среднее по выборке после фильтров (оба пола вместе, если фильтр «Оба»)
    function computeDefaults() {
      for (const f of fieldNames) {
        const v = M.fmtNum(f, AnsurLib.meanFor(M, idx, f));
        if (S.defaults[f] !== v) S.defaults[f] = v;
      }
    }

    // подпись «какие фильтры сейчас применены» (нераспознанные не применяются и не показываются)
    function describeFilters(F, r) {
      const list = (a) => a.length <= 3 ? a.join(', ') : a.slice(0, 3).join(', ') + ' +' + (a.length - 3);
      const p = [];
      if (r.ageOk && F.age.trim()) p.push('возраст ' + F.age.trim());
      if (F.sex) p.push('пол: ' + (F.sex === 'Male' ? 'мужской' : 'женский'));
      if (r.clsOk && F.cls.trim()) p.push('класс ' + F.cls.trim());
      if (F.birth.length) p.push('место рождения: ' + list(F.birth));
      if (F.mos.length) p.push('должности: ' + list(F.mos));
      return p.length ? p.join(' · ') : 'не заданы (вся таблица)';
    }

    function persist() {
      try {
        const o = {};
        for (const f of fieldNames) if (S.own[f]) o[f] = S.own[f];
        localStorage.setItem(LS_KEY, JSON.stringify({ own: o }));
      } catch (e) {}
    }

    function refresh() {
      clearTimeout(timer);
      parseAllOwn();

      const F = {
        age: S.filters.age, cls: S.filters.cls, sex: S.filters.sex,
        birth: [...S.multi[0].selected], mos: [...S.multi[1].selected],
      };
      const key = JSON.stringify(F);
      if (key !== filterKey) {            // фильтры изменились → новая выборка, новые средние
        filterKey = key;
        const r = AnsurLib.applyFilters(M, F);
        idx = r.idx;
        S.filters.ageBad = !r.ageOk;
        S.filters.clsBad = !r.clsOk;

        let m = 0, w = 0;
        for (const i of idx) { if (M.sex[i] === 1) m++; else if (M.sex[i] === 2) w++; }
        S.summary.shown = idx.length; S.summary.male = m; S.summary.female = w;
        S.filterText = describeFilters(F, r);
        computeDefaults();
      }

      // 4.3 средние (по выборке после фильтров): поля графика + поля с введёнными значениями
      const names = [...S.axes];
      for (const f of fieldNames) if (ownRaw[f] != null && !names.includes(f)) names.push(f);
      S.statRows = names.map(f => {
        const s = AnsurLib.statFor(M, idx, f);
        return {
          name: f, label: M.labelOf(f),
          male: M.fmt(f, s.male), female: M.fmt(f, s.female),
          own: ownRaw[f] != null ? M.fmt(f, ownRaw[f]) : '—',
          nm: s.nm, nw: s.nw,
        };
      });

      updateChart();
      persist();
    }

    // ---------- график ----------
    const ownGuides = {     // пунктир красным, если для одной оси своё значение есть, а для другой нет
      id: 'ownGuides',
      afterDatasetsDraw(c) {
        const o = c.$own;
        if (!o || ((o.x == null) === (o.y == null))) return;
        const { ctx, chartArea: a, scales } = c;
        ctx.save();
        ctx.beginPath(); ctx.rect(a.left, a.top, a.width, a.height); ctx.clip();
        ctx.strokeStyle = '#e11d2e'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
        ctx.beginPath();
        if (o.x != null) { const px = scales.x.getPixelForValue(o.x); ctx.moveTo(px, a.top); ctx.lineTo(px, a.bottom); }
        else             { const py = scales.y.getPixelForValue(o.y); ctx.moveTo(a.left, py); ctx.lineTo(a.right, py); }
        ctx.stroke();
        ctx.restore();
      },
    };

    function makeChart(canvas) {
      Chart.defaults.color = getComputedStyle(document.body).color;
      Chart.defaults.borderColor = 'rgba(128,128,128,.25)';
      const ds = (label, who, color, order) => ({
        label, who, data: [], order,
        backgroundColor: color, borderColor: 'rgba(0,0,0,0)',
        pointRadius: 2.6, pointHoverRadius: 5,
      });
      const own = ds('Моё значение', 'Моё', '#e11d2e', 0);
      own.borderColor = '#ffffff'; own.borderWidth = 2; own.pointRadius = 8; own.pointHoverRadius = 10;
      return new Chart(canvas, {
        type: 'scatter',
        data: { datasets: [
          ds('Мужской', '♂', 'rgba(59,130,246,.45)', 2),
          ds('Женский', '♀', 'rgba(236,72,153,.60)', 1),
          own,
        ] },
        options: {
          responsive: true, maintainAspectRatio: false, animation: false,
          interaction: { mode: 'nearest', intersect: true },
          scales: {
            x: { type: 'linear', title: { display: true, text: '' }, ticks: { callback: (v) => S.axes[0] ? M.tick(S.axes[0], v) : v } },
            y: { type: 'linear', title: { display: true, text: '' }, ticks: { callback: (v) => S.axes[1] ? M.tick(S.axes[1], v) : v } },
          },
          plugins: {
            legend: { position: 'top' },
            tooltip: { callbacks: {
              label: (c) => c.dataset.who + '  ' + M.fmt(S.axes[0], c.parsed.x) + ' · ' + M.fmt(S.axes[1], c.parsed.y),
            } },
          },
        },
        plugins: [ownGuides],
      });
    }

    function updateChart() {
      if (!chart) return;
      const fx = S.axes[0], fy = S.axes[1];
      const ready = !!(fx && fy);
      const d = ready ? AnsurLib.scatter(M, idx, fx, fy) : { male: [], female: [] };
      const ox = fx && ownRaw[fx] != null ? ownRaw[fx] : null;
      const oy = fy && ownRaw[fy] != null ? ownRaw[fy] : null;
      const dsets = chart.data.datasets;
      dsets[0].data = d.male;   dsets[0].label = 'Мужской (' + d.male.length + ')';
      dsets[1].data = d.female; dsets[1].label = 'Женский (' + d.female.length + ')';
      dsets[2].data = ready && ox != null && oy != null ? [{ x: ox, y: oy }] : [];
      chart.$own = ready ? { x: ox, y: oy } : null;
      chart.options.scales.x.title.text = fx ? M.axisTitle(fx) : '';
      chart.options.scales.y.title.text = fy ? M.axisTitle(fy) : '';
      chart.update('none');
    }

    // ---------- 4.4 кнопка «Проверьте меня детально» ----------
    async function runDetail() {
      if (S.detail.busy) return;
      S.detail.busy = true; S.detail.progress = 0; S.detail.text = '';
      try {
        refresh();
        const fields = fieldNames.filter(f => ownRaw[f] != null);
        const ctx = { fields, own: Object.fromEntries(fields.map(f => [f, ownRaw[f]])), rows: idx, model: M };
        const res = await computeDetailed(ctx, (p) => { S.detail.progress = Math.round(p * 100); });
        if (!res) {
          S.detail.text = 'computeDetailed пока не написан(';
        } else {
          const pm = Math.max(0, Math.min(1, res.male));
          const male = pm >= 0.5;
          S.detail.text = 'Вероятность что ты — ' + (male ? 'мальчик' : 'девочка') + ' — ' + Math.round((male ? pm : 1 - pm) * 100) + '%';
        }
      } catch (e) {
        S.detail.text = 'Ошибка расчёта: ' + (e && e.message || e);
      } finally {
        S.detail.busy = false;
      }
    }

    // закрыть выпадающие списки кликом мимо
    document.addEventListener('click', (e) => {
      if (!e.target.isConnected) return;
      if (!e.target.closest('.ms-wrap')) for (const m of S.multi) if (m.open) m.open = false;
    });

    PetiteVue.createApp(S).mount('#app');
    chart = makeChart(document.getElementById('chart'));
    refresh();
    if (boot) boot.remove();
  } catch (e) {
    console.error(e);
    fail('Не удалось запустить приложение: ' + (e && e.message || e));
  }
})();