import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../global/NavBarTest";
import PageNav from "../global/PageNav";
import axios from "axios";

import { userActions } from "../../global/store/userReducers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const LiveQueue = () => {
  const { stallId } = useParams(); // Extract stallId from the URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user); // Access Redux state
  const userInfo = userState?.userInfo;
  const [stallName, setStallName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userOrder, setUserOrder] = useState(null);
  const [queueData, setQueueData] = useState({
    nowServing: [], // Ensure this is initialized as an empty array
    readyForPickup: [], // Ensure this is initialized as an empty array
    currentTicket: 0,
  });

  

    // Check user info from localStorage
    useEffect(() => {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (!userState.userInfo && storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        dispatch(
          userActions.setUserInfo({
            _id: parsedUserInfo._id,
            name: parsedUserInfo.name,
            token: localStorage.getItem("token"),
          })
        );
      }
    }, [dispatch, userState.userInfo]);

  useEffect(() => {
    // Fetch live queue data from the server
    const fetchLiveQueue = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/live-queue/${stallId}`);
        const data = await response.json();
        if (data.status === "ok") {
          setQueueData(data.data);
        } else {
          console.error("Failed to fetch live queue:", data.message);
        }
      } catch (error) {
        console.error("Error fetching live queue:", error);
      }
    };

    // Initial fetch
    fetchLiveQueue();


  }, [stallId]);

  const handleHome = () => {
    navigate(`/stall`);
  };

  useEffect(() => {
    const fetchStallName = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/getstallname/${encodeURIComponent(stallId)}`);
        setStallName(response.data.stallname);
        setError(""); // Clear any previous error
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch stall name."
        );
      } finally {
        setLoading(false);
      }
    };

    if (stallId) {
      fetchStallName();
    }
  }, [stallId]);


  useEffect(() => {
    const fetchUserOrder = async () => {
      try {
        const name = userInfo?.name;
        if (!name) return;
  
        const response = await axios.get(`http://localhost:5000/get-user-order/${stallId}?name=${encodeURIComponent(name)}`);
        if (response.data.status === "ok" && response.data.order) {
          setUserOrder(response.data.order);
        }
      } catch (error) {
        console.error("Failed to fetch user order:", error);
      }
    };
  
    if (stallId && userInfo?.name) {
      fetchUserOrder();
    }
  }, [stallId, userInfo]);
  
  

  useEffect(() => {
    let interval;

    const fetchQueueData = async () => {
      if (stallId) {
        const response = await fetch(`http://localhost:5000/api/orders/get-orders?stallId=${stallId}`);
        const result = await response.json();
        if (result.status === "ok") {
                    // Sort the orders to follow FIFO rule
                    const nowServing = result.orders
                        .filter(order => order.status === "inProgress")
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))  // Sort by creation date (FIFO)
                        .slice(0, 3); // Get the latest 3 "In Progress" orders

          const readyForPickup = result.orders
            .filter(order => order.status === "readyForPickup")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))  // Sort by creation date (newest first)
            .slice(0, 3); // Get the latest 3 "Completed" orders
          
          setQueueData(prevData => ({
            ...prevData, nowServing,
            readyForPickup, // Update only the readyForPickup array
          }));
        }
      }
    };

    if (stallId) {
      // Start polling every 2 seconds (2000 ms)
      interval = setInterval(fetchQueueData, 2000);
      // Fetch immediately on load
      fetchQueueData();
    }

    // Cleanup on component unmount or stallId change
    return () => {
      clearInterval(interval);
    };
  }, [stallId]);

  return (
    <div>
      <NavBar />
      {/* <PageNav /> */}
      <div className="live-queue-container">
        <h1>Queue for Stall: {stallName}</h1>
        <div className="queue-grid">
          <div className="ticket-box">
            <div className="ticket-header">Your Ticket Number</div>
            <div className="ticket-number">{queueData.currentTicket}</div>
            <p>Your order slip has been sent to your email</p>
            {userOrder && userOrder.status === "Incoming" && (
  <button
    className="cancel-orderqueue-btn"
    onClick={async () => {
      try {
        const response = await axios.patch("http://localhost:5000/api/orders/cancel-order-queue", {
          orderId: userOrder._id,
        });
        if (response.data.status === "ok") {
          alert("Order cancelled successfully.");
          setUserOrder({ ...userOrder, status: "Cancelled" });
        }
      } catch (error) {
        console.error("Failed to cancel order:", error);
        alert("Cannot cancel the order when your order is now preparing. ");
      }
    }}
  >
    Cancel Order
  </button>
)}
          </div>
          <div className="queue-window">
            <div className="queue-header">Queuing Window</div>
            <div className="queue-details">
              <div className="now-serving">
                <h3>Preparing</h3>
                {queueData.nowServing.length > 0 ? (
                      queueData.nowServing.map((ticket) => (
                          <p key={ticket.ticketNumber}>Ticket #{ticket.ticketNumber}</p>
                      ))
                  ) : (
                      <p>No tickets currently being served.</p>
                  )}
              </div>
              <div className="ready-for-pickup">
                <h3>Ready for Pick Up</h3>
                {queueData.readyForPickup && queueData.readyForPickup.length > 0 ? (
                  queueData.readyForPickup.map((ticket) => (
                    <p key={ticket.ticketNumber}>Ticket #{ticket.ticketNumber}</p>
                  ))
                ) : (
                  <p>No tickets ready for pickup.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <button className="back-home-btn" onClick={handleHome}>
          BACK TO HOME
        </button>
      </div>
    </div>
  );
};

export default LiveQueue;
