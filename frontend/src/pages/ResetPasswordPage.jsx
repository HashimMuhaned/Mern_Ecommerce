import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { toast } from "react-toastify";
import "../resetPasswordStyling.css"; // Add some styling

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get the token from the URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

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
      confirmPassword: "", // Reset password mismatch error on password change
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.BACKEND_API}/reset-password/${token}`,
        { newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("Password reset successfully!");
      navigate("/ethereal/login"); // Redirect to login page after success
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h2>Reset Your Password</h2>
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleNewPasswordChange} // Fix for criteria update
              required
            />
            {errors.newPassword && (
              <div style={{ color: "red" }}>{errors.newPassword}</div>
            )}
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && (
              <div style={{ color: "red", paddingTop: "10px" }}>
                {errors.confirmPassword}
              </div>
            )}
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
                  No spaces{""}
                </p>
              </li>
            </ul>
          </div>
          <button
            variant="contained"
            type="submit"
            className="reset-button"
            disabled={!Object.values(criteria).every(Boolean)}
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
