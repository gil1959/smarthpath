import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin, Loader2 } from 'lucide-react';

const LocationSearch = ({ label, iconColor, placeholder, point, onSelectPoint, onFocus, isSelected }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Jika point diatur dari luar (misal via klik peta), update query
  useEffect(() => {
    if (point && point.lat && point.lng && !point.label) {
      setQuery(`${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`);
    } else if (point && point.label) {
      setQuery(point.label);
    } else if (!point) {
      setQuery('');
    }
  }, [point]);

  // Klik di luar untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query && query.length > 2 && showDropdown && query !== (point?.label || `${point?.lat?.toFixed(5)}, ${point?.lng?.toFixed(5)}`)) {
        searchLocation();
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchLocation = async () => {
    setIsSearching(true);
    try {
      // Menggunakan API Nominatim dari OpenStreetMap
      // Dibatasi di area Jakarta Pusat agar relevan dengan peta jaringan jalan
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          format: 'json',
          q: query,
          limit: 5,
          viewbox: '102.20,-3.70,102.35,-3.85', // Area sekitar Bengkulu
          bounded: 1
        }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Gagal mencari lokasi:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    setQuery(suggestion.display_name);
    setShowDropdown(false);
    onSelectPoint({ lat, lng: lon, label: suggestion.display_name });
  };

  return (
    <div className="space-y-2 group" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
        <span className={`w-2 h-2 rounded-full ${iconColor}`}></span>
        {label}
      </label>
      <div className="relative">
        <div 
          className={`flex items-center w-full p-1 pl-4 rounded-2xl border-2 transition-all duration-300 ease-out shadow-sm group-hover:shadow-md ${
            isSelected 
              ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10' 
              : 'border-slate-100 hover:border-indigo-200 bg-white'
          }`}
        >
          <Search className={`w-5 h-5 ${point ? iconColor.replace('bg-', 'text-') : 'text-slate-400'}`} />
          <input 
            type="text"
            className="w-full bg-transparent border-none outline-none p-3 text-sm font-medium text-slate-800 placeholder-slate-400"
            placeholder={placeholder}
            value={query}
            onFocus={() => {
              onFocus();
              if (query.length > 2) setShowDropdown(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
          />
          {isSearching && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin mr-3" />}
        </div>

        {/* Dropdown Hasil Pencarian */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion)}
                className="p-3 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex gap-3 items-start transition-colors"
              >
                <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 line-clamp-2">{suggestion.display_name}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Pesan jika tidak ada hasil saat mengetik */}
        {showDropdown && query.length > 2 && suggestions.length === 0 && !isSearching && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden p-4 text-center text-sm text-slate-500">
            Lokasi tidak ditemukan di sekitar area Bengkulu.
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
