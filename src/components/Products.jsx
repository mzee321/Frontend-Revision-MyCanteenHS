import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { userActions } from "../global/store/userReducers";
import { useDispatch} from "react-redux";
import { useSelector } from "react-redux";
import {toast, Toaster} from "react-hot-toast";
import NavBar from "../global/NavBar";
import PageNav from "../global/PageNav";
import "./Products.css";


// Product Card Component
const ProductCard = ({ product, index, onEdit, onArchive }) => {
  return (
    <div className="product-card">
      <img
        src={product.image || "./placeholder.png"}
        alt={product.name}
        className="product-image"
      />
      <div className="product-details">
        <div className="product-field">
          <span className="field-label">Product Name:</span>
          <p className="product-title">{product.name}</p>
        </div>
        <div className="product-field">
          <span className="field-label">Category:</span>
          <p className="product-title">{product.category || "Uncategorized"}</p>
        </div>
        <div className="product-field">
          <span className="field-label">Price:</span>
          <p className="product-price">₱{product.price}</p>
        </div>
        <div className="product-field">
          <span className="field-label">Available Stocks:</span>
          <p className="product-stocks">{product.stocks} in stock</p>
          <p className="product-availability">
            {product.isAvailable ? "Available" : "Not Available"}
          </p>
        </div>
        <div className="product-actions">
          <button
            className="edit-button"
            onClick={() => onEdit(product)} // Pass product object including ID
            aria-label={`Edit ${product.name}`}
          >
            <i className="fas fa-pen"></i> Edit
          </button>
          <button
            className="archive-button"
            onClick={() => onArchive(index)}
            aria-label={`Archive ${product.name}`}
          >
            <i className="fas fa-archive"></i> Archive
          </button>
        </div>
      </div>
    </div>
  );
};


