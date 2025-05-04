import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import './login.css'; // Import the CSS file

function LoginGoogle() {
    const onSuccess = async (credentialResponse) => {
        try {
          const res = await fetch("http://localhost:5000/google-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ credential: credentialResponse.credential }),
          });
    
          const data = await res.json();
          console.log(data.message);
        } catch (err) {
          console.error("Login error", err);
        }
    };
    
    const onError = () => {
        console.log("Login Failed");
    };

    return (
        <div id="signInButton" className="login-box">
            <GoogleLogin onSuccess={onSuccess} onError={onError} />
        </div>
    );
}

export default LoginGoogle;