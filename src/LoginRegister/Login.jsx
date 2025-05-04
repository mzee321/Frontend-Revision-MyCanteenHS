import React from "react";
import { useNavigate } from "react-router-dom";
import "./styling.css";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast, Toaster } from "react-hot-toast";

function VendorLogin() {
  const navigate = useNavigate();

  const submitHandler = async (data) => {
    const { email, password } = data;

    try {
      const response = await fetch("http://localhost:5000/login-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.status === "ok") {
        localStorage.setItem("loggedIn", true);

        const userInfoResponse = await fetch("http://localhost:5000/user-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: result.data.token }),
        });

        const userInfoResult = await userInfoResponse.json();

        if (userInfoResult.status === "ok") {
          localStorage.setItem("userInfo", JSON.stringify(userInfoResult.data));

          setTimeout(() => {
            const { userType } = userInfoResult.data;

            if (userType === "vendor") {
              navigate("/vendorhomepage");
            } else if (userType === "customer") {
              navigate("/stall");
            } else if (userType === "admin") {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
          }, 100);
        } else {
          toast.error("Unable to fetch user info.");
        }
      } else {
        toast.error(result.error || "Invalid credentials.");
      }
    } catch (error) {
      toast.error("Login error.");
      console.error("Login error:", error);
    }
  };

  const googleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5000/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const result = await response.json();

      if (result.status === "ok") {
        localStorage.setItem("loggedIn", true);

        const userInfoResponse = await fetch("http://localhost:5000/user-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: credentialResponse.credential }),
        });

        const userInfoResult = await userInfoResponse.json();

        if (userInfoResult.status === "ok") {
          localStorage.setItem("userInfo", JSON.stringify(userInfoResult.data));

          const { userType } = userInfoResult.data;

          if (userType === "customer") {
            navigate("/stall");
          }  else if (userType === "vendor") {
            navigate("/vendorhomepage")
          }  else if (userType === "admin") {
            navigate("/dashboard");
          }else {
            toast.error("Only customers and vendors can log in via Google.");
          }
        } else {
          toast.error("User info fetch failed.");
        }
      } else {
        toast.error(result.message || "Google login failed.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login error.");
    }
  };

  const googleLoginError = () => {
    toast.error("Google login failed.");
  };

  return (
    <div className="background">
      <Toaster />
      <div className="login-container">
        <div className="login-form">
          <h1>Welcome to My.Canteen</h1>
          <p className="quote">
            "The best way to predict the future is to create it." - Peter Drucker
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = {
                email: e.target.email.value,
                password: e.target.password.value,
              };
              submitHandler(data);
            }}
          >
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Example@person.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              Log In
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>


          <div className="GoogleBtn">
              {/* Google Sign-In Button */}
              <div style={{ marginTop: "20px" }}>
                <GoogleLogin onSuccess={googleLoginSuccess} onError={googleLoginError} />
              </div>
          </div>

          <div className="signup-container">
            <p>Don't have an account?</p>
            <button onClick={() => navigate("/Register")} className="btn-submit">
              Register as Customer
            </button>
          </div>

          <p className="footer">© 2025 ALL RIGHTS RESERVED</p>
        </div>
        <div className="login-image"></div>
      </div>
    </div>
  );
}

export default VendorLogin;
