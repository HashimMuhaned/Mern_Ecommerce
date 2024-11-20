import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { CheckUserContext } from "../context/CheckUserToken";
import "../profilePageStyle.css";
import ProfileSettings from "../components/ProfileSettings";

const ProfilePage = () => {
  const { isLoggedin } = useContext(CheckUserContext); // Accessing userInfo from context

  if (!isLoggedin) {
    return (
      <p id="login_to_view">
        Please{" "}
        <NavLink
          to={"/ethereal/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Login to view your profile.
        </NavLink>
      </p>
    );
  }

  return (
    <div className="account-setting-section">
      <section id="profilePage-Main">
        <ProfileSettings />
      </section>
    </div>
  );
};

export default ProfilePage;
