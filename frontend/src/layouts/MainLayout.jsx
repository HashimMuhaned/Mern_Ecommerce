import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
// import MiniNavBar from "../components/MiniNavBar";
import { Fragment } from "react";
import BackButton from "../components/BackButton";
import MobileBottomNavBar from "../components/MobileBottomNavBar";
import ChatMainHome from "../components/ai_chatbot_components/ChatMainHome";
import E_footer from "../components/E_footer";

const MainLayout = () => {

  
  const location = useLocation();
  const hideBackButtonPaths = [
    "/ethereal",
    "/ethereal/signup",
    "/ethereal/login",
    "/ethereal/categories",

    // Add more paths here as needed
  ];

  const showBackButton = !hideBackButtonPaths.includes(location.pathname);

  return (
    <Fragment>
      <NavBar />
      <ChatMainHome />
      {/* <MiniNavBar /> */}
      {showBackButton && <BackButton />}
      <Outlet />
      {/* <E_footer /> */}
      <MobileBottomNavBar />
    </Fragment>
  );
};

export default MainLayout;
