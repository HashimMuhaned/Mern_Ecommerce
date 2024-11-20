import React, { useState, useContext } from "react";
import { CheckUserContext } from "../context/CheckUserToken";

const ConfirmChangeName = ({
  show,
  onConfirm,
  onCancel,
  currentName,
  field,
}) => {
  if (!show) return null;

  const { handleFieldUpdate } = useContext(CheckUserContext); // Get setUserInfo from context
  const [error, setError] = useState({});
  const [newName, setNewName] = useState("");

  const handleChangeName = async (e) => {
    e.preventDefault();
    await handleFieldUpdate(field, newName); // Pass only the field and new value
    onCancel();
  };

  return (
    <div className="name-modal">
      <div className="name-modal-content">
        <p className="modal-title">
          Change Your {field === "fname" ? "First Name" : "Last Name"}
        </p>
        <p className="modal-description">
          If you changed your Ethereal{" "}
          {field === "fname" ? "First Name" : "Last Name"}, you can’t change it
          again for 2 weeks after you confirm this change.
        </p>
        <p className="modal-current-name">
          Current {field === "fname" ? "First Name" : "Last Name"}: "
          {currentName}"
        </p>
        <form onSubmit={handleChangeName}>
          <input
            type="text"
            name="newName"
            id="newName"
            className="input-field"
            placeholder={`New ${
              field === "fname" ? "First Name" : "Last Name"
            }`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="confirm-button">
            Confirm
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmChangeName;
