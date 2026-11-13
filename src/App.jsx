import React, { useState, useEffect } from 'react';
import {
  Trophy, Flag, Plus, Clock, CheckCircle, AlertTriangle,
  Copy, Check, Upload, Shield, User, Sliders, Eye, EyeOff,
  Play, Share2, Award, Zap, ChevronRight, Lock, Unlock, Layers
} from 'lucide-react';

// Diccionario oficial de piezas Carrera Hybrid
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

// Decodificador de cadenas comprimidas (ej. "3db3da" -> ["D","D","D","B","D","D","D","A"])
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

// Renderizador SVG vectorial automático del trazado
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
  let heading = 0; // grados
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
  const width = Math.max(maxX - minX,
