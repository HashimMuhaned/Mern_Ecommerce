import React, { useState, useContext } from "react";
import "../loginstyling.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
// import { CheckUserContext } from "../context/CheckUserToken";

const ConfirmEmailToResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.BACKEND_API}/request-password-reset`,
        {
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error);
      toast.error(error.response.data.message);
      const errorMessage =
        error.response && error.response.data.message
          ? error.response.data.message
          : "Something went wrong. Please try again.";
      setErrors({ general: errorMessage });
    }
  };
  return (
    <div id="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Enter your email to recieve the link to update your Password</h2>
          <div className="form-group">
            {/* <label htmlFor="email">Email</label> */}
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          {errors.general && (
            <div style={{ color: "red", marginTop: "10px" }}>
              {errors.general}
            </div>
          )}
          <div id="buttons">
            <button type="submit" className="signup-button">
              Reset Password
            </button>
            <NavLink to="/ethereal" id="back">
              Back to home screen
            </NavLink>
            <p>
              Dont Have an account ?{" "}
              <NavLink to="/ethereal/signup" id="createAcc">
                Create Account
              </NavLink>
            </p>
          </div>
        </form>
      </div>
      <div className="signup-image">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/b86ed8441b8af9d6d4bc261291338f57-Rdbg9ANz2ppRp3NfDPb0VJogvnvZt5.jpg"
          alt="Stylish hoodies"
        />
      </div>
    </div>
  );
};

export default ConfirmEmailToResetPassword;
