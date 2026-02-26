import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

const DAY_START_HOUR = 7;
const DAY_END_HOUR   = 19;
const TOTAL_MINUTES  = (DAY_END_HOUR - DAY_START_HOUR) * 60;

const DAYS = [
  { key: 'Senin',  label: 'Senin'  },
  { key: 'Selasa', label: 'Selasa' },
  { key: 'Rabu',   label: 'Rabu'   },
  { key: 'Kamis',  label: 'Kamis'  },
  { key: 'Jumat',  label: 'Jumat'  },
];

// K = Kuliah, P = Praktikum, R = Responsi
function getClassTypeStyle(code) {
  const prefix = code.charAt(0).toUpperCase();
  if (prefix === 'K') return { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A', badge: '#3B82F6', label: 'KULIAH' };
  if (prefix === 'P') return { bg: '#FEF08A', border: '#CA8A04', text: '#713F12', badge: '#CA8A04', label: 'PRAKTIKUM' };
  if (prefix === 'R') return { bg: '#FEE2E2', border: '#EF4444', text: '#7F1D1D', badge: '#EF4444', label: 'RESPONSI' };
  return               { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151', badge: '#9CA3AF', label: '' };
}

const toMinutes      = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTopPct       = m => ((m - DAY_START_HOUR * 60) / TOTAL_MINUTES) * 100;
const toDurationPct  = m => (m / TOTAL_MINUTES) * 100;

const HOUR_TICKS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => {
  const hour = DAY_START_HOUR + i;
  return {
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    pct: toTopPct(hour * 60),
    isFirst: i === 0,
    isLast: i === DAY_END_HOUR - DAY_START_HOUR,
  };
});

const IconMonitor = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/>
  </svg>
);

// inline semua computed style biar SVG-nya ga perlu bergantung ke stylesheet luar
function inlineStyles(liveNode, cloneNode) {
  if (liveNode.nodeType !== Node.ELEMENT_NODE) return;
  const cs = window.getComputedStyle(liveNode);
  let css = '';
  for (const p of cs) { const v = cs.getPropertyValue(p); if (v) css += `${p}:${v};`; }
  cloneNode.style.cssText = css;
  cloneNode.removeAttribute('class');
  for (let i = 0; i < liveNode.children.length; i++)
    inlineStyles(liveNode.children[i], cloneNode.children[i]);
}

// ambil snapshot DOM kartu, dijadiin string SVG pake foreignObject
function cardToSVG(cardEl) {
  const rect = cardEl.getBoundingClientRect();
  const w    = Math.round(rect.width);
  const h    = Math.round(rect.height);

  const clone = cardEl.cloneNode(true);
  inlineStyles(cardEl, clone);

  clone.querySelectorAll('*').forEach(el => {
    el.style.transition  = 'none';
    el.style.animation   = 'none';
    el.style.willChange  = 'auto';
    if (el.style.position === 'fixed' || el.style.position === 'sticky')
      el.style.position = 'absolute';
  });

  clone.querySelector('[data-export-exclude]')?.remove();
  Object.assign(clone.style, {
    width: `${w}px`, height: `${h}px`,
    overflow: 'hidden', position: 'relative', left: '0', top: '0',
  });

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" `
       + `width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
       + `<foreignObject width="${w}" height="${h}">`
       + `<div xmlns="http://www.w3.org/1999/xhtml">${clone.outerHTML}</div>`
       + `</foreignObject></svg>`,
    w, h,
  };
}

function dlBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  URL.revokeObjectURL(url);
}

function exportSVG(svgStr, name) {
  dlBlob(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), name);
}

function wrapPortraitSVG(svg, cardW, cardH) {
  const CW = 1080, CH = 1920;
  const scale = CW / cardW;
  const drawH = Math.round(cardH * scale);
  const drawY = Math.round((CH - drawH) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" `
       + `width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">`
       + `<rect width="${CW}" height="${CH}" fill="#fff"/>`
       + `<g transform="translate(0,${drawY}) scale(${scale})">${svg}</g>`
       + `</svg>`;
}

