import React, { useState, useEffect } from "react";
import "./Register.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState(null);
  const [files, setFiles] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [cooldown, setCooldown] = useState(0); 
  const [tempPassword, setTempPassword] = useState(""); 
  const [selectedMember, setSelectedMember] = useState("");
  const [isCollegeDisabled, setIsCollegeDisabled] = useState(false);
  const [isYearLevelDisabled, setIsYearLevelDisabled] = useState(false);

  const handleOtpSubmit = async () => {
    const response = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, otp }),
    });
  
    const data = await response.json();
  
    if (data.status === "authenticated") {
      // After successful OTP verification, fetch user info
      const tokenResponse = await fetch("http://localhost:5000/login-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: tempPassword }), 
        // tempPassword: you need to either save it temporarily or have a known temp password strategy
      });
  
      const tokenData = await tokenResponse.json();
  
      if (tokenData.status === "ok") {
        const userInfoResponse = await fetch("http://localhost:5000/user-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenData.data.token }),
        });
  
        const userInfoResult = await userInfoResponse.json();
  
        if (userInfoResult.status === "ok") {
          localStorage.setItem("userInfo", JSON.stringify(userInfoResult.data));
          console.log(userInfoResult.data);
          toast.success("Verification successful! You can now use My.Canteen!");
          setTempPassword(""); // clear password
          navigate("/stall");
        } else {
          toast.error("Failed to retrieve user info.");
        }
      } else {
        toast.error("Failed to login user after OTP verification.");
      }
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
      email: "",
      password: "",
      confirmPassword: "",
      role: "customer",
      college: "",
      member: "",
      age: "",
      yearLevel: "",  // <-- add this
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
  if (cooldown > 0) {
    toast.error(`Please wait ${cooldown} seconds before trying again.`);
    return;
  }

  const { name, email, password, confirmPassword, college, member, age, yearLevel } = data;

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
  formData.append("email", email);
  formData.append("password", password);
  formData.append("userType", "customer");
  formData.append("college", college);
  formData.append("member", member);
  formData.append("age", age);
  formData.append("yearLevel", yearLevel);
  if (files) {
    formData.append("profilePicture", files);
  }

  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();

    if (responseData.status === "pending_verification") {
      setUserEmail(email);
      setTempPassword(password); // <---- Save password temporarily
      setShowOtpModal(true);

      // --- Start cooldown timer ---
      setCooldown(30);
    } else if (responseData.status === "email_exists") {
      toast.error("Email is already registered.");
    } else if (responseData.status === "name_exists") {
      toast.error("Name is already registered.");
    } else {
      toast.error("Something went wrong.");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    toast.error("Registration failed.");
  }
};

useEffect(() => {
  let timer;
  if (cooldown > 0) {
    timer = setTimeout(() => {
      setCooldown(cooldown - 1);
    }, 1000); // decrease every second
  }
  return () => clearTimeout(timer);
}, [cooldown]);


  return (
    <div className="background">
      <Toaster/>
      <div className="login-container">
        <div className="login-form">
          <h1>Register as a Customer</h1>
          <form onSubmit={handleSubmit(submitHandler)}>

          <div className="form-group">
              <label htmlFor="profilePicture">Customer Profile Picture</label>
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
              <label htmlFor="name">Customer Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                {...register("name", { required: "Vendor name is required" })}
              />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="firstname.lastname@g.msuiit.edu.ph"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@g\.msuiit\.edu\.ph$/,
                    message: "Email must be in the format: firstname.lastname@g.msuiit.edu.ph",
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

            <div className="form-group">
              <label htmlFor="member">Member Type</label>
              <select
                id="member"
                {...register("member", { required: "Member type is required" })}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedMember(value);
                
                  setIsCollegeDisabled(value === "Staff");
                  setIsYearLevelDisabled(value !== "Student");
                }}
              >
                <option value="">Select Member Type</option>
                <option value="Student">Student</option>
                <option value="Faculty Member">Faculty Member</option>
                <option value="Staff">Staff</option>
              </select>
              {errors.member && <p className="error">{errors.member.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="college">College</label>
              <select
                id="college"
                {...register("college", { 
                  validate: (value) => {
                    if (selectedMember === "Student" || selectedMember === "Faculty Member") {
                      return value !== "" ? true : "College is required";
                    }
                    return true; // Not required for Staff
                  }
                })}
                disabled={selectedMember === "Staff"}
                defaultValue=""
              >
                <option value="">Select College</option>
                <option value="CASS">CASS</option>
                <option value="CCS">CCS</option>
                <option value="CEBA">CEBA</option>
                <option value="CED">CED</option>
                <option value="CHS">CHS</option>
                <option value="COE">COE</option>
                <option value="CSM">CSM</option>
                <option value="N/A">N/A</option>
              </select>
              {errors.college && <p className="error">{errors.college.message}</p>}
            </div>


            <div className="form-group">
              <label htmlFor="yearLevel">Year Level</label>
              <select
                id="yearLevel"
                {...register("yearLevel", {
                  validate: (value) => {
                    if (selectedMember === "Student") {
                      return value !== "" ? true : "Year level is required";
                    }
                    return true; // Not required for Faculty or Staff
                  }
                })}
                disabled={selectedMember !== "Student"}
                defaultValue=""
              >
                <option value="">Select Year Level</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="N/A">N/A</option>
              </select>
              {errors.yearLevel && <p className="error">{errors.yearLevel.message}</p>}
            </div>


            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                placeholder="Enter your age"
                {...register("age", {
                  required: "Age is required",
                  min: { value: 16, message: "Minimum age is 16" }, 
                })}
              />
              {errors.age && <p className="error">{errors.age.message}</p>}
            </div>

            <button type="submit" className="btn-submit">
              Register
            </button>
            {cooldown > 0 && (
                <p style={{ color: "red", marginTop: "10px" }}>
                  You can resend OTP in {cooldown} second{cooldown !== 1 ? "s" : ""}
                </p>
              )}
          </form>
          <div className="extras">
            <p>
              Already have a customer account?{" "}
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
        <button onClick={() => {
  setShowOtpModal(false);
  setUserEmail(""); // Clear user email to allow re-registration
        }}>Cancel</button>
      </div>
    </>
  )}

    </div>
  );
};

export default CustomerRegister;
