import React, { useRef } from 'react';
import { useSettings } from './SettingsContext';
import { Upload, Trash2, Settings as SettingsIcon, CreditCard } from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/svg+xml') {
        alert('Por favor, selecciona un archivo SVG válido.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateSettings({ logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
          <SettingsIcon className="text-emerald-500" size={32} />
          Configuración
        </h2>
        <p className="text-gray-500 mt-2">Personaliza el aspecto de tu aplicación de Rifas Pro</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Logo del Negocio</h3>
        <p className="text-sm text-gray-500 mb-6">Sube tu logo en formato SVG para que se muestre en la parte superior de las cuadrículas de rifas.</p>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-40 h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center p-4 shadow-inner shrink-0 overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-gray-400 text-sm font-semibold text-center px-4">Ningún logo seleccionado</span>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto flex-1">
            <input 
              type="file" 
              accept=".svg" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              <Upload size={20} />
              {settings.logoUrl ? 'Cambiar Logo (.svg)' : 'Subir SVG'}
            </button>
            {settings.logoUrl && (
              <button 
                onClick={() => updateSettings({ logoUrl: null })}
                className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 px-5 py-3 rounded-xl font-bold transition-all border-2 border-red-100 hover:border-red-200 active:scale-[0.98]"
              >
                <Trash2 size={20} />
                Quitar Logo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="text-gray-400" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Datos de Pago</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">Esta información aparecerá en los tickets digitales de tus participantes.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Nombre del titular</label>
            <input
              type="text"
              value={settings.paymentName}
              onChange={(e) => updateSettings({ paymentName: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium placeholder-gray-400"
              placeholder="Ej. Juan Pérez"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Banco</label>
            <input
              type="text"
              value={settings.paymentBank}
              onChange={(e) => updateSettings({ paymentBank: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium placeholder-gray-400"
              placeholder="BBVA, Banamex, SPEI..."
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">CLABE interbancaria (18 dígitos)</label>
            <input
              type="text"
              maxLength={18}
              pattern="[0-9]{18}"
              value={settings.paymentClabe}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                updateSettings({ paymentClabe: val });
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium font-mono text-gray-800 tracking-wider placeholder-gray-400"
              placeholder="Ej. 012345678901234567"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Número de tarjeta</label>
            <input
              type="text"
              maxLength={16}
              value={settings.paymentCard}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                updateSettings({ paymentCard: val });
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium font-mono text-gray-800 tracking-wider placeholder-gray-400"
              placeholder="Opcional (16 dígitos)"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">Teléfono (Confirmación)</label>
            <input
              type="tel"
              value={settings.paymentPhone}
              onChange={(e) => updateSettings({ paymentPhone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium placeholder-gray-400"
              placeholder="Ej. 222 525 1930"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Alias CoDi / DiMo (Opcional)</label>
            <input
              type="text"
              value={settings.paymentAlias}
              onChange={(e) => updateSettings({ paymentAlias: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium placeholder-gray-400"
              placeholder="Ej. mi-alias o número telefónico ligado a CoDi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
