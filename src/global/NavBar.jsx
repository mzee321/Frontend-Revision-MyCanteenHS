import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./NavBar.css";
import logo from "../imagefiles/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../global/store/userAct";
import defaultProfile from "../images/profile.png";
import { userActions } from "../global/store/userReducers";
import { toast, Toaster } from "react-hot-toast";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Hamburger menu state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Profile dropdown state
  const [isMobile, setIsMobile] = useState(false); // Tracks if the interface is mobile
  const mobileDropdownRef = useRef(null); // Ref for the mobile dropdown menu
  const profileMenuRef = useRef(null); // Ref for the PC profile dropdown menu
  const hamburgerRef = useRef(null); // Ref for the hamburger button
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(defaultProfile); // Default profile picture
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout state

    // Get user info from Redux
    const userState = useSelector((state) => state.user);
    const userInfo = userState?.userInfo;

    useEffect(() => {
      // Check localStorage for userInfo on component mount
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setProfilePicture(
          parsedUserInfo.profilePicture
            ? `http://localhost:5000/${parsedUserInfo.profilePicture}`
            : defaultProfile
        );
    
        // Update Redux store if not already set
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
        setProfilePicture(defaultProfile); // Default profile picture for guests
      }
    
      // Only show the toast if no valid user info is found
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
      setIsLoggingOut(true); // Mark as logging out
      dispatch(logout());
    
      // Remove userInfo and token from localStorage
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
    
      // Ensure navigation happens only after clearing localStorage
      setTimeout(() => {
        setIsLoggingOut(false); // Reset the logout flag
        navigate("/login");
      }, 100); // Adding a small delay to ensure localStorage is cleared
    };
  
  // Listen for window resize events to determine if we are on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set mobile breakpoint at 768px
    };

    handleResize(); // Check on component mount
    window.addEventListener("resize", handleResize); // Listen for resize events

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup listener
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close the mobile dropdown menu
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target) &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }

      // Close the profile menu
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to toggle the mobile dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown state
  };

  // Function to navigate to the Edit Profile page
  const navigateToEditProfile = () => {
    navigate("../viewvendorprofile");
  };

  return (
    <div>
              <Toaster />
      {/* Header Bar */}
      <header className="header">
        {/* Logo and Title */}
        <a href="/VendorHomepage" className="navbar-logo">
          <img src={logo} alt="Logo" />
        </a>
        {!isMobile && <h5 className="navbar-title">My.Canteen</h5>}

        {/* Regular Nav Links (PC Interface) */}
        <div className={`nav-links ${isMobile ? "hidden" : ""}`}>
          <ul>
            <li>
              <button onClick={() => navigate("/vendorhomepage")}>
                Home
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/trackorder")}>
                Orders
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/products")}>
                Products
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/archives")}>
                Archives
              </button>
            </li>
          </ul>
        </div>

        {/* Hamburger Menu (Mobile Only) */}
        {isMobile && (
          <div
            ref={hamburgerRef}
            className="hamburger"
            onClick={toggleDropdown} // Toggle dropdown on hamburger click
          >
            <FontAwesomeIcon icon={isDropdownOpen ? faTimes : faBars} />
          </div>
        )}

        {/* Profile Picture (Mobile Only) */}
        {isMobile && (
          <div
            className="profile-picture"
            onClick={navigateToEditProfile} // Navigate to EditProfile on click
          >
          <img
            src={profilePicture} // Use state for profile picture
            alt="Profile"
            className="user-pic"
          />
          </div>
        )}

        {/* Dropdown Menu (Mobile Only) */}
        {isDropdownOpen && isMobile && (
          <div ref={mobileDropdownRef} className="dropdown-menu open">
            <ul>
            <li className="section-title">Hello, {userInfo?.name}!</li>
              <li className="section-title">Page</li>
              <li>
                <button onClick={() => navigate("/vendorhomepage")}>
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/trackorder")}>
                  Orders
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/products")}>
                  Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/archives")}>
                  Archives
                </button>
              </li>
              <div className="separator"></div>

              <li>
                <button onClick={() => navigate("/viewvendorprofile")}>
                  View Profile
                </button>
              </li>
              <li>
              <a href="/login">
                <button onClick={logoutHandler}>Log Out</button>
              </a>
              </li>
            </ul>
          </div>
        )}

        {/* User Menu (PC Only) */}
        {!isMobile && (
          <div
            ref={profileMenuRef}
            className="user-menu"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          >
          <img
            src={profilePicture} // Use state for profile picture
            alt="Profile"
            className="user-pic"
          />
            <p className="username">{userInfo?.name || "Guest"}</p>
            {isProfileMenuOpen && (
              <div className="sub-menu-wrap">
                <div className="sub-menu">
                  <div className="user-info">
                    <hr />
                    <div
                      className="sub-menu-link"
                      onClick={() => navigate("/viewvendorprofile")}
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fa-solid fa-user"></i>
                      <p>View Profile</p>
                    </div>
                    <a href="/login" className="sub-menu-link">
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <p onClick={logoutHandler}>Logout</p>
                  <span></span>
                </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
};

export default NavBar;
