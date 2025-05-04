// src/components/EditVendor.jsx
import React, { useState, useEffect } from 'react';
import './AddVendor.css';
import avatar from '../images/avatar.jpg';

const EditVendor = ({ vendor, onClose }) => {
    const [vendorData, setVendorData] = useState({
        image: null,
        preview: avatar,
        vendorName: vendor?.name || '',
        stallName: vendor?.stallname || '',
        email: vendor?.email || '',
        password: ''
      });
      

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        setVendorData((prevData) => ({
          ...prevData,
          image: file,
          preview: URL.createObjectURL(file)
        }));
      }
    } else {
      setVendorData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("id", vendor._id); // send vendor ID
  formData.append("name", vendorData.vendorName);
  formData.append("stallname", vendorData.stallName);
  formData.append("email", vendorData.email);
  if (vendorData.password.trim() !== "") {
    formData.append("password", vendorData.password);
  }
  if (vendorData.image) {
    formData.append("profilePicture", vendorData.image);
  }

  try {
    const response = await fetch("http://localhost:5000/edit-vendor", {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();
    if (result.status === "ok") {
      alert("Vendor updated successfully!");
      onClose(); // close modal
      window.location.reload(); // refresh to see updated data
    } else {
      alert("Failed to update vendor.");
    }
  } catch (error) {
    console.error("Update error:", error);
    alert("An error occurred while updating vendor.");
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="page-title">Edit Vendor</h2>
        <form className="add-vendor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file-upload" className="form-label">Upload Image</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              name="image"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="image-preview">
              <img
                src={vendorData.preview}
                alt="Preview"
                className="preview-image"
              />
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="vendorName">Vendor Name</label>
            <input
              type="text"
              id="vendorName"
              name="vendorName"
              className="form-control"
              value={vendorData.vendorName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="stallName">Stall Name</label>
            <input
              type="text"
              id="stallName"
              name="stallName"
              className="form-control"
              value={vendorData.stallName}
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
              value={vendorData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password (leave blank to keep current)</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={vendorData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="custom-submit-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditVendor;
