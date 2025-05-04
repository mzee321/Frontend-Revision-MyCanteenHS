import React, { useState, useEffect } from "react";
import Modal from "react-modal"; // Import react-modal
import NavBar from "../../global/NavBar";
import PageNav from "../global/PageNav";
import { userActions } from "../../global/store/userReducers";
import { useDispatch, useSelector } from "react-redux";
import fallbackImage from "../images/addicon.png";
import { toast, Toaster } from "react-hot-toast";

Modal.setAppElement("#root"); // Required for accessibility

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    stallname:"",
    profilePicture: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
  const [fileName, setFileName] = useState("");

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
              stallname: data.stallname || "",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalIsOpen(true); // Open the modal when the Save Changes button is clicked
  };

  const handleLogout = async () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("stallname", profile.stallname);
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

      const response = await fetch(`http://localhost:5000/editvendor/${encodeURIComponent(userId)}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!", {
          duration: 3000,
        });

        // Clear user data and redirect to login
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        window.location.href = "/login"; // Redirect to login after logout
      } else {
        setMessage(result.message || "Update failed");
      }
    } catch (error) {
      setMessage("An error occurred while updating the profile.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NavBar isNavBar={true} />
      <Toaster />
      {/* <PageNav /> */}
      <div className="edit-profile-container">
      <h2 className="edit-page-title">Edit Profile</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit} className="edit-profile-form" encType="multipart/form-data">
          <div className="form-group">
            <label>Profile Picture:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {previewImage && (
              <div className="image-preview-container">
                <img src={previewImage} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="stallname">Stall Name</label>
            <input
              type="text"
              id="stallname"
              name="stallname"
              value={profile.stallname}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>

      {/* Modal Implementation */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Confirm Logout"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h3 className="modal-title">Confirm Logout</h3>
        </div>
        <div className="modal-body">
          <p>This action will log you out to apply profile changes. Do you want to proceed?</p>
        </div>
        <div className="modal-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
          <button className="cancel-btn" onClick={() => setModalIsOpen(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EditProfile;
