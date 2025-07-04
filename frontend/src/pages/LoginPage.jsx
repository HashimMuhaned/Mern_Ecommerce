import React, { useState, useContext } from "react";
import "../loginstyling.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckUserContext } from "../context/CheckUserToken";
import registerImage from "../assets/registerImage.jpg";


const LoginPage = () => {
  const { setIsLoggedin, setUserInfo } = useContext(CheckUserContext);
  // const { fetchMessages } = useChat(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    localStorage.removeItem("authToken");
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API}/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract the token from the response
      const { token } = response.data;

      // Save the token in localStorage
      localStorage.setItem("authToken", token);

      // Update login state
      setIsLoggedin(true);

      // Fetch user details immediately after login
      const userResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_API}/user-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update userInfo in context
      setUserInfo(userResponse.data);

      // if (userInfo?._id) {
      //   fetchMessages(userInfo._id);
      // }

      toast.success("Logged In Successfully");

      return navigate("/ethereal");
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors("An unexpected error occurred");
        setIsLoggedin(false);
      }
    }
  };

  return (
    <div id="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {errors && (
            <div style={{ color: "red", padding: "10px" }}>{errors}</div>
          )}
          <div id="buttons">
            <button type="submit" className="signup-button">
              Login
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
            <p>
              Forgot Password ?{" "}
              <NavLink
                to="/ethereal/confirm-email-to-change-password"
                id="createAcc"
              >
                Reset Password
              </NavLink>
            </p>
          </div>
        </form>
      </div>
      <div className="signup-image">
        <img src={registerImage} alt="Stylish hoodies" />
      </div>
    </div>
  );
};

export default LoginPage;
