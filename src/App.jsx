import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./LoginRegister/CustomerRegister";
import VendorRegister from  "./LoginRegister/VendorRegister";
import CustomerLogin from "./LoginRegister/loginmain"; // Import the new CustomerLogin component
import "./styling.css";
import VendorHomepage from "./components/VendorHomepage";
import NavBar from "./global/NavBar";
import PageNav from "./global/PageNav";
import TrackOrder from "./components/TrackOrder";
import Products from "./components/Products";
import Archives from "./components/Archives";
import AddProduct from "./components/add-product"; // Import AddProduct
import UserHomepage from "./User/components/UserHomepage";
import StallPage from "./User/components/StallPage";
import LiveQueueView from "./User/components/LiveQueueView";
import LiveQueue from "./User/components/LiveQueue";
import EditProfile from "./User/components/EditProfile";
import VendorEditProfile from "././User/components/VendorEditProfile";
import OrderHistoryTest from "./User/components/OrderHistoryTest";
import OrderTracking from "./User/components/OrderTracking";
import LandingPage from "./LandingPage/LandingPage";
import ViewProfile from "./User/components/ViewProfile";
import ViewVendorProfile from "./User/components/ViewVendorProfile";
import Sample from "./GoogleAuth/mainz";


//Admin Side

import Vendors from './Admin/Vendors';
import AddVendor from './Admin/AddVendor';
import Dashboard from './Admin/Dashboard';
import EditProfileAdmin from './Admin/EditProfileAdmin';


function App() {
  // State to manage products
  const [products, setProducts] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]); // State for archived products

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Default route */}
        <Route path="/login" element={<CustomerLogin />} /> {/* Default route */}
        <Route path="/CustomerLogin" element={<CustomerLogin />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/VendorRegister" element={<VendorRegister />} />
        <Route path="/vendorHomepage" element={<VendorHomepage />} />
        <Route path="/global/NavBar" element={<NavBar />} />
        <Route path="/global/PageNav" element={<PageNav />} />
        <Route path="/stall" element={<UserHomepage />} />
        <Route path="/stall/:id" element={<StallPage />} />
        <Route path="/stall/:stallId/checkout" element={<LiveQueueView/>}/>
        <Route path="/checkout" element={<LiveQueue/>}/>
        <Route path="/ordertracking" element={<OrderTracking/>} /> 
        <Route path="/orderhistorytest" element={<OrderHistoryTest/>} /> 
        <Route path="/editprofile" element={<EditProfile/>} />
        <Route path="/vendoreditprofile" element={<VendorEditProfile/>} />
        <Route path="/viewprofile" element={<ViewProfile/>} />
        <Route path="/viewvendorprofile" element={<ViewVendorProfile/>} />
        <Route path="/mainz" element={<Sample/>} />

          {/**Admin Side */}

        <Route path="/dashboard" element={<Dashboard/>} /> 
        <Route path="/managevendors" element={<Vendors/>} /> 
        <Route path="/addvendors" element={<AddVendor/>} /> 
        <Route path="/editvendors" element={<Vendors/>} /> 
        <Route path="/admin/editprofile" element={<EditProfileAdmin/>} /> 


        <Route
          path="/trackorder"
          element={<TrackOrder />}
        />
        <Route
          path="/products"
          element={
            <Products
              products={products}
              setProducts={setProducts}
              archivedProducts={archivedProducts}
              setArchivedProducts={setArchivedProducts}
            />
          }
        />
        <Route
          path="/archives"
          element={
            <Archives
              archivedProducts={archivedProducts}
              setArchivedProducts={setArchivedProducts}
              setProducts={setProducts} // Pass setProducts for restoring
            />
          }
        />
        <Route
          path="/add-product"
          element={<AddProduct setProducts={setProducts} />}
        />
        
      </Routes>
    </Router>
  );
}


export default App;
