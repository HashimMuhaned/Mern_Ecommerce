import React from "react";

const ConfirmationModal = ({ show, onConfirm, onCancel, message }) => {
  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <p>{message}</p>
        <div className="button-container">
          <button className="confirm-button" onClick={onConfirm}>
            Yes
          </button>
          <button className="cancel-button" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
