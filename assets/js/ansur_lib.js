const AnsurLib = (() => {
  'use strict';

  const TRIM_TOTAL = 0.10;                      // доля исключений: по 5% с каждого края
  const round6 = x => Math.round(x * 1e6) / 1e6;
  const finiteOf = col => { const o = []; for (const v of col) if (v === v) o.push(v); return o; };

  function median(vals) {
    const n = vals.length;
    if (!n) return NaN;
    const a = Float64Array.from(vals).sort();
    return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
  }

  function trimmedMean(vals, total = TRIM_TOTAL) {
    const n = vals.length;
    if (!n) return NaN;
    const a = Float64Array.from(vals).sort();
    const k = Math.floor(n * total / 2);
    let s = 0;
    for (let i = k; i < n - k; i++) s += a[i];
    return s / (n - 2 * k);
  }

  /* Фильтр «от-до»:  "18:"  "18:25"  ":25"  "24"  "21;27"  (пусто — не важно) */
  function parseSpec(text) {
    const s = String(text ?? '').trim().replace(/,/g, '.');
    const bad = { ok: false, test: null };
    if (!s) return { ok: true, test: null };
    const rules = [];
    for (const raw of s.split(';')) {
      const p = raw.trim();
      if (!p) continue;
      if (p.includes(':')) {
        const parts = p.split(':');
        if (parts.length !== 2) return bad;
        const a = parts[0].trim(), b = parts[1].trim();
        const lo = a === '' ? -Infinity : Number(a);
        const hi = b === '' ? Infinity : Number(b);
        if (Number.isNaN(lo) || Number.isNaN(hi)) return bad;
        if (lo === -Infinity && hi === Infinity) return bad;
        if (lo > hi) return bad;
        rules.push(v => v >= lo && v <= hi);
      } else {
        const n = Number(p);
        if (!Number.isFinite(n)) return bad;
        rules.push(v => Math.abs(v - n) < 1e-9);
      }
    }
    if (!rules.length) return { ok: true, test: null };
    return { ok: true, test: v => Number.isFinite(v) && rules.some(r => r(v)) };
  }

  /* Ввод своего значения → число в единицах таблицы.
     null — пусто, NaN — не разобрать.  "14.7" = 14 см 7 мм; допустимы суффиксы см / мм / м. */
  function parseOwn(text, unit) {
    const s = String(text ?? '').trim().replace(',', '.').toLowerCase();
    if (!s) return null;
    const m = /^(-?\d+(?:\.\d+)?|-?\.\d+)\s*(см|cm|мм|mm|м|m|кг|kg)?$/.exec(s);
    if (!m) return NaN;
    const n = parseFloat(m[1]);
    const sfx = m[2] || '';
    if (!sfx) return round6(n * unit.per);
    if (unit.mm) {
      if (sfx === 'см' || sfx === 'cm') return round6(n * unit.per);
      if (sfx === 'мм' || sfx === 'mm') return round6(n / 10 * unit.per);
      if (sfx === 'м'  || sfx === 'm')  return round6(n * 100 * unit.per);
      return NaN;
    }
    if (unit.suffix && (sfx === unit.suffix || (unit.suffix === 'кг' && sfx === 'kg'))) return round6(n * unit.per);
    return NaN;
  }

  /* Расшифровка кода должности:
       3 символа — ищем «NNL» в mappingsMOS[NN][L]; нет в маппингах → default.3
       4 символа — только по длине → default.4 */
  function mosInfo(MOSM, code) {
    const L = code.length;
    if (L === 3) {
      const hit = MOSM[code.slice(0, 2)]?.[code.slice(2)];
      if (hit && typeof hit === 'object') return { info: hit, def: false };
    }
    const d = MOSM.default;
    const info = d ? (d[L] ?? d[String(L)] ?? null) : null;
    return { info, def: true };
  }

  function buildModel({ rows, FM = {}, SP = {}, CATS = {}, CATM = {}, MOSM = {} }) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('LoadANSUR() вернула пустой результат');
    const N = rows.length;

    const kmap = {};
    for (const k of Object.keys(rows[0])) kmap[k.toLowerCase()] = k;
    const keyOf = n => kmap[String(n).toLowerCase()];

    const numCol = (name) => {
      const a = new Float64Array(N).fill(NaN);
      const k = keyOf(name);
      if (!k) return a;
      for (let i = 0; i < N; i++) {
        const v = rows[i][k];
        const n = typeof v === 'number' ? v : parseFloat(v);
        if (Number.isFinite(n)) a[i] = n;
      }
      return a;
    };
    const strCol = (name) => {
      const a = new Array(N).fill('');
      const k = keyOf(name);
      if (!k) return a;
      for (let i = 0; i < N; i++) { const v = rows[i][k]; a[i] = v == null ? '' : String(v).trim(); }
      return a;
    };

    // --- персональные поля (в панели не показываются, нужны для фильтров)
    const gender = strCol('gender');
    const sex = new Uint8Array(N);                     // 1 — Male, 2 — Female
    for (let i = 0; i < N; i++) { const g = gender[i].toLowerCase()[0]; sex[i] = g === 'm' ? 1 : g === 'f' ? 2 : 0; }
    const age   = numCol('age');
    const mos   = strCol('primarymos');
    const birth = strCol('subjectsbirthlocation');

    // --- класс нагрузки по коду должности
    const cls = new Float64Array(N).fill(NaN);
    const cache = new Map();
    for (let i = 0; i < N; i++) {
      let r = cache.get(mos[i]);
      if (!r) { r = mosInfo(MOSM, mos[i]); cache.set(mos[i], r); }
      const c = r.info?.class;
      if (c != null && Number.isFinite(Number(c))) cls[i] = Number(c);
    }

    // --- измеряемые поля по категориям (personal скрыта; numeric:false — не измерения)
    const cols = {};
    const catsRaw = [];
    for (const key of Object.keys(CATS)) {
      if (key === 'personal') continue;
      const names = (CATS[key] || []).filter(f => SP[f]?.numeric !== false);
      const ok = [];
      for (const f of names) {
        if (!cols[f]) cols[f] = numCol(f);
        if (finiteOf(cols[f]).length) ok.push(f);
      }
      if (ok.length) catsRaw.push({ key, names: ok });
    }

    // --- единицы: рост/длины в мм → показываем в см; вес в 0,1 кг → кг.
    //     Автоопределение, на случай если таблица уже в см / кг.
    const stat = cols.stature || numCol('stature');
    const statVals = finiteOf(stat);
    const mmData = statVals.length ? median(statVals) > 500 : true;
    const wk = cols.weightkg || numCol('weightkg');
    const wkVals = finiteOf(wk);
    const weightTenths = wkVals.length ? median(wkVals) > 250 : mmData;

    const unitCache = {};
    function unitOf(f) {
      return unitCache[f] ??= f === 'weightkg' ? { per: weightTenths ? 10 : 1, suffix: 'кг', mm: false }
        : SP[f]                                ? { per: 1, suffix: '', plain: true }
        :                                        { per: mmData ? 10 : 1, suffix: 'см', mm: true };
    }
    const labelOf = f => SP[f]?.ru || FM[f]?.ru || f;
    const enOf    = f => SP[f]?.en || FM[f]?.en || '';
    const axisTitle = f => labelOf(f) + (unitOf(f).suffix ? ', ' + unitOf(f).suffix : '');

    // Формат вывода: 14.7см
    function fmt(f, raw) {
      if (raw == null || !Number.isFinite(raw)) return '—';
      const u = unitOf(f);
      if (u.plain) return String(+raw.toFixed(1));
      return (raw / u.per).toFixed(1) + u.suffix;
    }
    const tick = (f, raw) => +(raw / unitOf(f).per).toFixed(1);
    // то же, что fmt, но без единицы — для подсказок в полях ввода (единица уже стоит рядом с полем)
    function fmtNum(f, raw) {
      if (raw == null || !Number.isFinite(raw)) return '—';
      const u = unitOf(f);
      return u.plain ? String(+raw.toFixed(1)) : (raw / u.per).toFixed(1);
    }

    const cats = catsRaw.map(c => {
      const cm = CATM[c.key] || {};
      const h = cm.help || null;
      const help = h && (h.ru || h.en || h.url || h.image)
        ? { text: h.ru || h.en || '', url: h.url || null, image: h.image || null } : null;
      return {
        key: c.key,
        title: cm.ru || cm.en || c.key,
        help,
        fields: c.names.map(f => ({
          name: f, label: labelOf(f), en: enOf(f),
          suffix: unitOf(f).suffix,
        })),
      };
    });

    // --- варианты для выпадающих списков
    const mosCount = new Map();
    for (const c of mos) if (c) mosCount.set(c, (mosCount.get(c) || 0) + 1);
    const seen = new Set();
    const mosOptions = [];
    const addMos = (code) => {
      if (seen.has(code)) return;
      seen.add(code);
      const r = mosInfo(MOSM, code);
      const title = r.info?.ru || r.info?.en || 'без расшифровки';
      const c = r.info?.class;
      mosOptions.push({
        value: code, code, title, label: code + ' — ' + title,
        cls: c != null && Number.isFinite(Number(c)) ? Number(c) : null,
        def: r.def, n: mosCount.get(code) || 0,
        hay: (code + ' ' + title + ' ' + (r.info?.en || '')).toLowerCase(),
      });
    };
    for (const p of Object.keys(MOSM)) {
      if (p === 'default') continue;
      const sub = MOSM[p];
      if (!sub || typeof sub !== 'object') continue;
      for (const s of Object.keys(sub)) addMos(p + s);
    }
    for (const code of mosCount.keys()) addMos(code);      // коды из данных, которых нет в маппингах → default
    mosOptions.sort((a, b) => (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));

    const birthCount = new Map();
    for (const b of birth) if (b) birthCount.set(b, (birthCount.get(b) || 0) + 1);
    const birthSet = new Set([...(SP.subjectsbirthlocation?.values || []).map(String), ...birthCount.keys()]);
    const birthOptions = [...birthSet].filter(Boolean).sort((a, b) => a.localeCompare(b)).map(v => ({
      value: v, code: '', title: v, label: v, cls: null, def: false, n: birthCount.get(v) || 0, hay: v.toLowerCase(),
    }));

    return {
      N, cols, sex, age, cls, mos, birth, cats, mosOptions, birthOptions,
      mmData, weightTenths, unitOf, labelOf, axisTitle, fmt, fmtNum, tick,
      parseOwn: (f, text) => parseOwn(text, unitOf(f)),
    };
  }

  /* Фильтры → индексы строк.  F = {age, sex:''|'Male'|'Female', cls, birth:[], mos:[]} */
  function applyFilters(M, F) {
    const ageS = parseSpec(F.age), clsS = parseSpec(F.cls);
    const ageT = ageS.test, clsT = clsS.test;
    const birthSet = F.birth && F.birth.length ? new Set(F.birth) : null;
    const mosSet   = F.mos && F.mos.length ? new Set(F.mos) : null;
    const want = F.sex === 'Male' ? 1 : F.sex === 'Female' ? 2 : 0;
    const idx = [];
    for (let i = 0; i < M.N; i++) {
      if (want && M.sex[i] !== want) continue;
      if (ageT && !ageT(M.age[i])) continue;
      if (clsT && !clsT(M.cls[i])) continue;
      if (birthSet && !birthSet.has(M.birth[i])) continue;
      if (mosSet && !mosSet.has(M.mos[i])) continue;
      idx.push(i);
    }
    return { idx, ageOk: ageS.ok, clsOk: clsS.ok };
  }

  /* Средние м/ж (усечённые) по полю для отфильтрованных строк */
  function statFor(M, idx, f) {
    const col = M.cols[f];
    const m = [], w = [];
    for (const i of idx) {
      const v = col[i];
      if (v !== v) continue;
      const s = M.sex[i];
      if (s === 1) m.push(v); else if (s === 2) w.push(v);
    }
    return { male: trimmedMean(m), female: trimmedMean(w), nm: m.length, nw: w.length };
  }

  /* Среднее (усечённое) по полю для всех отфильтрованных строк — оба пола вместе.
     Если фильтр оставил один пол, это среднее именно по нему. */
  function meanFor(M, idx, f) {
    const col = M.cols[f];
    const v = [];
    for (const i of idx) { const x = col[i]; if (x === x) v.push(x); }
    return trimmedMean(v);
  }

  function scatter(M, idx, fx, fy) {
    const cx = M.cols[fx], cy = M.cols[fy];
    const male = [], female = [];
    for (const i of idx) {
      const x = cx[i], y = cy[i];
      if (x !== x || y !== y) continue;
      const s = M.sex[i];
      if (s === 1) male.push({ x, y }); else if (s === 2) female.push({ x, y });
    }
    return { male, female };
  }

  return { TRIM_TOTAL, median, trimmedMean, parseSpec, parseOwn, mosInfo, buildModel, applyFilters, statFor, meanFor, scatter };
})();