// src/components/Admin.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import './Admin.css';
import logo from "../images/logo1.png";
import defaultProfile from "../images/profile.png";
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../global/store/userReducers';
import { logout } from '../global/store/userAct';
import { toast, Toaster } from 'react-hot-toast';

const Admin = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(defaultProfile);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setProfilePicture(
        parsedUserInfo.profilePicture
          ? `http://localhost:5000/${parsedUserInfo.profilePicture}`
          : defaultProfile
      );

      if (!userState.userInfo) {
        dispatch(
          userActions.setUserInfo({
            _id: parsedUserInfo._id,
            name: parsedUserInfo.name,
            profilePicture: parsedUserInfo.profilePicture,
            token: localStorage.getItem("token"),
          })
        );
      }
    } else {
      setProfilePicture(defaultProfile);
    }

    if (
      (!storedUserInfo || !userInfo || userInfo.name === "Guest") &&
      !isLoggingOut &&
      !storedUserInfo
    ) {
      toast.error("You need to login first, before starting the session!", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#f44336",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
        },
      });
      navigate("/login");
    }
  }, [dispatch, navigate, isLoggingOut, userInfo, userState.userInfo]);

  const logoutHandler = () => {
    setIsLoggingOut(true);
    dispatch(logout());

    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    setTimeout(() => {
      setIsLoggingOut(false);
      navigate("/login");
    }, 100);
  };

  return (
    <div className="layout-container">
      <Toaster />
      {/* Sidebar */}
      <div className={`custom-sidebar text-white ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h5 className="logo">Admin</h5>
        </div>
        <div className="sidebar-profile">
          <img src={profilePicture} alt="Profile" className="profile-image" />
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/managevendors" className="nav-link">Manage Vendors</NavLink>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content-area">

        {/* Top Menu */}
        <div className="top-bar">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '☰ Collapse' : '☰ Expand'}
          </button>
          <div className="dropdown">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              Hello, {userInfo?.name || "Admin"}!
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu show">
                <li>
                  <Link className="dropdown-item" to="/admin/editprofile" onClick={closeDropdown}>
                    Edit Profile
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={logoutHandler}>
                    Log out
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Child Routes / Pages */}
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Admin;
