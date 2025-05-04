import React, { useState, useEffect } from "react";
import NavBar from "../global/NavBarTest";
import PageNav from "../global/PageNav";

const OrderTracking = () => {
  const [currentStep, setCurrentStep] = useState(1); // Step 1 = Order Received, Step 2 = Processing, Step 3 = Ready for Pickup

  // Simulated data for stall and order number
  const stallName = "Mi Amor Store";
  const orderNumber = "ORD12345";

  const steps = [
    { id: 1, label: "Order Received" },
    { id: 2, label: "Processing" },
    { id: 3, label: "Ready for Pick Up" },
  ];

  useEffect(() => {
    // Simulate automatic step updates
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1);
      }, 3000); // Update every 3 seconds (adjustable)
      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [currentStep, steps.length]);

  return (
    <div>
      <NavBar isNavBar={true} />
      {/* <PageNav /> */}
      <div className="order-tracking-container">
        <h2 className="tracking-title">Order Tracking</h2>

        {/* Order Information Section */}
        <div className="order-info">
          <p><strong>Stall:</strong> {stallName}</p>
          <p><strong>Order Number:</strong> {orderNumber}</p>
        </div>

        {/* Tracking Steps */}
        <div className="tracking-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step ${currentStep >= step.id ? "active" : ""}`}
            >
              <div className="step-circle">{step.id}</div>
              <div className="step-label">{step.label}</div>
              {step.id < steps.length && (
                <div className={`step-line ${currentStep > step.id ? "active" : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
