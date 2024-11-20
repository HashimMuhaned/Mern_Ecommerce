import React, { Fragment, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckUserContext } from "../context/CheckUserToken";
import "../profilePageStyle.css";
import EditNameButton from "./EditNameButton";
import UpdatePassword from "./UpdatePassword";
import EditEmailButton from "./EditEmailButton";

const ProfileSettings = () => {
  const { userInfo } = useContext(CheckUserContext);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (userInfo) {
      setFormData((prevData) => ({
        ...prevData,
        fname: userInfo.fname || "",
        lname: userInfo.lname || "",
        email: userInfo.email || "",
        password: "",
      }));
    }
  }, [userInfo]); // This ensures formData is updated whenever userInfo changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-container">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <h2>Account Settings</h2>
        <p>Manage your account’s details.</p>
        <h3>Account Information</h3>
        <h5>ID: {userInfo._id}</h5>
      </div>
      <div id="nameInfo" className="name-info-container">
        <div className="input-container">
          <input
            type="text"
            id="fname"
            name="fname"
            value={formData.fname}
            onChange={handleChange}
            required
            disabled
          />
          <label htmlFor="fname">First Name</label>
          <div className="edit-icon">
            <EditNameButton field="fname" currentName={formData.fname} />
          </div>
        </div>
        <div className="input-container">
          <input
            type="text"
            id="lname"
            name="lname"
            value={formData.lname}
            onChange={handleChange}
            required
            disabled
          />
          <label htmlFor="lname">Last Name</label>
          <div className="edit-icon">
            <EditNameButton field="lname" currentName={formData.lname} />
          </div>
        </div>
      </div>
      <div className="email-password-input-container">
        <div className="input-container">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
          <label htmlFor="email">Email</label>
          <div className="edit-icon">
            <EditEmailButton field="email" currnetEmail={formData.email} />
          </div>
        </div>
      </div>
      <UpdatePassword
        password={formData.password}
        handleChange={handleChange}
      />
    </div>
  );
};

export default ProfileSettings;
