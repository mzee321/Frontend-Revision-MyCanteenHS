import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../App.css';
import NavBar from '../global/NavBarTest';
import PageNav from '../global/PageNav';

const LiveQueue = () => {
    const navigate = useNavigate();
    const [isNavBar, setIsNavBar] = useState(true);
    const [queueData, setQueueData] = useState({ nowServing: [], readyForPickup: [] });
    const [stallId, setStallId] = useState(""); // Holds selected stall ID
    const [stalls, setStalls] = useState([]); // Holds the list of stalls from the backend

    // Fetch list of stalls from the backend
    useEffect(() => {
        const fetchStalls = async () => {
            try {
                const response = await fetch('http://localhost:5000/getVendorListsQueue');
                const result = await response.json();
                console.log("Fetched stalls data:", result); // Check response in console
                
                if (result.status === "ok" && result.data && result.data.length > 0) {
                    setStalls(result.data); // Set stalls only if there's data
                } else {
                    console.error("No stalls data available", result); // Log error if data is empty
                }
            } catch (error) {
                console.error("Error fetching stalls:", error); // Log any fetch errors
            }
        };
        fetchStalls();
    }, []);

    useEffect(() => {
        let interval;
    
        const fetchQueueData = async () => {
            if (stallId) {
                try {
                    const response = await fetch(`http://localhost:5000/api/orders/get-orders?stallId=${stallId}`);
                    const result = await response.json();
    
                    if (result.status === "ok") {
                        // Ensure proper defaults when no orders exist
                        const nowServing = result.orders
                            ? result.orders
                                .filter(order => order.status === "inProgress")
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // FIFO
                                .slice(0, 3)
                            : [];
    
                        const readyForPickup = result.orders
                            ? result.orders
                                .filter(order => order.status === "readyForPickup")
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first
                                .slice(0, 3)
                            : [];
    
                        setQueueData({
                            nowServing: nowServing.length > 0 ? nowServing : [], // Ensure array is set
                            readyForPickup: readyForPickup.length > 0 ? readyForPickup : [] // Ensure array is set
                        });
                    } else {
                        setQueueData({ nowServing: [], readyForPickup: [] }); // Reset if no orders found
                    }
                } catch (error) {
                    console.error("Error fetching queue data:", error);
                    setQueueData({ nowServing: [], readyForPickup: [] }); // Reset on fetch failure
                }
            } else {
                setQueueData({ nowServing: [], readyForPickup: [] }); // Reset if no stall selected
            }
        };
    
        if (stallId) {
            interval = setInterval(fetchQueueData, 2000);
            fetchQueueData(); // Initial fetch
        }
    
        return () => clearInterval(interval);
    }, [stallId]);
    

    const handleStallChange = (e) => {
        const selectedStallId = e.target.value;
        setStallId(selectedStallId);
        if (!selectedStallId) {
            setQueueData({ nowServing: [], readyForPickup: [] }); // Clear queue data when no stall is selected
        }
    };

    const handleHome = () => {
        navigate(`/stall`); 
    };

    return (
        <div>
            <NavBar isNavBar={isNavBar} />
            {/* <PageNav /> */}
            <div className="live-queue-container">
                <h1>Queue for Stall</h1>
                <div className="dropdown-container">
                    <select onChange={handleStallChange} value={stallId}>
                        <option value="">Select a Stall</option>
                        {stalls.length > 0 ? (
                            stalls.map((stall) => (
                                <option key={stall._id} value={stall._id}>
                                    {stall.stallname}
                                </option>
                            ))
                        ) : (
                            <option disabled>No stalls available</option> // In case stalls data is empty
                        )}
                    </select>
                </div>
                <div className="queue-grid">
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
                                {queueData.readyForPickup.length > 0 ? (
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
                <button className="back-home-btn" onClick={handleHome}>BACK TO HOME</button>
            </div>
        </div>
    );
};

export default LiveQueue;
