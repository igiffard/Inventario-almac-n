import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Key, 
  Check, 
  Copy, 
  RotateCcw, 
  Lock, 
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SecurityModal: React.FC = () => {
  const { 
    isSecurityModalOpen, 
    setIsSecurityModalOpen, 
    accessCode, 
    updateAccessCode, 
    resetAccessCode, 
    logout,
    defaultCode 
  } = useAuth();

  const [currentCodeInput, setCurrentCodeInput] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');
  const [confirmCodeInput, setConfirmCodeInput] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isSecurityModalOpen) return null;

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCodeInput.trim() || !newCodeInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Completa todos los campos requeridos.' });
      return;
    }

    if (newCodeInput.trim() !== confirmCodeInput.trim()) {
      setStatusMessage({ type: 'error', text: 'El nuevo código y su confirmación no coinciden.' });
      return;
    }

    if (newCodeInput.trim().length < 3) {
      setStatusMessage({ type: 'error', text: 'El nuevo código debe tener al menos 3 caracteres.' });
      return;
    }

    const success = updateAccessCode(currentCodeInput, newCodeInput);
    if (success) {
      setStatusMessage({ type: 'success', text: '¡Código de acceso actualizado exitosamente!' });
      setCurrentCodeInput('');
      setNewCodeInput('');
      setConfirmCodeInput('');
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: 'El código actual ingresado es incorrecto.' });
    }
  };

  const handleResetToDefault = () => {
    if (confirm('¿Restablecer el código universal al valor predeterminado (' + defaultCode + ')?')) {
      resetAccessCode();
      setStatusMessage({ type: 'success', text: `Código restablecido al predeterminado: ${defaultCode}` });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const getDirectLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('code', accessCode);
    return url.toString();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getDirectLink());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleLockNow = () => {
    setIsSecurityModalOpen(false);
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsSecurityModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase flex items-center gap-1">
              <Shield className="w-3 h-3" /> Seguridad y Clave Universal
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Configuración de Acceso
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Administra el código universal que los usuarios deben ingresar para ver e interactuar con el inventario.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
          
          {/* Active Code Box */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block mb-0.5">
                Código de Acceso Activo
              </span>
              <span className="text-lg font-black tracking-widest text-teal-950 font-mono">
                {accessCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? '¡Copiado!' : 'Copiar Clave'}</span>
            </button>
          </div>

          {/* Direct Link for Google Sites */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-teal-600" />
                Enlace con Desbloqueo Automático (para Google Sites)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Puedes embeber esta URL en tu Google Sites para que los miembros de la facultad accedan directamente sin tener que escribir el código manualmente:
            </p>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                readOnly
                value={getDirectLink()}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-600 truncate outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Change Code Form */}
          <form onSubmit={handleUpdateCode} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cambiar Código Universal
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código Actual:
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentCodeInput}
                  onChange={(e) => setCurrentCodeInput(e.target.value)}
                  placeholder="Escribe el código actual..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nuevo Código:
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newCodeInput}
                    onChange={(e) => setNewCodeInput(e.target.value)}
                    placeholder="Ej. CIENCIAS2026"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden pr-9 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Nuevo Código:
                </label>
                <input
                  type="password"
                  value={confirmCodeInput}
                  onChange={(e) => setConfirmCodeInput(e.target.value)}
                  placeholder="Repite el nuevo código..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer ({defaultCode})</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Guardar Nuevo Código
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleLockNow}
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear Pantalla Ahora</span>
          </button>

          <button
            onClick={() => setIsSecurityModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
