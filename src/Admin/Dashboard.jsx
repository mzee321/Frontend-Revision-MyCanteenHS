// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Admin from '../global/Admin';
import './Dashboard.css';

const StatBox = ({ title, value }) => {
  return (
    <div className="stat-box">
      <h5 className="stat-title">{title}</h5>
      <div className="stat-value">{value}</div>
    </div>
  );
};

const Dashboard = () => {
  const [activeVendors, setActiveVendors] = useState();

  useEffect(() => {
    const fetchActiveVendorCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/countActiveVendors');
        setActiveVendors(response.data.count);
      } catch (error) {
        console.error('Error fetching active vendor count:', error);
      }
    };

    fetchActiveVendorCount();
  }, []);

  return (
    <Admin>
      <div className="dashboard-main d-flex justify-content-between p-3">
        {/* Left side: Stat boxes */}
        <div className="d-flex flex-wrap gap-3">
          <StatBox title="Active Vendors" value={activeVendors} />
        </div>

        {/* Right side: Instruction box */}
        <div className="instruction-box">
          <div className="instruction-header">Guide</div>
          <div className="instruction-body">
            <p>Hello, Admin!</p>
            <p>To begin managing the canteen system, you can view or add vendors using the sidebar.</p>
            <p>Be sure to regularly update vendor records and monitor dashboard statistics.</p>
            <p>For more details, visit the <a href="#">Admin Help Center</a>.</p>
          </div>
        </div>
      </div>
    </Admin>
  );
};

export default Dashboard;
