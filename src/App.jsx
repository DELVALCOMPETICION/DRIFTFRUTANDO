import React, { useState, useEffect } from 'react';
import {
  Trophy, Flag, Plus, Clock, CheckCircle, AlertTriangle,
  Copy, Check, Upload, Shield, User, Sliders, Eye, EyeOff,
  Play, Share2, Award, Zap, ChevronRight, Lock, Unlock, Layers
} from 'lucide-react';

const TRACK_PIECES = {
  A: { code: 'A', name: 'Recta Salida / Meta', color: 'border-amber-500 bg-amber-50 text-amber-900', angle: 0, type: 'straight' },
  B: { code: 'B', name: 'Recta Estándar', color: 'border-slate-400 bg-slate-100 text-slate-800', angle: 0, type: 'straight' },
  C: { code: 'C', name: 'Curva 60º Izda (Azul)', color: 'border-blue-500 bg-blue-50 text-blue-900', angle: -60, type: 'curve' },
  D: { code: 'D', name: 'Curva 60º Dcha (Rojo)', color: 'border-red-500 bg-red-50 text-red-900', angle: 60, type: 'curve' },
  E: { code: 'E', name: 'Horquilla Izda (Azul)', color: 'border-blue-600 bg-blue-100 text-blue-950', angle: -180, type: 'hairpin' },
  F: { code: 'F', name: 'Horquilla Dcha (Rojo)', color: 'border-red-600 bg-red-100 text-red-950', angle: 180, type: 'hairpin' },
  H: { code: 'H', name: 'Curva R2 30º Izda (Azul)', color: 'border-sky-500 bg-sky-50 text-sky-900', angle: -30, type: 'curve' },
  I: { code: 'I', name: 'Curva R2 30º Dcha (Rojo)', color: 'border-rose-500 bg-rose-50 text-rose-900', angle: 30, type: 'curve' },
  K: { code: 'K', name: 'Curva R1 30º Izda (Azul)', color: 'border-indigo-500 bg-indigo-50 text-indigo-900', angle: -30, type: 'curve' },
  L: { code: 'L', name: 'Curva R1 30º Dcha (Rojo)', color: 'border-orange-500 bg-orange-50 text-orange-900', angle: 30, type: 'curve' },
};

function decodeTrackCode(rawCode) {
  if (!rawCode) return [];
  const clean = rawCode.trim().toUpperCase();
  const result = [];
  let countBuffer = '';

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (/[0-9]/.test(ch)) {
      countBuffer += ch;
    } else if (TRACK_PIECES[ch]) {
      const count = countBuffer ? parseInt(countBuffer, 10) : 1;
      for (let c = 0; c < count; c++) {
        result.push(ch);
      }
      countBuffer = '';
    } else {
      countBuffer = '';
    }
  }
  return result;
}

