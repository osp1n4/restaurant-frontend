import React, { useEffect, useRef, useState } from 'react';

export default function SelectListbox({ value, onChange, options = [], className, label, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const rootRef = useRef(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (open) {
      // set focus to selected option
      const idx = options.findIndex(o => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [open, options, value]);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(prev => !prev);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < options.length) {
        onChange(options[focusedIndex].value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className || ''}`} aria-label={ariaLabel}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        className="relative w-full cursor-pointer rounded-lg bg-slate-800 py-3 pl-4 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center gap-2">
          {selected?.leftIcon && <span className="flex-shrink-0">{selected.leftIcon}</span>}
          <span className="block truncate text-white">{selected?.label || label}</span>
        </div>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.832.445l4 6a1 1 0 01-.832 1.555H5.999a1 1 0 01-.832-1.555l4-6A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {open && (
        <ul role="listbox" tabIndex={-1} className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm z-50">
          {options.map((opt, idx) => (
            <li
              role="option"
              aria-selected={String(opt.value) === String(value)}
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              onMouseEnter={() => setFocusedIndex(idx)}
              className={`relative cursor-pointer select-none py-2 pl-4 pr-4 ${focusedIndex === idx ? 'bg-slate-800 text-white' : 'text-gray-300'}`}
            >
              <div className="flex items-center gap-2">
                {opt.leftIcon && <span className="flex-shrink-0">{opt.leftIcon}</span>}
                <span className={`${String(opt.value) === String(value) ? 'font-medium' : 'font-normal'} block truncate`}>{opt.label}</span>
                {opt.rightIcon && <span className="ml-auto flex-shrink-0">{opt.rightIcon}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
