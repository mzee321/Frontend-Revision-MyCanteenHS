import React, { useState } from "react";
import "./Register.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [files, setFiles] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
const [otp, setOtp] = useState("");
const [userEmail, setUserEmail] = useState("");

const handleOtpSubmit = async () => {
  const response = await fetch("http://localhost:5000/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, otp }),
  });

  const data = await response.json();

  if (data.status === "authenticated") {
    toast.success("Verification successful! You can now log in.");
    navigate("/login");
  } else {
    toast.error("Invalid OTP. Please try again.");
  }
};


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      stallname: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "vendor",
    },
    mode: "onChange",
  });
//------------------Profile Pic-----------------
const handleProfilePictureChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    // Check image resolution (minimum 170x170 pixels)
    if (img.width < 170 || img.height < 170) {
      alert("Profile picture must be at least 170x170 pixels.");
      return;
    }
    setProfilePicture(img.src);
    setFiles(file);
  };

  img.onerror = () => {
    alert("Invalid image file. Please upload a valid image.");
  };
};

//----------------------------------------------
const submitHandler = async (data) => {
  const { name, stallname, email, password, confirmPassword } = data;

  if (password !== confirmPassword) {
    toast.error("Passwords do not match.", {
      duration: 5000,
      position: "top-center",
      style: {
        background: "#f44336",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
      },
    });
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("stallname", stallname);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("userType", "vendor");
  if (files) {
    formData.append("profilePicture", files); // Key should match your backend field name
  }

  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      body: formData, // Send FormData instead of JSON
    });

    const responseData = await response.json();

    if (responseData.status === "pending_verification") {
      setUserEmail(email);
      setShowOtpModal(true); // Show OTP modal
    } else if (responseData.status === "email_exists") {
      toast.error("Email is already registered.");
    } else {
      toast.error("Something went wrong.");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    toast.error("Registration failed.");
  }
};


  return (
    <div className="background">
      <Toaster/>
      <div className="login-container">
        <div className="login-form">
          <h1>Register as a Vendor</h1>
          <form onSubmit={handleSubmit(submitHandler)}>
          <div className="form-group">
              <label htmlFor="profilePicture">Stall Profile Picture</label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                required
              />
              <p className="small-text">* Minimum size: 170x170 pixels.</p>
            </div>
            {profilePicture && (
              <div className="profile-preview">
                <img src={profilePicture} alt="Profile Preview" className="profile-picture-preview" />
                <p className="preview-text">Profile Picture Preview</p>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="name">Vendor Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your vendor name"
                {...register("name", { required: "Vendor name is required" })}
              />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="stallname">Stall Name</label>
              <input
                type="text"
                id="stallname"
                placeholder="Enter your stall name"
                {...register("stallname", { required: "Stall name is required" })}
              />
              {errors.stallname && (
                <p className="error">{errors.stallname.message}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Example@vendor.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="At least 8 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter your password"
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                })}
              />
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword.message}</p>
              )}
            </div>
            <button type="submit" className="btn-submit">
              Register
            </button>
          </form>
          <div className="extras">
            <p>
              Already have a vendor account?{" "}
              <a href="#" onClick={() => navigate("/login")}>
                Log In
              </a>
            </p>
          </div>
        </div>
        <div className="login-image"></div>
      </div>
      {showOtpModal && (
    <>
      <div className="otp-overlay" onClick={() => setShowOtpModal(false)}></div>
      <div className="otp-modal">
        <h2>Enter 6-digit OTP sent to your email</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />
        <button onClick={handleOtpSubmit}>Verify</button>
        <button onClick={() => setShowOtpModal(false)}>Cancel</button>
      </div>
    </>
  )}
    </div>
  );
};

export default VendorRegister;
