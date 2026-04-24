import React, { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, displayKey, subKey, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(opt => {
    const main = (opt[displayKey] || '').toLowerCase();
    const sub = subKey ? (opt[subKey] || '').toLowerCase() : '';
    const q = search.toLowerCase();
    return main.includes(q) || sub.includes(q);
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition cursor-pointer flex items-center gap-2 bg-white min-h-[38px]"
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        {value ? (
          <>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 border border-sky-300 rounded text-sm font-medium text-sky-800 whitespace-nowrap">
              {value}
              <button onClick={handleClear} className="text-sky-500 hover:text-red-500 font-bold text-xs ml-0.5">&times;</button>
            </span>
            {isOpen && (
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm min-w-[60px] bg-transparent"
                placeholder=""
                autoComplete="off"
              />
            )}
          </>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (!isOpen) setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            className="flex-1 outline-none text-sm bg-transparent"
            placeholder={placeholder || 'Chọn...'}
            autoComplete="off"
          />
        )}
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Không tìm thấy</div>
          ) : (
            filtered.map((opt, idx) => {
              const isSelected = value === opt[displayKey];
              return (
                <div
                  key={opt.id || idx}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-sky-50 ${isSelected ? 'text-sky-600 font-semibold bg-sky-50' : 'text-gray-700'}`}
                >
                  <div>
                    <span>{opt[displayKey]}</span>
                    {subKey && opt[subKey] && <span className="text-xs text-gray-400 ml-2">{opt[subKey]}</span>}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
