import React, { useState, useRef, useEffect } from 'react';

const StationInput = ({ value, onChange, options, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
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

  // Filter theo search (nếu đang gõ) hoặc show hết
  const filtered = options.filter(opt => {
    if (!search) return true;
    return opt.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (station) => {
    onChange(station);
    setIsOpen(false);
    setSearch('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val); // Cho phép nhập tự do
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0]);
    }
  };

  // Hiển thị: nếu đang mở + gõ thì show search, ngược lại show value
  const displayValue = isOpen ? search : (value || '');

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div
        className="w-full border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition bg-white flex items-center"
        onClick={handleFocus}
      >
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 outline-none text-base bg-transparent rounded-lg"
          placeholder={placeholder || 'Chọn hoặc nhập địa chỉ...'}
          autoComplete="off"
        />
        <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); if (!isOpen) setTimeout(() => inputRef.current?.focus(), 10); }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">Không tìm thấy</div>
          ) : (
            filtered.map((station, idx) => {
              const isSelected = value === station;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(station)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-sky-50 ${isSelected ? 'text-sky-600 font-semibold bg-sky-50' : 'text-gray-700'}`}
                >
                  <span>{station}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default StationInput;