const Products = ({ products, setProducts, archivedProducts, setArchivedProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [newProduct, setNewProduct] = useState({
    image: "",
    name: "",
    category: "", // Add category field
    price: "",
    stocks: "",
    isAvailable: false, // Track availability
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user); // Access Redux state
  const userInfo1 = userState?.userInfo || {}; // Safely handle userInfo being undefined

  const userState2 = useSelector((state) => state.user); // Access Redux state
  const userInfo2 = userState2?.userInfo || {}; // Safely handle userInfo being undefined
  const stallName = userInfo2?.stallname || ""; // Get the user's stallname

  // Filter products by stallname and search term
  const filteredProducts = products.filter(
    (product) =>
      product.stallname === stallName &&
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure product.name exists
  );



  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    // Filter products with a safer condition to avoid undefined errors
    const currentProducts = products
  .filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure product.name exists
  )
  .slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);




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

  // Reset product form
  const resetForm = () => {
    setNewProduct({
      stallname: userInfo.stallname || "", // Default to the user's stall name
      image: "",
      name: "",
      category: "",
      price: "",
      stocks: "",
      isAvailable: false, // Automatically set availability to false
    });
    setPreviewImage(null);
    setIsModalOpen(false);
  };

// Archive product
const handleArchive = async (index) => {
  const productToArchive = products[index];

  try {
    const response = await fetch(`http://localhost:5000/archive-product/${productToArchive._id}`, {
      method: "PUT",
    });

    const result = await response.json();
    if (result.status === "ok") {
      setProducts((prev) => prev.filter((_, i) => i !== index)); // Remove from current list
      toast.success("Product archived successfully!");
    } else {
      toast.error("Failed to archive product.");
    }
  } catch (error) {
    console.error("Error archiving product:", error);
    toast.error("Error archiving product.");
  }
};

  // Open modal for adding/editing a product
  const openModal = async (product = null) => {
    if (product) {
      setIsEditing(true);
      setProductToEdit(product);
  
      // Fetch the product details from the backend by its ID (for editing)
      try {
        const response = await fetch(`http://localhost:5000/getProduct/${product._id}`);
        const data = await response.json();
  
        if (data.status === "ok") {
          const fetchedProduct = data.data;
  
          // Map fetched data to newProduct fields
          setNewProduct({
            image: fetchedProduct.productImage
              ? `http://localhost:5000/${fetchedProduct.productImage}`
              : "",
            name: fetchedProduct.productName || "", // Map 'productName' to 'name'
            category: fetchedProduct.category || "",
            price: fetchedProduct.price || "",
            stocks: fetchedProduct.availableStocks || "", // Map 'availableStocks' to 'stocks'
            isAvailable: fetchedProduct.availStatus === "Available",
            stallname: fetchedProduct.stallname || "",
          });
  
          setPreviewImage(
            fetchedProduct.productImage
              ? `http://localhost:5000/${fetchedProduct.productImage}`
              : null
          );
        } else {
          alert("Failed to fetch product details");
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to fetch product details");
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const handleAddOrEditProduct = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("stallname", userInfo?.stallname || "Unknown Stall"); // Automatically set the stall name
    formData.append("productImage", newProduct.imageFile || ""); // Image file
    formData.append("productName", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("availableStocks", newProduct.stocks);
    formData.append("stallId", userInfo?._id || "Unknown ID");


    // Add a condition to check if it's editing or adding
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/edit-product/${productToEdit._id}`
      : "http://localhost:5000/add-product";

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const data = await response.json();
      if (data.status === "ok") {
        toast.success(isEditing ? "Product updated successfully!" : "Product added successfully!", {
          duration: 3000,
        });
        resetForm();
        fetchProducts(); // Refresh product list
      } else {
        alert("Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An error occurred while saving the product");
    }
  };
  
// Fetch products based on user's stallname
const fetchProducts = async () => {
  try {
    // Check if "userInfo" exists in localStorage
    const storedUserInfo = localStorage.getItem("userInfo");
    console.log("Stored userInfo:", storedUserInfo);  // Debug log

    // Parse the stored userInfo or fallback to null if not found
    const userInfoFromStorage = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    console.log("Parsed userInfo:", userInfoFromStorage);  // Debug log

    // Get the stall name either from the stored user info or fallback to the variable `stallName`
    const stallNameFromStorage = userInfoFromStorage?.stallname || stallName;
    const stallIdFromStorage = userInfoFromStorage?._id || stallName;
    console.log("Stall Name from Storage:", stallNameFromStorage);  // Debug log

    // Fetch products using the stall name
    const response = await fetch(`http://localhost:5000/getProductListsArchive?stallId=${encodeURIComponent(stallIdFromStorage)}&archive=Not Archive`);
    const data = await response.json();

    if (data.status === "ok") {
      const products = data.data.map((product) => ({
        _id: product._id,
        image: `http://localhost:5000/${product.productImage}`,
        stallname: product.stallname,
        name: product.productName,
        category: product.category,
        price: product.price,
        stocks: product.availableStocks,
        isAvailable: product.availStatus === "Available",
      }));

      // Use `setProducts` to update the state
      setProducts(products);
    } else {
      console.error("Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};


useEffect(() => {
  fetchProducts();
}, []);


  // Handle image upload
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setNewProduct((prev) => ({
        ...prev,
        image: reader.result, // For preview
        imageFile: file, // Actual file for upload
      }));
    };
    reader.readAsDataURL(file);
  }
};


  // Handle removing the product image
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setNewProduct((prev) => ({ ...prev, image: "" }));
  };

  const [posts, setPosts] = useState([]); // Use fetched posts data from MongoDB
  // Fetch posts data from the server
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/getProductLists");
        const data = await response.json();
        if (data.status === "ok") {
          setPosts(data.data);
        } else {
          console.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);
      
  const [isNavBar, setIsNavBar] = useState(true);
  const userState1 = useSelector((state) => state.user); // Access Redux state
  const userInfo = userState?.userInfo; // Extract userInfo
  const username = userInfo?.name || "Guest"; // Replace with the actual logged-in username
  const username1 = userInfo?.stallname || "Guest"; // Replace with the actual logged-in username
  const dispatch1 = useDispatch();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!userState.userInfo && storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      dispatch1(
        userActions.setUserInfo({
          _id: parsedUserInfo._id,
          name: parsedUserInfo.name,
          stallname: parsedUserInfo.stallname,
          token: localStorage.getItem("token"),
        })
      );
    }
  }, [dispatch, userState1.userInfo]);

  const handleStallClick = (stallId) => {
    navigate(`/stall/${stallId}`); // Navigate to a dynamic route
  };

  // Base URL for image storage
  const BASE_URL = "http://localhost:5000"; // Adjust if your backend is hosted elsewhere

  return (
    <div>
      <NavBar />
      <Toaster/>
      
      <div className="products-page">
        {/* Controls */}
        <div className="top-controls">
          <br></br>
          <div className="search-bar1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </div>
          <button className="add-product-button" onClick={() => openModal()}>
            Add Product
          </button>
        </div>

        {/* Products List */}
        <div className="products-container">
          {products.length > 0 ? (
            <div className="products-list">
              {currentProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  index={index}
                  onEdit={openModal}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          ) : (
            <p className="no-products">No products added yet.</p>
          )}
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="pagination1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination1-button"
            >
              Previous
            </button>
            <span className="pagination1-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="pagination1-button"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
              <form onSubmit={handleAddOrEditProduct}>

                <div className="form-group">
                  <label>Product Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {previewImage && (
                    <div className="image-preview-container">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="image-preview"
                      />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Meals">Meals</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price:</label>
                  <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value >= 0) {
                            setNewProduct({ ...newProduct, price: value });
                          } else {
                            toast.error("Price cannot be negative.");
                          }
                        }}
                        min="0"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        required
                        />
                </div>
                <div className="form-group">
                  <label>Available Stocks:</label>
                  <input
                        type="number"
                        value={newProduct.stocks}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value >= 0) {
                            setNewProduct({ ...newProduct, stocks: value });
                          } else {
                            toast.error("Available Stocks cannot be negative.");
                          }
                        }}
                        min="0"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                          }
                        }}
                        required
                        />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-button">
                    {isEditing ? "Save Changes" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
