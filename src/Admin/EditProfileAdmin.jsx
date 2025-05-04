// src/components/EditProfileAdmin.jsx
import React, { useEffect, useState } from "react";
import Admin from "../global/Admin";
import "./AddVendor.css";
import fallbackImage from "../images/avatar.jpg";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../global/store/userReducers";
import { toast } from "react-hot-toast";

const EditProfileAdmin = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profilePicture: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!userState.userInfo && storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      dispatch(
        userActions.setUserInfo({
          _id: parsedUserInfo._id,
          name: parsedUserInfo.name,
          token: localStorage.getItem("token"),
        })
      );
    }
  }, [dispatch, userState.userInfo]);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo?._id || storedUserInfo?._id;

      if (userId) {
        try {
          const response = await fetch(`http://localhost:5000/user/${encodeURIComponent(userId)}`);
          const data = await response.json();
          if (response.ok) {
            const profilePictureUrl = data.profilePicture
              ? `http://localhost:5000/${data.profilePicture.replace(/\\/g, "/")}`
              : fallbackImage;

            setProfile({
              name: data.name || "",
              email: data.email || "",
              profilePicture: profilePictureUrl,
            });
            setPreviewImage(profilePictureUrl);
          } else {
            setError(data.message || "Failed to load user data");
          }
        } catch (error) {
          setError("Error fetching user data");
        } finally {
          setLoading(false);
        }
      } else {
        setError("User ID not found.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        setSelectedFile(file);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setFileName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setModalIsOpen(true);
  };

  const handleConfirmUpdate = async () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    try {
      const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
      const userId = userInfo?._id || storedUserInfo?._id;

      if (!userId) {
        setMessage("User ID not found.");
        return;
      }

      const response = await fetch(`http://localhost:5000/editadmin/${encodeURIComponent(userId)}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!", {
          duration: 3000,
        });

        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setMessage(result.message || "Update failed");
      }
    } catch (error) {
      setMessage("An error occurred while updating the profile.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Admin>
      <div className="add-vendor-container1">
        <h2 className="page-title">Edit Profile</h2>
        <form className="add-vendor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profilePicture">Upload Image</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              className="form-control"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="custom-submit-btn">
            Save Changes
          </button>
        </form>

        {/* Confirmation Modal */}
        {modalIsOpen && (
          <div className="modal-overlay">
            <div className="modal-content enhanced-modal">
              <h3 className="modal-title">Confirm Update</h3>
              <p className="modal-message">Are you sure you want to save the changes to your profile?</p>
              <div className="modal-buttons1">
                <button className="custom-submit-btn" onClick={handleConfirmUpdate}>
                  Yes, Save
                </button>
                <button className="custom-submit-btn" onClick={() => setModalIsOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {message && <p style={{ color: "red" }}>{message}</p>}
      </div>
    </Admin>
  );
};

export default EditProfileAdmin;
