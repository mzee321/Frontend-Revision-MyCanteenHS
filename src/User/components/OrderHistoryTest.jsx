import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import NavBar from "../global/NavBarTest";
import PageNav from "../global/PageNav";
import { useSelector } from "react-redux";

const OrderHistory = () => {
  const userState = useSelector((state) => state.user); // Access Redux state
  const userInfo =
    userState?.userInfo || JSON.parse(localStorage.getItem("userInfo")); // Extract userInfo
  const username = userInfo?.name || "Guest"; // Replace with the actual logged-in username

  const [orders, setOrders] = useState([]);
  const [stallnames, setStallnames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch order history data from the backend
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/orders/completed",
        {
          params: {
            orderById: userInfo?._id,
            page: currentPage,
            limit: itemsPerPage,
          },
        }
      );

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
        params: { orderById: userInfo?._id },
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

  const filteredOrders = orders.filter((order) => {
    const stall = stallnames.find((stall) => stall.stallID === order.stallId);
    const stallName = stall?.stallname || "Unknown";
    const ticketNumber = String(order.ticketNumber || ""); // Ensure ticketNumber is a string

    return (
      searchQuery === "" || // Show all if search query is empty
      ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stallName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const generateReceipt = (order, action) => {
    const doc = new jsPDF();
  
    // Header
    doc.setFont("Poppins", "bold");
    doc.setFontSize(18);
    doc.text(`My.Canteen`, 90, 10);
    doc.text(
      `${
        stallnames.find((stall) => stall.stallID === order.stallId)?.stallname || "Unknown"
      } - Order Slip`,
      65,
      20
    );
    doc.setFontSize(12);
    doc.text("Thank you for your purchase!", 20, 30);
    doc.line(20, 35, 190, 35); // Horizontal line
  
    // Order Details
    doc.setFontSize(14);
    doc.text("Order Details", 20, 50);
    doc.setFontSize(12);
    doc.text(`Ordered By: ${userInfo?.name}`, 20, 60);
    doc.text(`Order Number: ${order.ticketNumber}`, 20, 70);
    doc.text(
      `Stall: ${order.stallname}`,
      20,
      80
    );
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
      20,
      90
    );
  
    // Items Section
    doc.setFontSize(14);
    doc.text("Items:", 20, 110);
  
    doc.setFontSize(12);
    let y = 120;
  
    order.items.forEach((item) => {
      const sanitizedPrice = parseFloat(item.price).toFixed(2);
      const notes = item.notes && item.notes.trim() !== "" ? item.notes : "none";
    
      doc.text(`Item: ${item.productName}`, 20, y);
      y += 10;
      doc.text(`Price: ${sanitizedPrice}`, 20, y);
      y += 10;
      doc.text(`Quantity: ${item.quantity}`, 20, y);
      y += 10;
    
      // Wrap notes into multiple lines if needed
      const splitNotes = doc.splitTextToSize(`Notes: ${notes}`, 170); // 170 width to fit within margins
      doc.text(splitNotes, 20, y);
      y += splitNotes.length * 7; // Move Y based on number of lines (roughly 7px per line)
    
      y += 8; // Extra space between items
    });
  
    // Total Amount
    const sanitizedTotal = parseFloat(order.totalAmount).toFixed(2);
    doc.setFontSize(14);
    doc.text(`Total Amount: ${sanitizedTotal}`, 20, y);
  
    // Footer
    doc.setFontSize(10);
    doc.line(20, y + 10, 190, y + 10); // Horizontal line
    doc.text(
      `${
        stallnames.find((stall) => stall.stallID === order.stallId)?.stallname || "Unknown"
      }`,
      20,
      y + 20
    );
    doc.text("Visit us again!", 20, y + 25);
  
    // Perform action: view or download
    if (action === "view") {
      window.open(doc.output("bloburl"), "_blank"); // Open in a new tab
    } else if (action === "download") {
      doc.save(`Receipt_${order._id}.pdf`); // Download
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <NavBar isNavBar={true} />
      {/* <PageNav /> */}
      <h2 className="page-title">Order History</h2>
      <div className="order-history-container">
        {/* <h6 id="canteen-namez">Welcome, {userInfo?.name || "Guest"}!</h6> */}
        {/* <h6>{userInfo?._id || "Guest"}</h6> */}

        {/* Search Bar */}
        <div className="search-bar">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <table className="order-history-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Stall Name</th>
              <th>Order Date and Time</th>
              <th>Total Amount</th>
              <th>Order Slip</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.ticketNumber}</td>
                <td>{order.stallname}
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>₱{order.totalAmount.toFixed(2)}</td>
                <td>
                  <button
                    className="view-details-btn"
                    onClick={() => generateReceipt(order, "view")}
                  >
                    View
                  </button>
                  <button
                    className="download-receipt-btn"
                    onClick={() => generateReceipt(order, "download")}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`pagination-btn ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => goToPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
    </div>
  );
};

export default OrderHistory;
