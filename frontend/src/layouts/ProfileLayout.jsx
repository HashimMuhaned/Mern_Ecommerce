import React, { Fragment } from "react";
import SideNavBar from "../components/SideNavBar";
// import SideNavBarAntD from "../components/SideNavBarAntD" 
import { Outlet } from "react-router-dom";

const ProfileLayout = () => {
  return (
    <Fragment>
      <SideNavBar />
      <Outlet />
    </Fragment>
  );
};

export default ProfileLayout;
