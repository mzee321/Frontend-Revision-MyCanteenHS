import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "./BarGraph.css"; // Import your custom CSS
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../global/store/userReducers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement, // For "line" charts
} from "chart.js";

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const BarGraph = () => {
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Load user info from localStorage if not already in Redux state
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
    const fetchCompletedOrders = async () => {
      if (!userInfo?._id) return;
      try {
        // Fetch the orders for the stall using the stallId
        const response = await axios.get(
          `http://localhost:5000/api/orders/get-orders-completed-list?stallId=${userInfo?._id}`
        );
        const orders = response.data.orders;
  
        // Process the data to calculate the quantity of each product
        const productQuantities = {};
  
        orders.forEach((order) => {
          order.items.forEach((item) => {
            const { productName, quantity } = item;
            if (productQuantities[productName]) {
              productQuantities[productName] += quantity;
            } else {
              productQuantities[productName] = quantity;
            }
          });
        });
  
        // Sort the products by quantity in descending order
        const sortedProductQuantities = Object.entries(productQuantities).sort(
          (a, b) => b[1] - a[1]
        );
  
        // Prepare the sorted data for the bar chart
        const labels = sortedProductQuantities.map((entry) => entry[0]);
        const data = sortedProductQuantities.map((entry) => entry[1]);
  
        setChartData({
          labels: labels,
          datasets: [
            {
              label: "Top-Selling Items",
              data: data,
              backgroundColor: "#FF5733",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
  
    fetchCompletedOrders();
  }, [userInfo?._id]);
  

  const options = {
    responsive: true, // Make the chart responsive
    maintainAspectRatio: false, // Allow resizing to fit container
    plugins: {
      legend: {
        display: true,
        position: "top", // Legend position
      },
    },
    scales: {
      x: {
        type: "category", // Use category scale for x-axis
        ticks: {
          font: {
            size: 12, // Font size for x-axis labels
          },
        },
      },
      y: {
        ticks: {
          beginAtZero: true, // Ensure y-axis starts from 0
          font: {
            size: 12, // Font size for y-axis labels
          },
        },
      },
    },
  };

  return (
    <div className="bar-chart-container" style={{ height: "250px", width: "100%" }}> 
      <Bar id="barChart" data={chartData} options={options} />
    </div>
  );
};

export default BarGraph;
