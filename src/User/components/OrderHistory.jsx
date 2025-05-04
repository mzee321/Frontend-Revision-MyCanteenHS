import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../global/NavBar";
import PageNav from "../global/PageNav";
import { useSelector } from "react-redux";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]); // Order history data
  const [stallnames, setStallnames] = useState([]); // Stall names
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const itemsPerPage = 10; // Number of items per page (updated to 10)

  const userState = useSelector((state) => state.user); // Access Redux state
  const userInfo = userState?.userInfo || JSON.parse(localStorage.getItem("userInfo")); // Extract userInfo
  const username = userInfo?.name || "Guest"; // Replace with the actual logged-in username

  // Fetch order history data from the backend
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders/completed", {
        params: { orderBy: username, page: currentPage, limit: itemsPerPage },
      });

      if (response.data.status === "ok") {
        setOrders(response.data.orders);
        setTotalPages(Math.ceil(response.data.totalOrders / itemsPerPage)); // Set total pages dynamically
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      setOrders([]);
      setTotalPages(1);
    }
  };

  // Fetch stall names for the logged-in user
  const fetchStallnames = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/stallnames", {
        params: { orderBy: username },
      });

      if (response.data.status === "ok") {
        setStallnames(response.data.stallnames);
      } else {
        setStallnames([]);
      }
    } catch (error) {
      console.error("Error fetching stallnames:", error);
      setStallnames([]);
    }
  };

  // Fetch orders and stall names when the component mounts or when currentPage changes
  useEffect(() => {
    fetchOrderHistory();
    fetchStallnames();
  }, [currentPage]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <NavBar isNavBar={true} />
      <PageNav />
      <div className="order-history-container">
        <h2 className="page-title">Order History</h2>
        <h6 id="canteen-namez">Welcome, {username}!</h6>

        {/* Order History Table */}
        <table className="order-history-table">
          <thead>
            <tr>
              <th>Ticket Number</th>
              <th>Stall Name</th>
              <th>Order Date and Time</th> {/* Updated column header */}
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.ticketNumber}>
                <td>{order.ticketNumber}</td>
                <td>
                  {/* Map stallname to the order */}
                  {stallnames.length > 0 &&
                    stallnames
                      .filter((stall) => stall.stallID === order.stallId) // Match stallId from the order to stallID in stallnames
                      .map((stall, index) => {
                        // Ensure you only show the first unique stallname
                        if (index === 0) {
                          return stall.stallname;
                        }
                        return null;
                      })[0] || "Unknown Stall"}
                </td>
                <td>
                  {new Date(order.createdAt).toLocaleString()} {/* Display both date and time */}
                </td>
                <td>₱{order.totalAmount}</td>
                <td>
                  <button className="view-details-btn">View Receipt</button>
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
              className={`pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