function exportJPG(svgStr, outW, outH, name) {
  const img = new Image();
  img.onload = () => {
    const canvas = Object.assign(document.createElement('canvas'), { width: outW, height: outH });
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(img, 0, 0, outW, outH);
    try {
      canvas.toBlob(b => dlBlob(b, name), 'image/jpeg', 0.93);
    } catch {
      // fallback ke SVG kalau canvas kena taint, biasanya gara-gara CORS
      exportSVG(svgStr, name.replace(/\.jpg$/, '.svg'));
    }
  };
  img.onerror = () => console.error('SVG rasterise failed');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
}

export default function ScheduleGraphModal({
  isOpen, onClose, enrollments = [], parallelClasses = [], currentUser = null,
}) {
  const [isClosing,  setIsClosing]  = useState(false);
  const [exporting,  setExporting]  = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  const cardRef        = useRef(null);
  const exportBtnRef   = useRef(null);
  const exportPanelRef = useRef(null); // pisah ref biar proximity check bisa ngecek panel + tombol sekaligus

  // tooltip ngikutin mouse pake lerp biar geraknya ga kaku
  const [tooltipData,    setTooltipData]    = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const mousePos    = useRef({ x: 0, y: 0 });
  const tooltipPos  = useRef({ x: 0, y: 0 });
  const rafRef      = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    const lerp = (a, b) => a + (b - a) * 0.2;
    const tick = () => {
      if (!initialized.current) {
        tooltipPos.current = { ...mousePos.current };
        initialized.current = true;
      } else {
        tooltipPos.current.x = lerp(tooltipPos.current.x, mousePos.current.x);
        tooltipPos.current.y = lerp(tooltipPos.current.y, mousePos.current.y);
      }
      document.getElementById('sched-tip')?.style.setProperty(
        'transform', `translate(${tooltipPos.current.x + 15}px,${tooltipPos.current.y + 15}px)`
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    if (tooltipData) {
      requestAnimationFrame(() => setTooltipVisible(true));
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setTooltipVisible(false);
      initialized.current = false;
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [tooltipData]);

  // tutup dropdown kalau mouse udah kabur dari tombol dan panel
  useEffect(() => {
    if (!exportOpen) return;
    const PROX = 32;
    const handle = e => {
      const els    = [exportBtnRef.current, exportPanelRef.current].filter(Boolean);
      const inside = els.some(el => {
        const r = el.getBoundingClientRect();
        return Math.max(r.left - e.clientX, e.clientX - r.right, 0) <= PROX
            && Math.max(r.top  - e.clientY, e.clientY - r.bottom, 0) <= PROX;
      });
      if (!inside) setExportOpen(false);
    };
    document.addEventListener('mousemove', handle);
    return () => document.removeEventListener('mousemove', handle);
  }, [exportOpen]);

  const mySchedule = useMemo(() => {
    if (!currentUser) return [];
    const enrolled = new Set(
      enrollments.filter(e => e.nim === currentUser.nim).map(e => e.parallelClassId)
    );
    return parallelClasses.filter(pc => enrolled.has(pc.id));
  }, [enrollments, parallelClasses, currentUser]);

  const scheduleByDay = useMemo(() => {
    const map = {};
    DAYS.forEach(d => { map[d.key] = []; });
    mySchedule.forEach(pc => { if (map[pc.day]) map[pc.day].push(pc); });
    return map;
  }, [mySchedule]);

  const presentTypes = useMemo(() => {
    const seen = new Set(mySchedule.map(pc => pc.classCode[0].toUpperCase()));
    return ['K', 'P', 'R'].filter(p => seen.has(p));
  }, [mySchedule]);

  const capture = useCallback(() => cardToSVG(cardRef.current), []);

  // double rAF biar state `exporting` kebaca pas render udah jalan
  const doExport = useCallback((key, fn) => {
    setExporting(key);
    requestAnimationFrame(() => requestAnimationFrame(() => { fn(); setExporting(null); }));
  }, []);

  const handleExportSVG = useCallback(() => doExport('svg', () => {
    const r = capture();
    if (r) exportSVG(r.svg, 'jadwal.svg');
  }), [capture, doExport]);

  const handleExportJPG = useCallback(() => doExport('jpg', () => {
    const r = capture();
    if (r) exportJPG(r.svg, r.w * 3, r.h * 3, 'jadwal.jpg');
  }), [capture, doExport]);

  const handleExportPortrait = useCallback(() => doExport('portrait', () => {
    const r = capture();
    if (!r) return;
    const CW = 1080, CH = 1920;
    const drawH = Math.round(r.h * (CW / r.w));
    const drawY = Math.round((CH - drawH) / 2);
    const img   = new Image();
    img.onload = () => {
      const canvas = Object.assign(document.createElement('canvas'), { width: CW, height: CH });
      const ctx    = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CW, CH);
      ctx.drawImage(img, 0, drawY, CW, drawH);
      try {
        canvas.toBlob(b => dlBlob(b, 'jadwal-portrait.jpg'), 'image/jpeg', 0.93);
      } catch {
        exportSVG(wrapPortraitSVG(r.svg, r.w, r.h), 'jadwal-portrait.svg');
      }
    };
    img.onerror = () => console.error('SVG rasterise failed');
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(r.svg);
  }), [capture, doExport]);

  if (!isOpen) return null;

  const hasSchedule = mySchedule.length > 0;
  const busy        = exporting !== null;

  const handleClose = () => {
    setTooltipData(null);
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 150);
  };

  const exportItems = [
    { key: 'svg',      label: 'SVG', sub: 'Landscape', icon: <IconMonitor />, fn: handleExportSVG      },
    { key: 'jpg',      label: 'JPG', sub: 'Landscape', icon: <IconMonitor />, fn: handleExportJPG      },
    { key: 'portrait', label: 'JPG', sub: 'Portrait',  icon: <IconPhone />,   fn: handleExportPortrait },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        onClick={handleClose}
        onMouseMove={e => { mousePos.current = { x: e.clientX, y: e.clientY }; }}
      >
        <div className="relative w-full max-w-4xl" style={{ height: '80vh' }}>

          <button
            onClick={handleClose}
            disabled={isClosing}
            aria-label="Tutup modal"
            style={{ fontFamily: '"JetBrains Mono", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            className="absolute -top-6.5 -right-6 z-10 w-8 h-8 flex items-center justify-center text-white active:scale-50 hover:scale-120 transition-transform duration-60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-2xl leading-none font-light">✕</span>
          </button>

          <div
            ref={cardRef}
            className={`bg-white rounded-lg shadow-2xl flex flex-col w-full overflow-hidden h-full ${isClosing ? 'animate-popDown' : 'animate-popUp'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div>
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">JADWAL KULIAH</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{currentUser?.name || '-'} · {mySchedule.length} kelas</p>
              </div>

              <div className="relative" data-export-exclude>
                <button
                  ref={exportBtnRef}
                  onClick={() => setExportOpen(p => !p)}
                  disabled={!hasSchedule || busy}
                  aria-haspopup="true"
                  aria-expanded={exportOpen}
                  className="flex items-center gap-2 px-2.5 h-8 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span className="text-[11px] font-bold text-gray-900">EXPORT</span>
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-gray-400 transition-transform duration-300 ${exportOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                <div
                  ref={exportPanelRef}
                  role="menu"
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
                  style={{
                    display: 'grid',
                    gridTemplateRows: exportOpen ? '1fr' : '0fr',
                    opacity: exportOpen ? 1 : 0,
                    pointerEvents: exportOpen ? 'auto' : 'none',
                    transition: 'grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Format</p>
                    </div>
                    <div className="py-1">
                      {exportItems.map(({ key, label, sub, icon, fn }) => (
                        <button
                          key={key}
                          role="menuitem"
                          onClick={() => { fn(); setExportOpen(false); }}
                          disabled={busy}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2.5 focus:outline-none focus-visible:bg-gray-50 disabled:opacity-40"
                        >
                          <span className="flex-shrink-0 w-4 flex items-center justify-center text-gray-400">
                            {icon}
                          </span>
                          {exporting === key ? (
                            <span className="text-[11px] font-bold text-gray-500">Exporting…</span>
                          ) : (
                            <span className="flex items-baseline gap-1.5">
                              <span className="text-[11px] font-bold text-gray-800">{label}</span>
                              <span className="text-[10px] text-gray-400">{sub}</span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid jadwal */}
            <div className="flex flex-1 min-h-0 overflow-hidden p-3 pb-4 gap-2">
              {!hasSchedule ? (
                <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">Tidak ada jadwal.</div>
              ) : (
                <>
                  {/* Sumbu waktu */}
                  <div className="flex-shrink-0 w-14 flex flex-col">
                    <div className="flex-shrink-0 h-9" />
                    <div className="relative flex-1" style={{ paddingTop: 8, paddingBottom: 8 }}>
                      {HOUR_TICKS.map(({ hour, label, pct, isFirst, isLast }) => (
                        <div
                          key={hour}
                          className="absolute w-full flex justify-end pr-2"
                          style={isFirst ? { top: 0 } : isLast ? { bottom: 0 } : { top: `${pct}%`, transform: 'translateY(-50%)' }}
                        >
                          <span className="text-[10px] text-gray-400 font-mono leading-none whitespace-nowrap">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kolom per hari */}
                  <div className="flex flex-1 min-w-0 divide-x divide-gray-200 overflow-hidden border border-gray-200 rounded-sm">
                    {DAYS.map(({ key, label }) => {
                      const dayClasses = scheduleByDay[key] || [];
                      return (
                        <div key={key} className="flex-1 min-w-0 flex flex-col overflow-hidden">
                          <div className="flex-shrink-0 h-9 flex items-center justify-center border-b border-gray-200 bg-gray-50">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${dayClasses.length ? 'text-gray-800' : 'text-gray-400'}`}>
                              {label}
                            </span>
                          </div>
                          <div className="relative flex-1">
                            {/* garis tiap jam */}
                            {HOUR_TICKS.filter(t => !t.isFirst && !t.isLast).map(({ hour, pct }) => (
                              <div key={hour} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${pct}%` }} />
                            ))}
                            {/* garis tiap setengah jam, putus-putus */}
                            {HOUR_TICKS.slice(0, -1).map(({ hour }) => (
                              <div
                                key={`${hour}h`}
                                className="absolute left-0 right-0"
                                style={{ top: `${toTopPct(hour * 60 + 30)}%`, borderTop: '1px dashed #F0F0F0' }}
                              />
                            ))}
                            {dayClasses.map(pc => {
                              const s       = getClassTypeStyle(pc.classCode);
                              const topPct  = toTopPct(toMinutes(pc.timeStart));
                              const hPct    = toDurationPct(toMinutes(pc.timeEnd) - toMinutes(pc.timeStart));
                              const isFull  = hPct >= 15;
                              const isShort = hPct >= 8;
                              const isTiny  = hPct >= 3;
                              return (
                                <div
                                  key={pc.id}
                                  className="absolute cursor-default select-none rounded"
                                  style={{
                                    top: `calc(${topPct}% + 2px)`, height: `calc(${hPct}% - 4px)`,
                                    left: '4px', right: '4px', minHeight: '5px',
                                    backgroundColor: s.bg, borderLeft: `3px solid ${s.border}`, color: s.text,
                                    zIndex: tooltipData?.id === pc.id ? 20 : 10,
                                  }}
                                  onMouseEnter={() => setTooltipData(pc)}
                                  onMouseLeave={() => setTooltipData(null)}
                                >
                                  {/* isi blok nyesuain seberapa tinggi ruangnya */}
                                  {!isTiny && (
                                    <div
                                      className="absolute whitespace-nowrap font-bold leading-none overflow-visible"
                                      style={{ left: 5, top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }}
                                    >
                                      {pc.classCode}
                                    </div>
                                  )}
                                  {isTiny && !isShort && (
                                    <div className="flex items-center h-full overflow-hidden px-1.5">
                                      <span className="font-semibold leading-tight truncate" style={{ fontSize: '11px' }}>
                                        {pc.courseName || pc.courseCode}
                                      </span>
                                    </div>
                                  )}
                                  {isShort && !isFull && (
                                    <div className="relative flex flex-col justify-between h-full overflow-hidden px-1.5 py-1">
                                      <span
                                        className="absolute font-bold rounded px-1 py-0.5 whitespace-nowrap"
                                        style={{ fontSize: '9px', background: s.badge, color: '#fff', top: 4, right: 3 }}
                                      >
                                        {pc.classCode}
                                      </span>
                                      <div className="font-semibold leading-tight pr-8 truncate" style={{ fontSize: '11px' }}>
                                        {pc.courseName || pc.courseCode}
                                      </div>
                                      <div className="opacity-55 leading-none truncate" style={{ fontSize: '10px' }}>
                                        {pc.timeStart}–{pc.timeEnd}
                                      </div>
                                    </div>
                                  )}
                                  {isFull && (
                                    <div className="relative flex flex-col h-full overflow-hidden px-1.5 py-1.5">
                                      <span
                                        className="absolute font-bold rounded px-1 py-0.5 whitespace-nowrap"
                                        style={{ fontSize: '9px', background: s.badge, color: '#fff', top: 5, right: 4 }}
                                      >
                                        {pc.classCode}
                                      </span>
                                      <div className="font-semibold leading-tight pr-10 truncate" style={{ fontSize: '12px' }}>
                                        {pc.courseName || pc.courseCode}
                                      </div>
                                      <div className="opacity-55 truncate mt-0.5" style={{ fontSize: '10px' }}>{pc.courseCode}</div>
                                      <div className="opacity-55 mt-auto leading-none truncate" style={{ fontSize: '10px' }}>
                                        {pc.timeStart}–{pc.timeEnd}{pc.room ? ` · ${pc.room}` : ''}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* footer, ga ikut di-export */}
            <div data-export-exclude className="px-5 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
              <p className="text-[11px] text-gray-400">Jadwal diperbarui otomatis setelah pertukaran berhasil.</p>
              <div className="flex items-center gap-4">
                {presentTypes.map(p => {
                  const s = getClassTypeStyle(`${p}1`);
                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm border-2" style={{ backgroundColor: s.bg, borderColor: s.border }} />
                      <span className="text-[11px] font-bold text-gray-600">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* tooltip ngambang */}
      {tooltipData && (
        <div
          id="sched-tip"
          className="fixed pointer-events-none z-[99999]"
          style={{ opacity: tooltipVisible ? 1 : 0, transition: 'opacity .15s', willChange: 'transform' }}
        >
          <div className="bg-gray-900 text-white text-[11px] px-3 py-2 rounded shadow-xl whitespace-nowrap">
            <div className="font-bold mb-1" style={{ fontSize: '12px' }}>{tooltipData.courseName || tooltipData.courseCode}</div>
            <div className="text-gray-300">{tooltipData.courseCode} · {tooltipData.classCode}</div>
            <div className="text-gray-400 mt-1">{tooltipData.timeStart} – {tooltipData.timeEnd}</div>
            {tooltipData.room && <div className="text-gray-400">{tooltipData.room}</div>}
            <div className="text-gray-500 mt-0.5">{tooltipData.day}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes popUp   { from { transform: scale(.96); opacity: 0 } to { transform: scale(1);   opacity: 1 } }
        @keyframes popDown { from { transform: scale(1);   opacity: 1 } to { transform: scale(.96); opacity: 0 } }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        .animate-popUp    { animation: popUp   .15s ease-out }
        .animate-popDown  { animation: popDown .15s ease-out }
        .animate-fadeIn   { animation: fadeIn  .15s ease-out }
        .animate-fadeOut  { animation: fadeOut .15s ease-out }
      `}</style>
    </>
  );
}