import React from 'react';
import { Navigation, Route, Trash2 } from 'lucide-react';
import LocationSearch from './LocationSearch';

const Sidebar = ({ 
  startPoint, 
  endPoint, 
  selectingMode, 
  setSelectingMode, 
  onFindRoute, 
  onReset,
  isLoading,
  error,
  setStartPoint,
  setEndPoint,
  routeData
}) => {
  return (
    <div className="w-96 h-full flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/40 overflow-hidden relative">
      
      {/* Premium Header with Gradient */}
      <div className="p-8 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-blue-300/20 blur-xl"></div>
        
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            SmartPath
          </h1>
        </div>
        <p className="relative z-10 text-blue-100/90 text-sm font-medium mt-2">
          Pencarian rute tercepat dengan A*
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-sm shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></div>
            {error}
          </div>
        )}

        <div className="space-y-5">
          <LocationSearch 
            label="Lokasi Awal"
            iconColor="bg-emerald-500"
            placeholder="Cari atau pilih di peta..."
            point={startPoint}
            onSelectPoint={(point) => {
              setStartPoint(point);
              if (!endPoint) setSelectingMode('end');
              else setSelectingMode(null);
            }}
            onFocus={() => setSelectingMode('start')}
            isSelected={selectingMode === 'start'}
          />

          <LocationSearch 
            label="Tujuan"
            iconColor="bg-rose-500"
            placeholder="Cari atau pilih di peta..."
            point={endPoint}
            onSelectPoint={(point) => {
              setEndPoint(point);
              setSelectingMode(null);
            }}
            onFocus={() => setSelectingMode('end')}
            isSelected={selectingMode === 'end'}
          />
        </div>

        {routeData && routeData.properties && routeData.properties.explanation && (
          <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
              Rincian Rute Tercepat
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Jarak Tempuh</span>
                <span className="text-lg font-bold text-slate-800">{routeData.properties.explanation.distance}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Estimasi Waktu</span>
                <span className="text-lg font-bold text-slate-800">{routeData.properties.explanation.estimatedTime}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-white/60 p-3 rounded-xl border border-white">
              <span className="font-semibold text-indigo-700">Kenapa rute ini dipilih?</span><br />
              {routeData.properties.explanation.reasoning}
            </div>
          </div>
        )}

        <div className="pt-6 mt-auto space-y-3 border-t border-slate-100">
          <button
            onClick={onFindRoute}
            disabled={!startPoint || !endPoint || isLoading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -translate-x-full"></div>
            
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Menganalisis Rute...</span>
                </>
              ) : (
                <>
                  <Route className="w-5 h-5" />
                  <span>Cari Rute Tercepat</span>
                </>
              )}
            </div>
          </button>
          
          <button
            onClick={onReset}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm active:scale-[0.98] hover:text-rose-500 group"
          >
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Reset Ulang
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
