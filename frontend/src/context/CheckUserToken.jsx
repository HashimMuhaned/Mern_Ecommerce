import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { updateUserField, updateUserEmailField } from "../services/userAPI";
import { toast } from "react-toastify";

export const CheckUserContext = createContext();

export const CheckUserProvider = ({ children }) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userInfo, setUserInfo] = useState([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${process.env.BACKEND_API}/validate-user`, {
          withCredentials: true,
        });

        if (response.data.valid) {
          setIsLoggedin(true);

          // Fetch user details after validation
          const userResponse = await axios.get(`${process.env.BACKEND_API}/user-details`, {
            withCredentials: true,
          });
          setUserInfo(userResponse.data);
        } else {
          setIsLoggedin(false);
          setUserInfo([]);
        }
      } catch (error) {
        setIsLoggedin(false);
        setUserInfo([]);
      }
    };

    checkAuthStatus();
  }, [isLoggedin]);

  const handleFieldUpdate = async (field, newName) => {
    let otherName = "";
    if (field === "fname") {
      otherName = userInfo.lname; // Get the current last name
    } else if (field === "lname") {
      otherName = userInfo.fname; // Get the current first name
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

  const handleSignOut = async (toast, navigate) => {
    try {
      const response = await axios.get(`${process.env.BACKEND_API}/auth/signout`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsLoggedin(false); // Update the context to reflect the user is signed out
        setUserInfo([]); // Clear user information if needed
        navigate("/ethereal/login");
        toast.success("Signed out successfully");
      }
    } catch (error) {
      console.error("Error during sign out", error);
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
