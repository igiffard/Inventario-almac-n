import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessGate: React.FC = () => {
  const { login, defaultCode } = useAuth();
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const success = login(inputCode);
    if (!success) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } else {
      setError(false);
    }
  };

  const handleQuickFill = () => {
    setInputCode(defaultCode);
    setError(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden selection:bg-teal-600 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-600/15 via-emerald-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-700/5 blur-3xl pointer-events-none rounded-full" />

      {/* Main Authentication Card */}
      <div className={`w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 transition-transform ${shake ? 'animate-bounce' : ''}`}>
        
        {/* University Header Tag */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md ring-1 ring-white/10 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
                UABC • FCM
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Facultad de Ciencias Marinas
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Acceso Restringido
          </span>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-950/60 border border-teal-500/30 text-teal-400 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Control de Almacén e Inventario
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Ingrese el código de acceso autorizado para consultar y gestionar el inventario de laboratorios.
          </p>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                Código de Acceso Universal
              </span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-normal flex items-center gap-1 lowercase"
              >
                <HelpCircle className="w-3 h-3" /> ¿código inicial?
              </button>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Escribe el código aquí..."
                autoFocus
                className={`w-full px-4 py-3.5 bg-slate-950/80 border ${
                  error 
                    ? 'border-rose-500/80 ring-2 ring-rose-500/20 text-rose-200' 
                    : 'border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-white'
                } rounded-xl text-base tracking-wider font-semibold placeholder:text-slate-600 outline-hidden transition-all pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Código incorrecto. Verifica con el administrador de almacén.</span>
              </div>
            )}

            {/* Default Hint */}
            {showHint && (
              <div className="mt-2 p-2.5 rounded-xl bg-teal-950/40 border border-teal-800/40 text-xs text-teal-300 space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span>Código predeterminado: <strong>{defaultCode}</strong></span>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="underline text-teal-200 hover:text-white font-bold ml-2"
                  >
                    Usar este
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-teal-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Desbloquear e Ingresar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Notes */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sesión segura • Control de Almacén FCM</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Si eres profesor, investigador o estudiante y no tienes el código, solicítalo a la coordinación de laboratorios.
          </p>
        </div>
      </div>

      {/* University Copyright Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 z-10">
        Universidad Autónoma de Baja California • Facultad de Ciencias Marinas
      </div>
    </div>
  );
};
