import React, { useState, useContext } from "react";
import { CheckUserContext } from "../context/CheckUserToken";
import TextField from "@mui/material/TextField";

const ConfirmChangeEmail = ({ show, onConfirm, onCancel, currentEmail }) => {
  if (!show) return null;
  const { handleEmailUpdate } = useContext(CheckUserContext); // Get setUserInfo from context
  const [error, setError] = useState({});
  const [newEmail, setNewEmail] = useState("");
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    await handleEmailUpdate(newEmail); // Pass only the field and new value
    onCancel();
  };
  return (
    <div className="name-modal">
      <div className="name-modal-content">
        <p className="modal-title">Change Your Email</p>
        <p className="modal-description">
          If you changed your Ethereal Email, you can’t change it again for 2
          weeks after you confirm this change.
        </p>
        <p className="modal-current-name">Current Email: "{currentEmail}"</p>
        <form onSubmit={handleChangeEmail}>
          <TextField
          style={{ marginBottom: "10px" }}
            type="text"
            name="newEmail"
            id="outlined-basic newEmail"
            label="New Email"
            variant="outlined"
            className="input-field"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
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

export default ConfirmChangeEmail;
