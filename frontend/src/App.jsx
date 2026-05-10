import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';

function App() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [selectingMode, setSelectingMode] = useState('start');
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMapClick = (latlng) => {
    if (selectingMode === 'start') {
      setStartPoint(latlng);
      setSelectingMode('end');
    } else if (selectingMode === 'end') {
      setEndPoint(latlng);
      setSelectingMode(null);
    }
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRouteData(null);
    setError(null);
    setSelectingMode('start');
  };

  const findRoute = async () => {
    if (!startPoint || !endPoint) return;
    
    setIsLoading(true);
    setError(null);
    setRouteData(null);

    try {
      const response = await axios.post('http://localhost:3000/api/cari-rute', {
        start: { lat: startPoint.lat, lng: startPoint.lng },
        end: { lat: endPoint.lat, lng: endPoint.lng }
      });

      setRouteData(response.data);
      
      if (response.data.properties && response.data.properties.snappedStart) {
        setStartPoint({
          lat: response.data.properties.snappedStart[1],
          lng: response.data.properties.snappedStart[0]
        });
      }
      if (response.data.properties && response.data.properties.snappedEnd) {
        setEndPoint({
          lat: response.data.properties.snappedEnd[1],
          lng: response.data.properties.snappedEnd[0]
        });
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Terjadi kesalahan saat mencari rute.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans">
      {/* Full screen Map */}
      <div className="absolute inset-0 z-0">
        <MapView 
          startPoint={startPoint}
          endPoint={endPoint}
          onMapClick={handleMapClick}
          routeData={routeData}
        />
      </div>

      {/* Floating Glassmorphism Sidebar */}
      <div className="absolute top-0 left-0 h-full p-6 z-20 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <Sidebar 
            startPoint={startPoint}
            endPoint={endPoint}
            selectingMode={selectingMode}
            setSelectingMode={setSelectingMode}
            onFindRoute={findRoute}
            onReset={handleReset}
            isLoading={isLoading}
            error={error}
            setStartPoint={setStartPoint}
            setEndPoint={setEndPoint}
            routeData={routeData}
          />
        </div>
      </div>
      
      {/* Dynamic Instruction Toast */}
      {selectingMode && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none transition-all duration-300 ease-in-out">
          <div className="bg-white/90 backdrop-blur-md border border-white/20 text-slate-800 px-8 py-4 rounded-full shadow-2xl font-semibold tracking-wide flex items-center gap-3 animate-bounce">
            <div className={`w-3 h-3 rounded-full animate-pulse ${selectingMode === 'start' ? 'bg-green-500' : 'bg-rose-500'}`}></div>
            Klik pada peta untuk memilih {selectingMode === 'start' ? 'Lokasi Awal' : 'Tujuan'}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
