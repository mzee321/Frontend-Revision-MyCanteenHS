import React, { useState, useEffect } from "react";
import NavBar from "../global/NavBar";
import PageNav from "../global/PageNav";
import LineGraph from "./LineGraph";
import PieChart from "./PieChart";
import BarGraph from "./BarGraph";
import GoalCalendar from "./GoalCalendar";
import "./VendorHomepage.css";
import "./GoalCalendar.css";
import { userActions } from "../global/store/userReducers";
import { useDispatch} from "react-redux";
import { useSelector } from "react-redux";

const VendorHomepage = () => {
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
  const [fileName, setFileName] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");  // State for filter
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

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  return (
    <div>
      <NavBar />
      <PageNav />
      <h2 class="margin-name">Dashboard</h2>


      {/* Dropdown filter */}
      <div className="filter-container">
        <span>Filter by:</span> {/* Added text "Filter by:" */}
        <select onChange={handleFilterChange} value={selectedFilter}>
          <option value="all">Show All</option>
          <option value="monthly-sales">Monthly Sales</option>
          <option value="food-trends">Food Trends</option>
          <option value="top-selling">Top-Selling Items</option>
          <option value="goal-calendar">Set Goals</option>
        </select>
      </div>  

      <div className="dashboard-container">
      <h2 class="marginz-name1">Products and Sales</h2>
        {/* Row 1: Titles and Charts */}
        <div className="row">
          {/* Conditional Rendering Based on Filter */}
          {selectedFilter === "all" || selectedFilter === "monthly-sales" ? (
            <div className="chart-container">
              <div className="chart-title1">Monthly Sales</div>
              <LineGraph />
            </div>
          ) : null}
          {selectedFilter === "all" || selectedFilter === "food-trends" ? (
            <div className="chart-container">
              <div className="chart-title">Food Trends</div>
              <PieChart />
            </div>
          ) : null}
        </div>

        {/* Row 2: Titles and Charts */}
        <div className="row">
          {selectedFilter === "all" || selectedFilter === "top-selling" ? (
            <div className="chart-container">
              <div className="chart-title">Top-Selling Items</div>
              <BarGraph />
            </div>
          ) : null}
          {selectedFilter === "all" || selectedFilter === "goal-calendar" ? (
            <div className="chart-container">
              <div className="chart-title">Set Goals</div>
              <GoalCalendar />
            </div>
          ) : null}
        </div>
      </div>

      <div className="dashboard-container">
      <h2 class="marginz-name1">Demographics</h2>
        {/* Row 1: Titles and Charts */}
        <div className="row">
          {/* Conditional Rendering Based on Filter */}
          {selectedFilter === "all" || selectedFilter === "monthly-sales" ? (
            <div className="chart-container">
              <div className="chart-title1">Monthly Sales</div>
              <LineGraph />
            </div>
          ) : null}
          {selectedFilter === "all" || selectedFilter === "food-trends" ? (
            <div className="chart-container">
              <div className="chart-title">Food Trends</div>
              <PieChart />
            </div>
          ) : null}
        </div>

        {/* Row 2: Titles and Charts */}
        <div className="row">
          {selectedFilter === "all" || selectedFilter === "top-selling" ? (
            <div className="chart-container">
              <div className="chart-title">Top-Selling Items</div>
              <BarGraph />
            </div>
          ) : null}
          {selectedFilter === "all" || selectedFilter === "goal-calendar" ? (
            <div className="chart-container">
              <div className="chart-title">Set Goals</div>
              <GoalCalendar />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VendorHomepage;
