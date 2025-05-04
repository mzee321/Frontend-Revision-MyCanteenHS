import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faShoppingCart,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import NavBar from "../global/NavBarTest";
import PageNav from "../global/PageNav";
import fallbackImage from "../images/adobo.jpg"; // A fallback image for missing product images.

import { userActions } from "../../global/store/userReducers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {toast, Toaster } from "react-hot-toast";
import Modal from "react-modal"; // Import react-modal
Modal.setAppElement("#root"); // Required for accessibility

const StallPage = () => {
  const { id: stallId } = useParams(); // Get stallId from the URL params
  const navigate = useNavigate();
  const [isNavBar, setIsNavBar] = useState(true);
  const [products, setProducts] = useState([]); // Store fetched products
  const [cart, setCart] = useState([]);
  const [stallname, setStallname] = useState(""); // Store stall name
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo || {};
  const [searchInput, setSearchInput] = useState(""); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal
  const [selectedProduct, setSelectedProduct] = useState(null); // Store the product selected
  const [notes, setNotes] = useState(""); // Store the notes
  const [isModalConfirmed, setIsModalConfirmed] = useState(false); // Track whether modal is confirmed
  
  useEffect(() => {
    
    // Fetch stall information using the stallId
    const fetchStallDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getVendorDetails/${stallId}` // Replace with your stall details endpoint
        );
        const data = await response.json();
        if (data.status === "ok") {
          setStallname(data.data.stallname);
        } else {
          console.error("Failed to fetch stall details");
        }
      } catch (error) {
        console.error("Error fetching stall details:", error);
      }
    };

    // Fetch products for the specific stall
    // Replace fetchProducts()
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getProductListsCombined?stallId=${stallId}`
        );
        const data = await response.json();
        if (data.status === "ok") {
          setProducts(data.data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchStallDetails();
    if (stallname) {
      fetchProducts();
    }
  }, [stallId, stallname]); // Re-run when stallId or stallname changes

  const toggleCart = () => {
    setIsCartOpen((prevState) => !prevState);
  };

  const addToCart = (item) => {
    setSelectedProduct(item);
    setModalIsOpen(true); // Open the modal to add notes first
  };

  const addToCart1 = (item) => {
    setCart((prevCart) => {
      // Check if the item already exists in the cart
      const existingItem = prevCart.find((cartItem) => cartItem._id === item._id);
      
      if (existingItem) {
        // If it exists, increment the quantity
        return prevCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
  
      // If the item doesn't exist in the cart, add it with a quantity of 1
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };
  
  

  const handleAddNotesConfirm = () => {
    if (selectedProduct) {
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (cartItem) => cartItem._id === selectedProduct._id
        );
        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem._id === selectedProduct._id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
                  notes: notes.trim(), // Ensure notes are added to the item
                }
              : cartItem
          );
        }
        return [
          ...prevCart,
          { ...selectedProduct, quantity: 1, notes: notes.trim() }, // Add the notes when a new item is added
        ];
      });
    }
    setModalIsOpen(false);
    setNotes(""); // Clear notes after adding to cart
    setSelectedProduct(null); // Clear selected product
  };
  

  const handleCancel = () => {
    // When Cancel is clicked, just add the product to the cart without notes
    if (selectedProduct) {
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (cartItem) => cartItem._id === selectedProduct._id
        );
        if (existingItem) {
          return prevCart.map((cartItem) =>
            cartItem._id === selectedProduct._id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        return [
          ...prevCart,
          { ...selectedProduct, quantity: 1, notes: "" }, // No notes if canceled
        ];
      });
    }
    setModalIsOpen(false); // Close the modal
    setNotes(""); // Clear notes
    setSelectedProduct(null); // Clear selected product
  };

  const removeFromCart = (id) => {
    setCart(
      (prevCart) =>
        prevCart
          .map((cartItem) =>
            cartItem._id === id
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
          .filter((cartItem) => cartItem.quantity > 0) // Remove items with quantity 0
    );
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleConfirm = async () => {
    const orderData = {
      stallId: stallId,
      items: cart.map((item) => ({
        productId: item._id,
        productName: item.productName,
        availableStocks: item.availableStocks,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || "", // <-- ✅ Add this line to send notes if any
      })),
      totalAmount: calculateTotal(),
      orderBy: userInfo?.name || "Guest",
      orderById: userInfo?._id || "Guest",
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/orders/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      const result = await response.json();
  
      if (result.status === "ok") {
        alert("Order confirmed!");
        navigate(`/stall/${stallId}/checkout`);
      } else {
        toast.error(result.message, {
          duration: 5000, // Increase the duration
          position: 'top-center', // You can modify the position if necessary
          style: {
            background: '#f44336', // Ensure the background color is clearly visible
            color: 'white', // White text on red background for visibility
            padding: '10px', // Add padding for better readability
            borderRadius: '5px', // Rounded corners for a modern look
          },
        });
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("An error occurred while placing the order.");
    }
  };
  

  

  useEffect(() => {
    // Function to filter products by searchInput
    const filterProducts = () => {
      if (searchInput.trim() === "") {
        setFilteredProducts(products); // Show all products if search is empty
      } else {
        const lowerCaseSearch = searchInput.toLowerCase();
        setFilteredProducts(
          products.filter((product) =>
            product.productName.toLowerCase().includes(lowerCaseSearch)
          )
        );
      }
    };

    filterProducts();
  }, [searchInput, products]);

  const renderProductsByCategory = (category) => {
    const filteredByCategory = filteredProducts.filter(
      (product) => product.category === category
    );
    return filteredByCategory.length > 0 ? (
      filteredByCategory.map((product) => (
        <div
          key={product._id}
          className="menu-item"
          style={{
            position: "relative",
            opacity: product.availStatus === "Not Available" ? 0.3 : 1,
            pointerEvents: product.availStatus === "Not Available" ? "none" : "auto",
          }}
        >
          <img
            src={
              product.productImage
                ? `http://localhost:5000/${product.productImage}`
                : fallbackImage
            }
            alt={product.productName}
          />
          {product.availStatus === "Not Available" && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "5px",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              Not Available
            </div>
          )}
          <h5>{product.productName}</h5>
          <p>Available Stocks: {product.availableStocks}</p>
          <p>₱{Number(product.price).toFixed(2)}</p>
          {/* Only show "Add to Cart" if Available */}
          {product.availStatus === "Available" && (
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          )}
        </div>
      ))
    ) : (
      <p className="menu-availability">
        No available {category.toLowerCase()} matching the search
      </p>
    );
  };
  

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


  // Base URL for image storage
  const BASE_URL = "http://localhost:5000"; // Adjust if your backend is hosted elsewhere

  return (
    <div>
      <NavBar isNavBar={isNavBar} />
      <Toaster /> {/* Include the Toaster component */}
      {/* <PageNav /> */}
      <div className="stall-container">
      <div className="page">
          <div className="search-bar">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                aria-label="Search"
                aria-describedby="search-addon"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="menu">
          <h3 className="menu-title">
            Hello {userInfo?.name || "Guest"}, Please choose your desired
            product!
          </h3>
          <h3 className="stall-name">{stallname || "Stall"}</h3>

          <h4 className="menu-category" >Snacks</h4>
          <div className="menu-items">{renderProductsByCategory("Snacks")}</div>

          <h4 className="menu-category" >Meals</h4>
          <div className="menu-items">{renderProductsByCategory("Meals")}</div>

          <h4 className="menu-category" >Drinks</h4>
          <div className="menu-items">{renderProductsByCategory("Drinks")}</div>
        </div>
        <button className="cart-icon" onClick={toggleCart}>
          <FontAwesomeIcon icon={faShoppingCart} />
          {cart.length > 0 && (
            <div className="cart-count">
              {cart.length} {/* Display the number of unique items in the cart */}
            </div>
          )}

        </button>
        {isCartOpen && (
        <div className="cart-container" >
          <button className="cart-close-btn" onClick={toggleCart}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          <h3>Your Cart</h3>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-info">
                  <img
                    src={
                      item.productImage
                        ? `http://localhost:5000/${item.productImage}`
                        : fallbackImage
                    }
                    alt={item.productName}
                  />
                  <h5 className="productName">{item.productName}</h5>
                  <p>₱{Number(item.price).toFixed(2)}</p>
                  {item.notes && item.notes.trim() && (
                    <p className="product-notes">
                      {item.notes.length > 72 ? `${item.notes.slice(0, 72)}...` : item.notes}
                    </p> // Display notes
                  )}
                  {/* Ensure price is converted to a number */}
                </div>

                <div className="cart-actions">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="cart-btn"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <p>{item.quantity}</p>
                  <button onClick={() => addToCart1(item)} className="cart-btn">
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h4>Total: ₱{calculateTotal().toFixed(2)}</h4>
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={cart.length === 0}
          >
            Confirm Order
          </button>
        </div>
        )}
      </div>
            {/* Modal Implementation */}
            <Modal
  isOpen={modalIsOpen}
  onRequestClose={handleCancel}
  contentLabel="Add-Notes-modal"
  className="modal-content"
  overlayClassName="modal-overlay"
>
  {selectedProduct && (
    <>
      <div className="modal-header">
        <h2>Add Notes or Add-ons</h2>
      </div>
      <div className="modal-body">
        <div className="modal-product-details">
          <img
            src={
              selectedProduct.productImage
                ? `http://localhost:5000/${selectedProduct.productImage}`
                : fallbackImage
            }
            alt={selectedProduct.productName}
            className="modal-product-image"
          />
          <div className="modal-product-info">
            <h3>{selectedProduct.productName}</h3>
            <p>₱{Number(selectedProduct.price).toFixed(2)}</p>
            <p>Available Stocks: {selectedProduct.availableStocks}</p>
            <div className="modal-quantity-selector">
              <button
                onClick={() => removeFromCart(selectedProduct._id)}
                className="cart-btn1"
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span>
                {
                  cart.find((item) => item._id === selectedProduct._id)
                    ?.quantity || 1
                }
              </span>
              <button
                onClick={() => addToCart1(selectedProduct)}
                className="cart-btn1"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add Notes or Add-ons..."
          rows={5}
          style={{ width: "100%", padding: "10px", fontSize: "1rem" }}
        />
      </div>

      <div className="modal-footer">
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleAddNotesConfirm}>Add Notes</button>
      </div>
    </>
  )}
</Modal>

    </div>
  );
};

export default StallPage;
