import React from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./LandingPage.css";
import logo from "../images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import landing from "./landing.png";

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* Header Section */}
      <header className="l-header">
        <div className="logo-container">
          {/* <img src={logo} alt="App Logo" className="logo" /> */}
          <h1 className="app-title">My.Canteen</h1>
        </div>
        <button className="login-btn" onClick={handleLogin}>
          <FontAwesomeIcon icon={faUser} className="icon" /> Log In
        </button>
      </header>

      {/* Main Section */}
      <main className="main">
        <section className="hero">
          <div className="overlay">
            <h2>Discover Amazing Features</h2>
            <p>
              Experience the convenience of our app. <br/> Join us today and make your ordering easier!
            </p>
          </div>
          <img src={landing} alt="Campus Lawn" className="my-image" />
        </section>
      </main>

      {/* Footer Section */}
      <footer className="footer1">
        <p>&copy; 2025 My.Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
