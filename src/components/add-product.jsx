import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './add-product.css'; // Optional: Custom styles for this component

const AddProduct = ({ setProducts }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [inventory, setInventory] = useState('');
  const [price, setPrice] = useState('');
  const [stal, setStal] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    // Prepare form data
    const formData = new FormData();
    formData.append("stal", stal);
    formData.append("productName", name);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("availableStocks", inventory);
    formData.append("productImage", image); // Assuming image is a file or blob
  
    try {
      const response = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        body: formData, // Send data as multipart form data
      });
  
      const result = await response.json();
      if (result.status === "ok") {
        alert("Product added successfully!");
        navigate("/products"); // Redirect back to the product list
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="add-product-page">
      <h1>Add Product</h1>
      <form onSubmit={handleAddProduct}>
      <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={stal}
            onChange={(e) => setStal(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Inventory</label>
          <input
            type="text"
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <button type="submit" className="add-button">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
