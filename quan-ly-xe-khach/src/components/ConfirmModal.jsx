import React from 'react';

/**
 * Custom confirm/alert modal - thay thế window.confirm() và alert()
 *
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string
 *  - type: 'warning' | 'danger' | 'info' | 'success'
 *  - confirmText: string (default 'Đồng ý')
 *  - cancelText: string (default 'Hủy') - nếu null thì chỉ hiện nút OK
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận',
  message = '',
  type = 'warning',
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const icons = {
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️',
    success: '✅',
  };

  const iconColors = {
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-7 max-w-[420px] w-[90%] shadow-2xl animate-[slideUp_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${iconColors[type] || iconColors.warning}`}>
          {icons[type] || '⚠️'}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-gray-500 leading-relaxed mb-6 whitespace-pre-line">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          {cancelText && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            autoFocus
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
