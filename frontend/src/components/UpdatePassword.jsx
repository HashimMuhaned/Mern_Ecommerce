import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";

const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypedPassword, setRetypedPassword] = useState("");
  const [errors, setErrors] = useState({
    currentPasswordError: "",
    newPasswordNotMatch: "",
  });

  const [criteria, setCriteria] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    noSpaces: false,
  });

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    setCriteria({
      minLength: value.length >= 7,
      hasLetter: /[a-zA-Z]/.test(value),
      hasNumber: /\d/.test(value),
      noSpaces: !/\s/.test(value),
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      newPasswordNotMatch: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== retypedPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        newPasswordNotMatch: "Passwords do not match.",
      }));
      return;
    }

    try {
      // First, verify the current password
      const response = await axios.post("/api/verify-password", {
        password: currentPassword,
      });

      if (response.data.match) {
        console.log("Password matches. Proceed with updating the password.");

        // If the password matches, only then proceed to update the password
        const updateResponse = await axios.post("/api/update-password", {
          newPassword,
        });

        if (updateResponse.data.success) {
          toast.success("Password updated successfully!");
          // Optionally, redirect the user or clear the form
          setCurrentPassword("");
          setNewPassword("");
          setRetypedPassword("");

          // Optionally, reset any error messages
          setErrors({});
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            updateError: "Failed to update the password.",
          }));
        }
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          currentPasswordError: "Current password is incorrect.",
        }));
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        currentPasswordError:
          "Error verifying password. Please try again later.",
      }));
      console.error("Error verifying password:", error);
    }
  };

  return (
    <div className="password-container">
      <hr />
      <div style={{ paddingTop: "50px" }}>
        <h2>Change Your Password</h2>
        <p className="password-recommendation">
          We recommend that you choose a unique password that you don't use for
          any other online account.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="input-container" style={{ paddingTop: "30px" }}>
          <TextField
            id="outlined-basic currentPassword"
            label="Current Password"
            variant="outlined"
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <p style={{ color: "red", padding: "10px" }}>
          {errors.currentPasswordError}
        </p>
        <div className="input-container">
          <TextField
            id="outlined-basic newPassword"
            label="New Password"
            variant="outlined"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
          />
        </div>
        <div className="input-container">
          <ul
            style={{
              paddingLeft: "20px",
              paddingBottom: "20px",
              listStyle: "none",
            }}
          >
            <li>
              <p>
                {criteria.minLength ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )}
                Use 7+ characters
              </p>
            </li>
            <li>
              <p>
                {criteria.hasLetter ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )}
                Use at least 1 letter{" "}
              </p>
            </li>
            <li>
              <p>
                {criteria.hasNumber ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )}
                Use at least 1 number{" "}
              </p>
            </li>
            <li>
              <p>
                {criteria.noSpaces ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )}
                No spaces{" "}
              </p>
            </li>
          </ul>
        </div>

        <div className="input-container">
          <TextField
            id="outlined-basic retypedPassword"
            label="Retype New Password"
            variant="outlined"
            type="password"
            name="RetypedPassword"
            value={retypedPassword}
            onChange={(e) => setRetypedPassword(e.target.value)}
            required
          />
        </div>
        <p style={{ color: "red", padding: "10px" }}>
          {errors.newPasswordNotMatch}
        </p>
        <div style={{ marginBottom: "20px" }}>
          <Button
            variant="contained"
            type="submit"
            style={{ width: "100px" }}
            disabled={!Object.values(criteria).every(Boolean)}
          >
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
