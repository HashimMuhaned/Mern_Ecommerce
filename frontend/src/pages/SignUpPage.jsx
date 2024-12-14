import React, { useState } from "react";
import "../signupstyling.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import registerImage from "../assets/registerImage.jpg";


const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "", // directly store password here
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
    noSpaces: false,
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Handle regular input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle password input and criteria checking
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setPasswordCriteria({
      minLength: value.length >= 7,
      hasLetter: /[a-zA-Z]/.test(value),
      hasNumber: /\d/.test(value),
      noSpaces: !/\s/.test(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.BACKEND_API}/signup`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Display the backend message if the account is created successfully
      toast.success(response.data.message); // Use the message from the backend response
      navigate("/ethereal/login");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors); // Sets the error state based on field-specific errors from the backend
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div id="signup-page">
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 style={{ paddingTop: "20px" }}>Sign Up</h2>
          <div className="form-group">
            <input
              placeholder="First Name"
              type="text"
              id="fname"
              name="fname"
              value={formData.fname}
              onChange={handleChange}
              required
            />
            {errors.fname && (
              <div style={{ color: "red", padding: "10px" }}>
                {errors.fname}
              </div>
            )}
          </div>
          <div className="form-group">
            <input
              placeholder="Last Name"
              type="text"
              id="lname"
              name="lname"
              value={formData.lname}
              onChange={handleChange}
              required
            />
            {errors.lname && (
              <div style={{ color: "red", padding: "10px" }}>
                {errors.lname}
              </div>
            )}
          </div>

          <div className="form-group">
            <input
              placeholder="Email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div style={{ color: "red", padding: "10px" }}>
                {errors.email}
              </div>
            )}
          </div>
          <div className="form-group">
            <input
              placeholder="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              required
            />
            {errors.password && (
              <div style={{ color: "red", padding: "10px" }}>
                {errors.password}
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
                  {passwordCriteria.minLength ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )}
                  Use 7+ characters
                </p>
              </li>
              <li>
                <p>
                  {passwordCriteria.hasLetter ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )}
                  Use at least 1 letter
                </p>
              </li>
              <li>
                <p>
                  {passwordCriteria.hasNumber ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )}
                  Use at least 1 number
                </p>
              </li>
              <li>
                <p>
                  {passwordCriteria.noSpaces ? (
                    <CheckIcon color="success" />
                  ) : (
                    <CloseIcon color="error" />
                  )}
                  No spaces
                </p>
              </li>
            </ul>
          </div>
          <div id="buttons">
            <button type="submit" className="signup-button">
              Sign Up
            </button>
            <NavLink to="/ethereal" id="back">
              Back to home screen
            </NavLink>
            <p>
              Already have an account?{" "}
              <NavLink to="/ethereal/login" id="haveAcc">
                Login now
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

export default SignUpPage;
