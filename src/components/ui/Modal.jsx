import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px 16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 48px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            position: 'sticky',
            top: 0,
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              margin: 0,
            }}
          >
            {title}
          </h3>

          <button
            type="button"
            className="btn-ghost"
            style={{
              padding: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '50%',
            }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};