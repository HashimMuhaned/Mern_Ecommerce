import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { updateUserField, updateUserEmailField } from "../services/userAPI";
import { toast } from "react-toastify";

export const CheckUserContext = createContext();

export const CheckUserProvider = ({ children }) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userInfo, setUserInfo] = useState([]);

  // Function to validate the token and fetch user details
  const checkAuthStatus = async () => {
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        // If no token, reset login state
        setIsLoggedin(false);
        setUserInfo([]);
        return;
      }

      // Validate the token with the backend
      const response = await axios.get(
        `${process.env.BACKEND_API}/validate-user`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token sent via Authorization header
          },
        }
      );

      if (response.data.valid) {
        setIsLoggedin(true);

        // Fetch user details if the token is valid
        const userResponse = await axios.get(
          `${process.env.BACKEND_API}/user-details`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token sent with every authenticated request
            },
          }
        );
        setUserInfo(userResponse.data);
      } else {
        // If token validation fails, reset state and remove token
        setIsLoggedin(false);
        setUserInfo([]);
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Authentication failed:", error.message);

      // Reset state and remove invalid token
      setIsLoggedin(false);
      setUserInfo([]);
      localStorage.removeItem("authToken");
    }
  };

  // Trigger the auth validation on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to update user fields (e.g., first name, last name)
  const handleFieldUpdate = async (field, newName) => {
    let otherName = "";

    if (field === "fname") {
      otherName = userInfo.lname; // Current last name
    } else if (field === "lname") {
      otherName = userInfo.fname; // Current first name
    }

    const result = await updateUserField(field, newName, otherName);

    if (result.success) {
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        [field]: newName,
      }));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // Function to update user email
  const handleEmailUpdate = async (newEmail) => {
    const result = await updateUserEmailField(newEmail);

    if (result.success) {
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        email: newEmail,
      }));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  // Function to handle user sign-out
  const handleSignOut = async (toast, navigate) => {
    try {
      const response = await axios.get(
        `${process.env.BACKEND_API}/auth/signout`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 200) {
        // Clear localStorage and reset states
        localStorage.removeItem("authToken");
        setIsLoggedin(false);
        setUserInfo(null);

        // Navigate to the login page and show a success message
        navigate("/ethereal/login");
        toast.success("Signed out successfully");
      }
    } catch (error) {
      console.error("Error during sign out:", error.message);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <CheckUserContext.Provider
      value={{
        isLoggedin,
        setIsLoggedin,
        userInfo,
        setUserInfo,
        handleFieldUpdate,
        handleEmailUpdate,
        handleSignOut,
      }}
    >
      {children}
    </CheckUserContext.Provider>
  );
};
