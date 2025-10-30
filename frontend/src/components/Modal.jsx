import React from 'react';
import './Modal.css';

const Modal = ({ title, onClose, children }) => {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-window">
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
