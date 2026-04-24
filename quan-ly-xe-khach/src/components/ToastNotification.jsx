import { useEffect } from 'react';
import ReactDOM from 'react-dom';

const STYLES = {
  success: { background: '#f0fdf4', border: '1px solid #86efac', iconColor: '#16a34a' },
  warning: { background: '#fffbeb', border: '1px solid #fcd34d', iconColor: '#d97706' },
  error:   { background: '#fef2f2', border: '1px solid #fca5a5', iconColor: '#dc2626' },
  info:    { background: '#eff6ff', border: '1px solid #93c5fd', iconColor: '#2563eb' },
};

const ICONS = {
  success: (color) => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2} style={{flexShrink:0,marginTop:2}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (color) => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2} style={{flexShrink:0,marginTop:2}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  error: (color) => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2} style={{flexShrink:0,marginTop:2}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (color) => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2} style={{flexShrink:0,marginTop:2}}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const ToastNotification = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const type = toast.type || 'success';
  const s = STYLES[type] || STYLES.success;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 16px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: s.border,
      background: s.background,
      maxWidth: '480px',
      width: '90vw',
      pointerEvents: 'all',
    }}>
      {ICONS[type] && ICONS[type](s.iconColor)}
      <p style={{ flex: 1, fontSize: '14px', color: '#1f2937', lineHeight: '1.5', margin: 0 }}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0', marginTop: '2px', flexShrink: 0 }}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>,
    document.body
  );
};

export default ToastNotification;
