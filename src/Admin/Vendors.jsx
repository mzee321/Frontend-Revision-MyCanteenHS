import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Admin from '../global/Admin';
import AddVendor from './AddVendor'; 
import EditVendors from './EditVendors';
import axios from 'axios';

import './Vendors.css';

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingVendor, setEditingVendor] = useState(null);
  const [vendorList, setVendorList] = useState([]);
  const vendorsPerPage = 4;

  // Fetch vendor data on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getVendorLists");
        if (response.data.status === "ok") {
          setVendorList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendorList.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vendor.stallname && vendor.stallname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);
  const indexOfLastVendor = currentPage * vendorsPerPage;
  const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor);

  const deleteVendor = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirmed) return;
  
    try {
      const response = await axios.delete(`http://localhost:5000/delete-vendor/${id}`);
      if (response.data.status === 'ok') {
        setVendorList((prev) => prev.filter((vendor) => vendor._id !== id));
      } else {
        alert("Failed to delete vendor.");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("An error occurred while deleting the vendor.");
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Admin>
      <div className="vendors-container">
        <h2 className="page-title">Canteen Vendors</h2>

        <button className="add-vendor-button" onClick={() => setIsModalOpen(true)}>
          + Add Vendor
        </button>

        {/* Search Bar */}
        <div className="search-bar">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Vendors Table */}
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stall Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVendors.map((vendor) => (
              <tr key={vendor._id}>
                <td>{vendor.name}</td>
                <td>{vendor.stallname}</td>
                <td>{vendor.email}</td>
                <td>
                  <button
                    className="action-btn edit-vendor-btn"
                    onClick={() => setEditingVendor(vendor)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-vendor-btn"
                    onClick={() => deleteVendor(vendor._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Modals */}
        {isModalOpen && <AddVendor onClose={() => setIsModalOpen(false)} />}
        {editingVendor && (
          <EditVendors
            vendor={editingVendor}
            onClose={() => setEditingVendor(null)}
          />
        )}
      </div>
    </Admin>
  );
};

export default Vendors;
