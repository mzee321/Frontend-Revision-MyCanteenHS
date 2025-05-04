import React, { useState } from 'react';
import axios from 'axios';
import './AddVendor.css';
import avatar from '../images/avatar.jpg';

import { toast } from 'react-hot-toast';

const AddVendor = ({ onClose }) => {
  const [vendorData, setVendorData] = useState({
    image: null,
    preview: avatar,
    vendorName: '',
    stallName: '',
    email: '',
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
    formData.append('name', vendorData.vendorName);
    formData.append('stallname', vendorData.stallName);
    formData.append('email', vendorData.email);
    formData.append('password', vendorData.password);
    formData.append('userType', 'vendor');
    formData.append('authentication', 'Authenticated');
    if (vendorData.image) {
      formData.append('profilePicture', vendorData.image);
    }
  
    try {
      const response = await axios.post("http://localhost:5000/registervendor", formData);
      toast.success("Vendor successfully added!");
      setVendorData({
        image: null,
        preview: avatar,
        vendorName: '',
        stallName: '',
        email: '',
        password: ''
      });
      onClose();
    } catch (error) {
      console.error("Axios error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2 className="page-title1">Add New Vendor</h2>
        <form className="add-vendor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              name="image"
              className="form-control"
              accept="image/*"
              onChange={handleChange}
              required
            />
            <div className="image-preview">
              <img
                src={vendorData.preview || 'https://via.placeholder.com/120'}
                alt="Preview"
                className="preview-image"
              />
            </div>
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
            <label htmlFor="password"> Set Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={vendorData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="custom-submit-btn">
            Add Vendor
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVendor;
