import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import "../profilePageStyle.css";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import ConfirmWindow from "../components/ConfirmWindow";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckUserContext } from "../context/CheckUserToken";

const SideNavBar = () => {
  const { handleSignOut } = useContext(CheckUserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDropdownState = localStorage.getItem("isDropdownOpen");
    if (savedDropdownState === "true") {
      setIsDropdownOpen(true);
    }
  }, []);

  const handleDropdownToggle = () => {
    const newDropdownState = !isDropdownOpen;
    setIsDropdownOpen(newDropdownState);

    // Save the new state in localStorage
    localStorage.setItem("isDropdownOpen", newDropdownState);
  };

  const ActiveLinkHighLight = (isActive) => {
    return isActive ? "active-link" : "inactive-link";
  };

  return (
    <nav id="profile-side-navbar" style={{ marginTop: "20px" }}>
      <div className="nav-container">
        <ul id="profile-sideNavbar-links">
          <li
            style={{
              display: "flex",
              flexDirection: "column",
              height: "120px",
              justifyContent: "space-between",
            }}
          >
            <NavLink
              to={"/ethereal/profile/settings"}
              className={({ isActive }) => ActiveLinkHighLight(isActive)}
            >
              Account Setting
            </NavLink>
            <NavLink
              to={"/ethereal/profile/BuyerOrderpage"}
              className={({ isActive }) => ActiveLinkHighLight(isActive)}
            >
              Your Orders
            </NavLink>
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: "120px",
                borderRadius: "4px",
                backgroundColor: "red",
                color: "white",
                height: "30px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </li>
          <li>
            <div className="dropdown">
              <div className="dropdown-toggle" onClick={handleDropdownToggle}>
                Your Store {isDropdownOpen ? <ExpandLess /> : <ExpandMore />}
              </div>
              {isDropdownOpen && (
                <ul
                  className="dropdown-menu"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <li>
                    <NavLink
                      to={"/ethereal/profile/add-item"}
                      className={({ isActive }) =>
                        ActiveLinkHighLight(isActive)
                      }
                    >
                      Add Items
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={"/ethereal/profile/item-analysis"}
                      className={({ isActive }) =>
                        ActiveLinkHighLight(isActive)
                      }
                    >
                      Items Analysis
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={"/ethereal/profile/yourItems"}
                      className={({ isActive }) =>
                        ActiveLinkHighLight(isActive)
                      }
                    >
                      Your Items
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={"/ethereal/profile/Orders"}
                      className={({ isActive }) =>
                        ActiveLinkHighLight(isActive)
                      }
                    >
                      Orders
                    </NavLink>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <ConfirmWindow
            show={showModal}
            message="Are you sure you want to sign out?"
            onConfirm={() => handleSignOut(toast, navigate)}
            onCancel={() => setShowModal(false)}
          />
        </ul>
      </div>
      <div className="top-nav-container">
        <ul id="profile-topNavbar-links">
          <li id="main-settings-links">
            <NavLink
              to={"/ethereal/profile/settings"}
              className={({ isActive }) => ActiveLinkHighLight(isActive)}
            >
              Account Setting
            </NavLink>
            <NavLink
              to={"/ethereal/profile/BuyerOrderpage"}
              className={({ isActive }) => ActiveLinkHighLight(isActive)}
            >
              Your Orders
            </NavLink>
            <button onClick={() => setShowModal(true)} id="sign-out-button">
              Sign Out
            </button>
            <ConfirmWindow
              show={showModal}
              message="Are you sure you want to sign out?"
              onConfirm={() => handleSignOut(toast, navigate)}
              onCancel={() => setShowModal(false)}
            />
          </li>
          <li>
            <div className="dropdown">
              <div className="dropdown-toggle" onClick={handleDropdownToggle}>
                Your Store {isDropdownOpen ? <ExpandLess /> : <ExpandMore />}
              </div>
              {isDropdownOpen && (
                <ul
                  className="dropdown-menu"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    paddingTop: "10px",
                  }}
                >
                  <li>
                    <NavLink to={"/ethereal/profile/add-item"}>
                      Add Items
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={"/ethereal/profile/item-analysis"}>
                      Items Analysis
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={"/ethereal/profile/yourItems"}>
                      Your Items
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={"/ethereal/profile/Orders"}>Orders</NavLink>
                  </li>
                </ul>
              )}
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SideNavBar;
