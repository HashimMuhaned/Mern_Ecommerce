import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const ActivateAccountPage = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleActivateAccount = async () => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      try {
        setIsLoading(true);
        // Send request to backend to activate the account
        const response = await axios.get(
          `${process.env.BACKEND_API}/activate-account?token=${token}`
        );
        setMessage(response.data.message);

        // Optionally, navigate to login page after a delay
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Activation failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      setMessage("Invalid activation link.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>Account Activation</h2>
      <p style={{ color: "red", margin: "20px" }}>{message}</p>
      <button
        onClick={handleActivateAccount}
        disabled={isLoading}
        style={{
          background: "skyblue",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          borderRadius: "5px",
          height: "40px",
          fontFamily: "sans-serif",
        }}
      >
        {isLoading ? "Activating..." : "Activate Account"}
      </button>
    </div>
  );
};

export default ActivateAccountPage;
