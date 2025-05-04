import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./GoalCalendar.css";
import axios from "axios";
import { userActions } from "../global/store/userReducers";

const GoalCalendar = () => {
  const [showCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Flag to toggle edit mode
  const userState = useSelector((state) => state.user);
  const userInfo = userState?.userInfo;
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

  useEffect(() => {
    const fetchGoals = async () => {
      const response = await axios.post("http://localhost:5000/get-goals", {
        userId: userInfo?._id,
      });

      if (response.data.status === "ok") {
        setGoals(response.data.data); // Set the fetched goals from backend
      }
    };

    if (userInfo?._id) {
      fetchGoals();
    }
  }, [userInfo?._id]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setGoal(goals[date.toDateString()] || ""); // Show goal if it exists for the selected date
    setIsModalOpen(true); // Open the modal when a date is selected
    setIsEditing(false); // Ensure we're not in edit mode when previewing
  };

  const handleGoalChange = (event) => {
    setGoal(event.target.value);
  };

  const saveGoal = async () => {
    const newGoals = { ...goals, [selectedDate.toDateString()]: goal };

    // Save to backend
    const response = await axios.post("http://localhost:5000/save-goals", {
      userId: userInfo?._id,
      goals: newGoals,
    });

    if (response.data.status === "ok") {
      setGoals(newGoals); // Update the state with the new goal
      setGoal(""); // Clear input after saving
      setIsModalOpen(false); // Close the modal after saving
    }
  };

  const deleteGoal = async () => {
    const newGoals = { ...goals };
    delete newGoals[selectedDate.toDateString()];

    // Save the updated goals after deletion
    const response = await axios.post("http://localhost:5000/save-goals", {
      userId: userInfo?._id,
      goals: newGoals,
    });

    if (response.data.status === "ok") {
      setGoals(newGoals);
      setGoal(""); // Clear input after deleting
      setIsModalOpen(false); // Close the modal after deleting
    }
  };

  const toggleEditMode = () => {
    setIsEditing(true); // Enable edit mode
  };

  const tileClassName = ({ date }) => {
    const goalDate = date.toDateString();
    if (goals[goalDate]) {
      const goalDateObj = new Date(goalDate);
      const today = new Date();

      if (goalDateObj.toDateString() === today.toDateString()) {
        return "goal-yellow";
      }

      if (goalDateObj > today) {
        return "goal-red";
      }

      return "goal-green";
    }
    return "";
  };

  return (
    <div>
      <div className="dashboard-container">
        <div className="row">
          {showCalendar && (
            <div className="calendar-container">
              <Calendar onChange={handleDateChange} value={selectedDate} tileClassName={tileClassName} />

            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="goal-modal">
            <div className="goal-modal-content">
              <h3>{goals[selectedDate.toDateString()] ? "Goal Preview" : "Create Goal"}</h3>
              <div className="goal-preview">
                {goals[selectedDate.toDateString()] && !isEditing ? (
                  <div>
                    <p>{goals[selectedDate.toDateString()]}</p>
                    <div className="goal-buttons">
                      <button className="edit-button" onClick={toggleEditMode}>
                        <i className="fas fa-edit"></i> Edit Goal
                      </button>
                      <button className="delete-button" onClick={deleteGoal}>
                        <i className="fas fa-trash-alt"></i> Delete Goal
                      </button>
                      <button className="close-button" onClick={() => setIsModalOpen(false)}>
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={goal}
                      onChange={handleGoalChange}
                      placeholder="Enter your goal for this date"
                    />
                    {!goals[selectedDate.toDateString()] && !isEditing && (
                      <div className="button-group">
                        <button className="close-button" onClick={() => setIsModalOpen(false)}>
                          Close
                        </button>
                        <button className="create-button" onClick={saveGoal}>
                          Create Goal
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                {isEditing && <button onClick={saveGoal}>Save Goal</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCalendar;
