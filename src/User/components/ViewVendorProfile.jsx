import React, { useState, useEffect } from "react";
import NavBar from "../../global/NavBar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../global/store/userReducers";
import fallbackImage from "../images/addicon.png";

const ViewProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;

  const [profilePicture, setProfilePicture] = useState(fallbackImage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stallname, setstallName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!userState.userInfo && storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      dispatch(
        userActions.setUserInfo({
          _id: parsedUserInfo._id,
          name: parsedUserInfo.name,
          stallname: parsedUserInfo.stallname,
          token: localStorage.getItem("token"),
        })
      );
    }
  }, [dispatch, userState.userInfo]);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo?._id || storedUserInfo?._id;

      if (!userId) {
        setError("User ID not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/user/${encodeURIComponent(userId)}`);
        const data = await response.json();

        if (response.ok) {
          setProfilePicture(
            data.profilePicture ? `http://localhost:5000/${data.profilePicture.replace(/\\/g, "/")}` : fallbackImage
          );
          setName(data.name || "N/A");
          setstallName(data.stallname || "N/A");
          setEmail(data.email || "N/A");
        } else {
          setError(data.message || "Failed to load user data");
        }
      } catch (error) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userInfo]);

  const handleEdit = () => {
    navigate("/vendoreditprofile");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavBar isNavBar={true} />
      <div className="view-profile-container">
        <h2 className="view-page-title">View Profile</h2>
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="view-profile-details">
            <img
              src={profilePicture}
              alt="Profile"
              className="view-profile-picture"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                marginBottom: "20px",
              }}
            />
            <div className="view-profile-item">
              <span className="label">Name:</span>
              <span className="value">{name}</span>
            </div>
            <div className="view-profile-item">
              <span className="label">Email:</span>
              <span className="value">{email}</span>
            </div>
            <div className="view-profile-item">
              <span className="label">Stall Name:</span>
              <span className="value">{stallname}</span>
            </div>
            <button onClick={handleEdit} className="edit-btn">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
