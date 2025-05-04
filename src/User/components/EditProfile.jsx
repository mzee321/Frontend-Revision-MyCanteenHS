import React, { useState, useEffect } from "react";
import Modal from "react-modal"; // Import react-modal
import NavBar from "../global/NavBarTest";
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
    profilePicture: "",
    college: "",
    member: "",
    age: "",
    yearLevel: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal
  const [selectedMember, setSelectedMember] = useState("Student"); // Track selected member type

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
              college: data.college || "",
              member: data.member || "",
              age: data.age || "",
              yearLevel: data.yearLevel || "",
            });
            setPreviewImage(profilePictureUrl);
            setSelectedMember(data.member); // Set the member type from the fetched data
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

    // Email validation regex for firstname.lastname@g.msuiit.edu.ph
    const emailRegex = /^[a-zA-Z]+(\.[a-zA-Z]+)?@g\.msuiit\.edu\.ph$/;
    if (!emailRegex.test(profile.email)) {
      toast.error("Please enter a valid email address in the format: firstname.lastname@g.msuiit.edu.ph");
      return;
    }

    setModalIsOpen(true); // Open the modal when the Save Changes button is clicked
  };

  const handleLogout = async () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("college", profile.college);
    formData.append("member", profile.member);
    formData.append("age", profile.age);
    formData.append("yearLevel", profile.yearLevel);

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

      const response = await fetch(`http://localhost:5000/edituser/${encodeURIComponent(userId)}`, {
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
            <label htmlFor="college">College</label>
            <select
              id="college"
              name="college"
              value={profile.college}
              onChange={handleChange}
              disabled={selectedMember === "Staff"}
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
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={profile.age}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="yearLevel">Year Level</label>
            <select
              id="yearLevel"
              name="yearLevel"
              value={profile.yearLevel}
              onChange={handleChange}
              disabled={selectedMember !== "Student"}
            >
              <option value="">Select Year Level</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="N/A">N/A</option>
            </select>
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
