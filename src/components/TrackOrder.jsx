import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userActions } from "../global/store/userReducers";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "../global/NavBar";
import PageNav from "../global/PageNav";
import axios from "axios"; // Import Axios for API requests
import "./TrackOrders.css";
import jsPDF from "jspdf";

const TrackOrders = () => {
  const [activeTab, setActiveTab] = useState("Incoming");
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [readyForPickupOrders, setReadyForPickupOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [pickupTimers, setPickupTimers] = useState({}); // FIXED: State for timers
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
  const dispatch = useDispatch();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [orders, setOrders] = useState([]);
  const stallname = JSON.parse(localStorage.getItem("userInfo"))?.stallname || "Unknown Stall";
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");



  /** Added Code--------------------------------------- */
  // Fetch order history data from the backend
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/orders/completedbystall",
        {
          params: {
            stallId: userInfo?._id,
            page: currentPage,
            limit: itemsPerPage,
          },
        }
      );

      if (response.data.status === "ok") {
        setOrders(response.data.orders);
        setTotalPages(Math.ceil(response.data.totalOrders / itemsPerPage));// Set total pages dynamically
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

   // useEffect to fetch data when the current page changes
   useEffect(() => {
    if (userInfo?._id) {
      fetchOrderHistory();
    }
  }, [currentPage, userInfo]);

    const generateReceipt = (order, action) => {
      const doc = new jsPDF();
    
      // Header
      doc.setFont("Poppins", "bold");
      doc.setFontSize(18);
      doc.text(`My.Canteen`, 90, 10);
      doc.text(`${stallname} - Order Slip`, 65, 20);
      doc.setFontSize(12);
      doc.text("Thank you for your purchase!", 20, 30);
      doc.line(20, 35, 190, 35); // Horizontal line
    
      // Order Details
      doc.setFontSize(14);
      doc.text("Order Details", 20, 50);
      doc.setFontSize(12);
      doc.text(`Ordered By: ${order.orderByName}`, 20, 60);
      doc.text(`Order Number: ${order.ticketNumber}`, 20, 70);
      doc.text(
        `Stall:${stallname}`,
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
        `${stallname}`,
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

  /** Added Code-------------------------------------- */
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

  const moveToNextStage = async (order, from, to, setFrom, setTo, newStatus) => {
    try {
      const response = await axios.patch("http://localhost:5000/api/orders/update-status", {
        orderId: order._id,
        status: newStatus,
      });
  
      if (response.data.status === "ok") {
        setFrom(from.filter((o) => o._id !== order._id));
        setTo([...to, { ...order, status: newStatus }]);
  
        if (newStatus === "readyForPickup") {
          setPickupTimers((prevTimers) => ({
            ...prevTimers,
            [order._id]: 30 * 60, // 30 minutes countdown
          }));
        }
      } else {
        console.error("Failed to update order status:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };



    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const stallId = userInfo?._id;
          if (!stallId) return;
    
          const response = await axios.get("http://localhost:5000/api/orders/get-orders", {
            params: { stallId },
          });
    
          if (response.data.status === "ok") {
            const allOrders = response.data.orders || [];
    
            const enrichedOrders = await Promise.all(
              allOrders.map(async (order) => {
                if (!order.orderById) return { ...order, orderByName: "Unknown User" };
                try {
                  const userResponse = await axios.get(`http://localhost:5000/api/users/get-user`, {
                    params: { id: order.orderById },
                  });
                  const userName = userResponse.data?.user?.name || "Unknown User";
                  return { ...order, orderByName: userName };
                } catch (error) {
                  console.error("Error fetching user data:", error);
                  return { ...order, orderByName: "Unknown User" };
                }
              })
            );
    
            const readyOrders = enrichedOrders.filter((order) => order.status === "readyForPickup");
    
            // Initialize timers for existing "Ready for Pickup" orders
            setPickupTimers(() => {
              const now = new Date().getTime();
              const newTimers = {};
            
              readyOrders.forEach((order) => {
                const orderCreatedAt = new Date(order.createdAt).getTime();
                const timePassed = Math.floor((now - orderCreatedAt) / 1000); // Time passed in seconds
                const timeLeft = Math.max(30 * 60 - timePassed, 0); // 30 min - elapsed time
                newTimers[order._id] = timeLeft;
              });
            
              return newTimers;
            });
            
    
            setIncomingOrders(enrichedOrders.filter((order) => order.status === "Incoming"));
            setInProgressOrders(enrichedOrders.filter((order) => order.status === "inProgress"));
            setReadyForPickupOrders(readyOrders);
            setCompletedOrders(enrichedOrders.filter((order) => order.status === "Completed"));
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };
    
      const fetchOrdersInterval = setInterval(fetchOrders, 2000);
      return () => clearInterval(fetchOrdersInterval);
    }, [userInfo]);
    
    


    useEffect(() => {
      const interval = setInterval(() => {
        setPickupTimers((prevTimers) => {
          const updatedTimers = { ...prevTimers };
    
          readyForPickupOrders.forEach(async (order) => {
            const orderCreatedTime = new Date(order.createdAt).getTime(); // Convert to timestamp
            const currentTime = new Date().getTime();
            const elapsedSeconds = Math.floor((currentTime - orderCreatedTime) / 1000);
            const remainingSeconds = 1800 - elapsedSeconds; // 30 minutes = 1800 seconds
    
            if (remainingSeconds > 0) {
              updatedTimers[order._id] = remainingSeconds;
            } else {
              // Time expired → Auto-cancel the order
              try {
                await axios.patch(
                  "http://localhost:5000/api/orders/update-status",
                  {
                    orderId: order._id,
                    status: "Cancelled",
                  }
                );
    
                // Remove the cancelled order from state
                setReadyForPickupOrders((orders) => 
                  orders.filter((o) => o._id !== order._id)
                );
    
                delete updatedTimers[order._id];
              } catch (error) {
                console.error("Error auto-canceling order:", error);
              }
            }
          });
    
          return { ...updatedTimers };
        });
      }, 1000); // Update every second
    
      return () => clearInterval(interval);
    }, [readyForPickupOrders]); // Depend on `readyForPickupOrders`
    
  
  

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const completeOrder = async (orderId) => {
    try {
      


      const response = await axios.patch("http://localhost:5000/api/orders/complete-order", {
        orderId,
      });

      if (response.data.status === "ok") {
        // Update local state to move the order to "Completed"
        const completedOrder = incomingOrders.find((order) => order._id === orderId);

        // Move the order to the completed orders section
        setCompletedOrders([...completedOrders, { ...completedOrder, status: "readyForPickup" }]);
        setIncomingOrders(incomingOrders.filter((order) => order._id !== orderId));

        console.log("Order completed successfully");
      } else {
        console.error("Failed to complete order:", response.data.message);
      }
    } catch (error) {
      console.error("Error completing order:", error);
    }
    await axios.post("http://localhost:5000/api/orders/send-complete-email", { orderId });
  };

  const cancelOrder = async () => {
    if (!cancelOrderId) return;
    setIsCancelling(true);

    setTimeout(async () => {
      try {
        await axios.post("http://localhost:5000/api/orders/send-cancel-email", { orderId: cancelOrderId });

        const response = await axios.delete("http://localhost:5000/api/orders/cancel-order", {
          data: { orderId: cancelOrderId },
        });

        if (response.data.status === "ok") {
          setIncomingOrders(incomingOrders.filter((order) => order._id !== cancelOrderId));
          console.log("Order canceled successfully");
        } else {
          console.error("Failed to cancel order:", response.data.message);
        }
      } catch (error) {
        console.error("Error canceling order:", error);
      } finally {
        setIsCancelling(false);
        setCancelOrderId(null);
        setShowPopup(false);
      }
    }, 3000); // 3-second delay
  };

  const confirmCancelOrder = (orderId) => {
    setShowPopup(true);
    setCancelOrderId(orderId);
  };




  const renderOrders = () => {
    let orders = [];
    let setFrom = () => {};
    let setTo = () => {};
    let nextStatus = "";

    const filteredOrders = completedOrders.filter((order) => {
      const createdAtDate = new Date(order.createdAt);
      if (isNaN(createdAtDate.getTime())) {
        console.warn("Skipping order with invalid date:", order);
        return false; // Skip invalid dates
      }
    
      const orderDate = createdAtDate.toISOString().split("T")[0];
    
      return (
        (!filterStartDate || orderDate >= filterStartDate) &&
        (!filterEndDate || orderDate <= filterEndDate)
      );
    });

    

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);


    switch (activeTab) {
      case "incoming":
        orders = incomingOrders;
        setFrom = setIncomingOrders;
        setTo = setInProgressOrders;
        nextStatus = "inProgress";
        break;
      case "inProgress":
        orders = inProgressOrders;
        setFrom = setInProgressOrders;
        setTo = setReadyForPickupOrders;
        nextStatus = "readyForPickup";
        break;
      case "readyForPickup":
        orders = readyForPickupOrders;
        setFrom = setReadyForPickupOrders;
        setTo = setCompletedOrders;
        nextStatus = "completed";
        break;
      case "completed":
        // Render table for Completed Orders
        return (
          <div>
            <div className="filterby">
              <label>
                From: 
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="date-filter"
                />
              </label>
              <label>
                To: 
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="date-filter"
                />
              </label>
            </div>

            <table className="order-history-table1">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Ordered By</th>
                <th>Order Date</th>
                <th>Total Cost</th>
                <th>Order Slip</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.ticketNumber}</td>
                  <td>{order.orderByName}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>₱{order.totalAmount}</td>
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
          <div className="pagination2">
            <button
              className="pagination2-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination2-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          </div>
          
        );
        break;
      default:
        break;
    }


    if (orders.length === 0) {
      return <div className="no-orders-message">No orders available</div>;
    }

    return orders.map((order) => (

      <div className="order-card" key={order._id}>
        <p><strong>Order Number:</strong> {order.ticketNumber}</p>
        <p><strong>Ordered By:</strong> {order.orderByName}</p> {/* Updated field */}
        <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

        <div className="order-items">
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <img
                src={`http://localhost:5000/${item.productId.productImage}`}
                alt={item.productId.productName}
                className="product-image"
              />
              <p><strong>Item:</strong> {item.productId.productName}</p>
              <p><strong>Price:</strong> ₱{item.price}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Notes:</strong> {item.notes || "None"}</p>
              <p><strong>Total:</strong> ₱{item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        <div className="total-cost">
          <p><strong>Total Cost:</strong> ₱{order.totalAmount}</p>
        </div>

        <div className="order-actions">
        {activeTab === "incoming" && (
              <>
              <button
                className="cancel-button"
                onClick={() => confirmCancelOrder(order._id)}
                disabled={isCancelling}
              >
                {isCancelling && cancelOrderId === order._id ? "Cancelling..." : "Cancel Order"}
              </button>
                <button className="complete-button" onClick={() => moveToNextStage(order, incomingOrders, inProgressOrders, setIncomingOrders, setInProgressOrders, "inProgress")}>
                  Confirm Order
                </button>
              </>
            )}
          {activeTab === "inProgress" && (
            <>
              <button
                className="cancel-button"
                onClick={() => confirmCancelOrder(order._id)}
                disabled={isCancelling}
              >
                {isCancelling && cancelOrderId === order._id ? "Cancelling..." : "Cancel Order"}
              </button>
              <button className="complete-button" onClick={() => {moveToNextStage(order, inProgressOrders, readyForPickupOrders, setInProgressOrders, setReadyForPickupOrders, "readyForPickup")
              completeOrder(order._id);
              }}>
                 Ready for Pickup
                </button>
            </>
          )}
          {activeTab === "readyForPickup" && (
              <>
              <p><strong>Time Left for Pickup:</strong> {formatTime(Math.max(30 * 60 - Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000), 0))}</p>

                <button
                  className="complete-button"
                  onClick={() => {
                    moveToNextStage(order, readyForPickupOrders, completedOrders, setReadyForPickupOrders, setCompletedOrders, "Completed");

                  }}
                >
                  Mark as Completed
                </button>
              </>
            )}

          {activeTab === "completed" && <p>Order Completed</p>}
        </div>
      </div>

    ));
  };

  return (
    <div>
      <NavBar />
      <PageNav />
      <div className="track-orders-page">
      <div className="tab-buttons">
          <button className={`tab-button ${activeTab === "incoming" ? "active" : ""}`} onClick={() => handleTabSwitch("incoming")}>
            Incoming Orders
          </button>
          <button className={`tab-button ${activeTab === "inProgress" ? "active" : ""}`} onClick={() => handleTabSwitch("inProgress")}>
            Preparation
          </button>
          <button className={`tab-button ${activeTab === "readyForPickup" ? "active" : ""}`} onClick={() => handleTabSwitch("readyForPickup")}>
            Ready for Pickup
          </button>
          <button className={`tab-button ${activeTab === "completed" ? "active" : ""}`} onClick={() => handleTabSwitch("completed")}>
            Completed Orders
          </button>
        </div>
        <div className="orders-container">
          {renderOrders()}
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Are you sure you want to cancel this order?</h3>
            <p>This action cannot be undone.</p>
            <div className="popup-buttons">
              <button className="confirm-button" onClick={cancelOrder}>Yes, Cancel</button>
              <button className="cancel-popup-button" onClick={() => setShowPopup(false)}>No, Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrders; 