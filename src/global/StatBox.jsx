// src/components/StatBox.jsx
import React from 'react';
import './StatBox.css';

const StatBox = ({ title, value, percentage, description }) => {
  return (
    <div className="stat-box">
      <h5 className="stat-title">{title}</h5>
      <div className="stat-value">{value}</div>
      <div className="stat-percentage">
        <span className="arrow">↑</span> {percentage}%
      </div>
      <div className="stat-description">{description}</div>
    </div>
  );
};

export default StatBox;
