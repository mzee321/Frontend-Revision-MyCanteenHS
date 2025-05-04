import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { userActions } from "../global/store/userReducers";
import "./LineGraph.css";

const LineGraph = () => {
  const [monthlySales, setMonthlySales] = useState(Array(12).fill(0)); // Initialize sales data for 12 months
  const [availableYears, setAvailableYears] = useState([]); // Store available years
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
  const dispatch = useDispatch();

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
    const fetchAvailableYears = async () => {
      if (!userInfo?._id) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/get-available-years?stallId=${userInfo._id}`
        );
        setAvailableYears(response.data.years); // Store the years available in the database
      } catch (error) {
        console.error("Failed to fetch available years:", error);
      }
    };

    fetchAvailableYears();
  }, [userInfo]);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      if (!userInfo?._id) return;

      // Clear previous sales data before fetching new data for the selected year
      setMonthlySales(Array(12).fill(0));

      try {
        const response = await axios.get(
          `http://localhost:5000/api/orders/get-orders-completed-list-by-year?stallId=${userInfo._id}&year=${selectedYear}`
        );
        const orders = response.data.orders;

        // Process the data to calculate monthly sales totals
        const sales = Array(12).fill(0); // Reset monthly sales array

        orders.forEach((order) => {
          const orderDate = new Date(order.createdAt);
          const monthIndex = orderDate.getMonth(); // Month is 0-based
          sales[monthIndex] += order.totalAmount; // Sum total amount for the month
        });

        setMonthlySales(sales);
      } catch (error) {
        console.error("Failed to fetch completed orders:", error);
      }
    };

    fetchCompletedOrders();
  }, [userInfo, selectedYear]); // Now it listens to `selectedYear`

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value); // Update selected year
  };

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Monthly Sales",
        data: monthlySales,
        borderColor: "#a41d21",
        backgroundColor: "rgba(164, 29, 33, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div className="line-chart-container" style={{ position:"relative", top: "-25px", height: "250px", width: "100%" }}>
      <div className="year-dropdown"style={{position:"relative", top: "5px"}}>
        <label htmlFor="year-select">Select Year: </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineGraph;