function TrackPreviewSVG({ code }) {
  const pieces = decodeTrackCode(code);
  if (pieces.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
        Introduce un código válido (ej. 3db3da) para previsualizar el trazado
      </div>
    );
  }

  let x = 0;
  let y = 0;
  let heading = 0;
  const points = [{ x, y, code: 'START' }];

  pieces.forEach((pCode) => {
    const piece = TRACK_PIECES[pCode];
    if (!piece) return;
    const rad = (heading * Math.PI) / 180;
    const step = piece.type === 'straight' ? 36 : piece.type === 'hairpin' ? 22 : 28;

    if (piece.angle === 0) {
      x += Math.cos(rad) * step;
      y += Math.sin(rad) * step;
    } else {
      const midRad = ((heading + piece.angle / 2) * Math.PI) / 180;
      x += Math.cos(midRad) * step;
      y += Math.sin(midRad) * step;
      heading = (heading + piece.angle) % 360;
    }
    points.push({ x, y, code: pCode });
  });

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - 35;
  const maxX = Math.max(...xs) + 35;
  const minY = Math.min(...ys) - 35;
  const maxY = Math.max(...ys) + 35;
  const width = Math.max(maxX - minX, 120);
  const height = Math.max(maxY - minY, 100);

  const pathData = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const netAngle = pieces.reduce((acc, c) => acc + (TRACK_PIECES[c]?.angle || 0), 0) % 360;
  const distClose = Math.hypot(points[points.length - 1].x, points[points.length - 1].y);
  const isClosed = Math.abs(netAngle) < 5 && distClose < 45;

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative">
      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-slate-300 font-medium">{pieces.length} piezas totales</span>
        <span className={`px-2 py-0.5 rounded-full font-semibold ${isClosed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
          {isClosed ? 'Circuito cerrado OK' : 'Trazado abierto / revisar cierre'}
        </span>
      </div>
      <svg viewBox={`${minX} ${minY} ${width} ${height}`} className="w-full h-44 overflow-visible">
        <path d={pathData} fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathData} fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={0} cy={0} r={6} fill="#eab308" stroke="#fff" strokeWidth="2" />
      </svg>
    </div>
  );
}

const SETUP_PRESETS = {
  arcade: {
    label: 'Modo Arcade',
    speed: 'A',
    steeringMode: 'A',
    steeringAssist: 'D',
    brakeAssist: 'B',
    barrierContact: 'A',
    tireWear: '0',
    fuelWear: '0',
    timePenalty: '0',
  },
  simulation: {
    label: 'Modo Simulación',
    speed: 'B',
    steeringMode: 'B',
    steeringAssist: 'C',
    brakeAssist: 'C',
    barrierContact: 'A',
    tireWear: '0',
    fuelWear: '0',
    timePenalty: '1',
  },
  simulationPlus: {
    label: 'Simulación Plus',
    speed: 'B',
    steeringMode: 'C',
    steeringAssist: 'A',
    brakeAssist: 'A',
    barrierContact: 'C',
    tireWear: '0',
    fuelWear: '0',
    timePenalty: '1',
  },
};

function buildSetupCode(s) {
  return `${s.speed}${s.steeringMode}${s.steeringAssist}${s.brakeAssist}${s.barrierContact}-T${s.tireWear}-F${s.fuelWear}-P${s.timePenalty}`;
}

export default function App() {
  const [role, setRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('challenges');
  const [copiedId, setCopiedId] = useState(null);

  const [events, setEvents] = useState([
    {
      id: 'ev-surprise-1',
      title: 'Gran Premio Sorpresa Madrid #04',
      category: 'surprise',
      author: 'Organización Drift Frutando',
      trackCode: 'fj2be3b6ib3d3c2b2l2b2d3ba',
      setupCode: 'BCAAC-T0-F0-P1',
      setupLabel: 'Simulación Plus',
      laps: 10,
      results: [
        { pilot: 'Carlos M.', time: '01:14.320', ms: 74320, valid: true, submittedAt: 'Hace 18 min' },
      ],
    },
    {
      id: 'ev-official-1',
      title: 'Copa Liga Mensual — Circuito Técnico',
      category: 'official',
      author: 'Organización Drift Frutando',
      trackCode: '3db3da',
      setupCode: 'BBCCC-T0-F0-P1',
      setupLabel: 'Modo Simulación',
      laps: 15,
      results: [
        { pilot: 'Roberto Del Val', time: '00:48.910', ms: 48910, valid: true, submittedAt: 'Ayer' },
        { pilot: 'Hermano Del Val', time: '00:49.105', ms: 49105, valid: true, submittedAt: 'Ayer' },
      ],
    },
  ]);

  const [surpriseStartTimes, setSurpriseStartTimes] = useState({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [uploadModalEvent, setUploadModalEvent] = useState(null);
  const [pilotName, setPilotName] = useState('Roberto Del Val');
  const [mins, setMins] = useState('01');
  const [secs, setSecs] = useState('12');
  const [millis, setMillis] = useState('450');
  const [ocrScanning, setOcrScanning] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('official');
  const [newTrackCode, setNewTrackCode] = useState('3db3da');
  const [newLaps, setNewLaps] = useState(10);
  const [setup, setSetup] = useState(SETUP_PRESETS.simulation);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleStartSurprise = (eventId) => {
    setSurpriseStartTimes((prev) => ({
      ...prev,
      [eventId]: Date.now(),
    }));
  };

  const getSurpriseRemaining = (eventId) => {
    const started = surpriseStartTimes[eventId];
    if (!started) return null;
    const limitMs = 90 * 60 * 1000;
    const elapsed = now - started;
    const remaining = limitMs - elapsed;
    return remaining;
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return '00:00:00 (EXPIRADO)';
    const totalSecs = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const s = String(totalSecs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSimulateOCR = () => {
    setOcrScanning(true);
    setTimeout(() => {
      setMins('01');
      setSecs(String(Math.floor(Math.random() * 20) + 10).padStart(2, '0'));
      setMillis(String(Math.floor(Math.random() * 899) + 100));
      setOcrScanning(false);
    }, 900);
  };

  const handleSubmitResult = (e) => {
    e.preventDefault();
    if (!uploadModalEvent) return;

    const totalMs =
      parseInt(mins || '0', 10) * 60000 +
      parseInt(secs || '0', 10) * 1000 +
      parseInt(millis || '0', 10);
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;

    let isValid = true;
    if (uploadModalEvent.category === 'surprise') {
      const rem = getSurpriseRemaining(uploadModalEvent.id);
      if (rem === null || rem <= 0) {
        isValid = false;
      }
    }

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== uploadModalEvent.id) return ev;
        const updated = [
          ...ev.results,
          {
            pilot: pilotName || 'Piloto Invitado',
            time: formattedTime,
            ms: totalMs,
            valid: isValid,
            submittedAt: 'Ahora mismo',
          },
        ].sort((a, b) => a.ms - b.ms);
        return { ...ev, results: updated };
      })
    );

    setUploadModalEvent(null);
  };

  const handleCreateTrack = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTrackCode.trim()) return;

    const effectiveCategory = role === 'pilot' ? 'community' : newCategory;
    const newEv = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      category: effectiveCategory,
      author: role === 'admin' ? 'Organización Drift Frutando' : pilotName,
      trackCode: newTrackCode.trim(),
      setupCode: buildSetupCode(setup),
      setupLabel: setup.label || 'Personalizado',
      laps: Number(newLaps) || 10,
      results: [],
    };

    setEvents([newEv, ...events]);
    setNewTitle('');
    setActiveTab('challenges');
  };

  const addPieceToBuilder = (pieceCode) => {
    setNewTrackCode((prev) => prev + pieceCode.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-red-600 to-slate-900 flex items-center justify-center text-white shadow-md">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg text-slate-900 uppercase">
                  Drift Frutando
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">
                  Madrid
                </span>
              </div>
              <p className="text-xs text-slate-500">Club Oficial Carrera Hybrid</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'challenges'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Desafíos y Circuitos
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'builder'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              {role === 'admin' ? 'Crear Prueba Oficial' : 'Reto Libre'}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setRole('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  role === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                Organización
              </button>
              <button
                onClick={() => setRole('pilot')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                  role === 'pilot'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Piloto
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Pistas Activas del Club</h1>
                <p className="text-sm text-slate-500">
                  Copia el código de pista para montarla, ajusta tu coche y sube tu captura de tiempo.
                </p>
              </div>
              <button
                onClick={() => handleCopy(window.location.href, 'share-club')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-orange-300 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition"
              >
                {copiedId === 'share-club' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-orange-600" />
                    <span>Compartir Web del Club</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((ev) => {
                const isSurprise = ev.category === 'surprise';
                const remainingMs = isSurprise ? getSurpriseRemaining(ev.id) : null;
                const isUnlocked = !isSurprise || remainingMs !== null;
                const isExpired = isSurprise && remainingMs !== null && remainingMs <= 0;

                return (
                  <div
                    key={ev.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
                      isSurprise ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {ev.category === 'surprise' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                              <Zap className="w-3.5 h-3.5" /> PRUEBA SORPRESA (90 MIN)
                            </span>
                          )}
                          {ev.category === 'official' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" /> OFICIAL CAMPEONATO
                            </span>
                          )}
                          {ev.category === 'community' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                              RETO PILOTO
                            </span>
                          )}
                          <span className="text-xs text-slate-400">• {ev.laps} vueltas</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">{ev.title}</h2>
                        <p className="text-xs text-slate-500">Publicado por: {ev.author}</p>
                      </div>

                      {isSurprise && isUnlocked && (
                        <div
                          className={`px-3 py-1.5 rounded-xl text-right font-mono text-xs font-bold ${
                            isExpired
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-900 animate-pulse'
                          }`}
                        >
                          <div className="text-[10px] uppercase font-sans opacity-75">Tiempo restante</div>
                          {formatCountdown(remainingMs)}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 space-y-4">
                      {!isUnlocked ? (
                        <div className="bg-slate-900 text-white rounded-xl p-6 text-center space-y-3">
                          <Lock className="w-8 h-8 text-orange-400 mx-auto" />
                          <h3 className="font-bold text-base">Trazado y Setup Confidenciales</h3>
                          <p className="text-xs text-slate-300 max-w-sm mx-auto">
                            Al pulsar en desbloquear se revelará el código de pista y los ajustes del coche. Desde ese instante tendrás exactamente <strong>1 hora y 30 minutos</strong> para subir tu captura.
                          </p>
                          <button
                            onClick={() => handleStartSurprise(ev.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl transition shadow-md"
                          >
                            <Unlock className="w-4 h-4" />
                            Aceptar Reto y Iniciar Cronómetro
                          </button>
                        </div>
                      ) : (
                        <>
                          <TrackPreviewSVG code={ev.trackCode} />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                                Código de Pista (Editor)
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                <code className="text-xs font-mono font-bold text-slate-800 truncate">
                                  {ev.trackCode}
                                </code>
                                <button
                                  onClick={() => handleCopy(ev.trackCode, `trk-${ev.id}`)}
                                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"
                                  title="Copiar código de pista"
                                >
                                  {copiedId === `trk-${ev.id}` ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                                Setup Coche ({ev.setupLabel})
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                <code className="text-xs font-mono font-bold text-orange-700">
                                  {ev.setupCode}
                                </code>
                                <button
                                  onClick={() => handleCopy(ev.setupCode, `stp-${ev.id}`)}
                                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"
                                  title="Copiar código setup"
                                >
                                  {copiedId === `stp-${ev.id}` ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase text-slate-500">
                            Clasificación ({ev.results.length})
                          </span>
                          {isUnlocked && (
                            <button
                              onClick={() => setUploadModalEvent(ev)}
                              disabled={isExpired}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                                isExpired
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-sm'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {isExpired ? 'Plazo cerrado' : 'Subir Tiempo'}
                            </button>
                          )}
                        </div>

                        {ev.results.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            Aún no hay tiempos registrados en este circuito.
                          </p>
                        ) : (
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            {ev.results.map((r, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-2 text-xs bg-white"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                                  <span className="font-semibold text-slate-800">{r.pilot}</span>
                                  {!r.valid && (
                                    <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                                      FUERA DE PLAZO
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400">{r.submittedAt}</span>
                                  <span className="font-mono font-bold text-slate-900">{r.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {role === 'admin'
                    ? 'Publicar Nueva Prueba Oficial / Sorpresa'
                    : 'Crear Reto Libre de Piloto'}
                </h2>
                <p className="text-xs text-slate-500">
                  {role === 'admin'
                    ? 'Como Organización puedes publicar circuitos del campeonato o pruebas sorpresa con límite de 90 minutos.'
                    : 'Como Piloto puedes compartir tus propios trazados para retar al resto del club.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                Rol: {role === 'admin' ? 'Organización' : 'Piloto'}
              </span>
            </div>

            <form onSubmit={handleCreateTrack} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Nombre del Circuito / Evento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nocturna Jarama Drift — Ronda 3"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Tipo de Evento
                  </label>
                  {role === 'admin' ? (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="official">Oficial Campeonato</option>
                      <option value="surprise">Prueba Sorpresa (90 min)</option>
                      <option value="community">Reto Libre</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value="Reto Libre de Piloto"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-600">
                    Código de Pista (Pega un código o pulsa las piezas para añadirlas)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewTrackCode('')}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Limpiar trazado
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.values(TRACK_PIECES).map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => addPieceToBuilder(p.code)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition hover:scale-105 ${p.color}`}
                    >
                      {p.code} · {p.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      required
                      value={newTrackCode}
                      onChange={(e) => setNewTrackCode(e.target.value)}
                      placeholder="Ej. 3db3da o fj2be3b6ib3d3c2b2l2b2d3ba"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Vueltas:</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={newLaps}
                        onChange={(e) => setNewLaps(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <TrackPreviewSVG code={newTrackCode} />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-orange-600" />
                    Reglas y Ajustes del Coche
                  </span>
                  <div className="flex gap-1.5">
                    {Object.entries(SETUP_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSetup(preset)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:border-orange-500 rounded-lg text-xs font-semibold"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Velocidad</label>
                    <select
                      value={setup.speed}
                      onChange={(e) => setSetup({ ...setup, speed: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="A">A - Arcade</option>
                      <option value="B">B - Realista</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Modo Dirección</label>
                    <select
                      value={setup.steeringMode}
                      onChange={(e) => setSetup({ ...setup, steeringMode: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="A">A - Arcade</option>
                      <option value="B">B - Simulación</option>
                      <option value="C">C - Simulación Plus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Asist. Dirección</label>
                    <select
                      value={setup.steeringAssist}
                      onChange={(e) => setSetup({ ...setup, steeringAssist: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="A">A - Desactivado</option>
                      <option value="B">B - Mínima</option>
                      <option value="C">C - Media</option>
                      <option value="D">D - Potente</option>
                      <option value="E">E - Guarda raíl</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Asist. Freno</label>
                    <select
                      value={setup.brakeAssist}
                      onChange={(e) => setSetup({ ...setup, brakeAssist: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="A">A - Desactivado</option>
                      <option value="B">B - Activado</option>
                      <option value="C">C - Track limits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Contacto Barrera</label>
                    <select
                      value={setup.barrierContact}
                      onChange={(e) => setSetup({ ...setup, barrierContact: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="A">A - Desactivado</option>
                      <option value="B">B - Débil</option>
                      <option value="C">C - Media</option>
                      <option value="D">D - Potente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Desgaste Neumáticos</label>
                    <select
                      value={setup.tireWear}
                      onChange={(e) => setSetup({ ...setup, tireWear: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="0">Desactivado</option>
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          x{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Consumo Combustible</label>
                    <select
                      value={setup.fuelWear}
                      onChange={(e) => setSetup({ ...setup, fuelWear: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="0">Desactivado</option>
                      {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          x{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Penalización Tiempo</label>
                    <select
                      value={setup.timePenalty}
                      onChange={(e) => setSetup({ ...setup, timePenalty: e.target.value, label: 'Personalizado' })}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="0">Desactivado</option>
                      <option value="1">Activado</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Código generado para los pilotos:</span>
                  <code className="px-3 py-1 bg-orange-100 text-orange-800 font-mono font-bold text-xs rounded-lg">
                    {buildSetupCode(setup)}
                  </code>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('challenges')}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-md"
                >
                  Publicar Circuito en el Club
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {uploadModalEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registrar Tiempo</h3>
              <p className="text-xs text-slate-500">{uploadModalEvent.title}</p>
            </div>

            <form onSubmit={handleSubmitResult} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nombre del Piloto
                </label>
                <input
                  type="text"
                  required
                  value={pilotName}
                  onChange={(e) => setPilotName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Sube la captura de pantalla de la app Carrera Hybrid para lectura automática:
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-800">
                  <Upload className="w-3.5 h-3.5" />
                  {ocrScanning ? 'Leyendo captura...' : 'Seleccionar Captura'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleSimulateOCR} />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Minutos</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={mins}
                    onChange={(e) => setMins(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Segundos</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={secs}
                    onChange={(e) => setSecs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Milésimas</label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={millis}
                    onChange={(e) => setMillis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalEvent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
                >
                  Confirmar y Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
