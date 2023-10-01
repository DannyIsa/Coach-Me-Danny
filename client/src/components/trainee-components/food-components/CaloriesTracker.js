import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { SetErrorContext } from "../../../App";

import axios from "axios";
import { debounce } from "lodash";
import DaySelect from "./DaySelect";
import adobe from "../../../pics/adobe.png";
import "../../../styles/CaloriesTracker.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function CaloriesTracker({ userDetails }) {
  const [totalCalories, setTotalCalories] = useState(0);
  const [usedCalories, setUsedCalories] = useState(0);
  const setError = useContext(SetErrorContext);

  const [selectedMeal, setSelectedMeal] = useState("");
  const [addFoodPressed, setAddFoodPressed] = useState(false);
  const [searchedFood, setSearchedFood] = useState([]);
  const [searchInput, setSearchInput] = useState();
  const [popUpAddFood, setPopUpAddFood] = useState("");
  const [addFoodAmount, setAddFoodAmount] = useState(1);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [foodOfSelectedDate, setFoodOfSelectedDate] = useState("");
  const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  useEffect(() => {
    if (userDetails && foodOfSelectedDate) {
      setUsedCalories(0);
      setTotalCalories(userDetails.daily_calorie_goal);

      foodOfSelectedDate.map((food) => {
        setUsedCalories((prev) => prev + food.calories * food.amount);
      });
    }
  }, [foodOfSelectedDate]);

  useEffect(() => {
    if (searchInput) {
      axios
        .get(
          `http://localhost:3001/api/food/get-food?searchedFood=${searchInput}`
        )
        .then(({ data }) => {
          setSearchedFood(data);
        })
        .catch((err) => setError(err.response.data));
    } else if (!searchInput) {
      setSearchedFood([]);
    }
  }, [searchInput]);

  const searchFood = useCallback(
    debounce((e) => {
      setSearchInput(e.target.value);
    }, 1000)
  );

  const addFoodOfSelectedDate = (food) => {
    axios
      .post("http://localhost:3001/api/food/eaten-food", {
        traineeId: userDetails.id,
        foodId: food.id,
        mealOfTheDay: selectedMeal,
        amount: addFoodAmount,
      })
      .then(({ data }) => {
        let temp = [...foodOfSelectedDate];
        temp.push(data);

        setFoodOfSelectedDate([...temp]);
        setAddFoodPressed(false);
        setSelectedMeal("");
      })
      .catch((err) => setError(err.response.data));
  };

  const deleteItemFromMeal = (id) => {
    axios
      .delete(
        `http://localhost:3001/api/food/eaten-food/${id}?traineeId=${userDetails.id}`
      )
      .then(({ data }) => {
        setFoodOfSelectedDate(data);
      })
      .catch((e) => {
        setError(e.response.data);
      });
  };

  return (
    <div className="calorie-tracker">
      <div className="adobe">
        <img width="100%" src={adobe} />
      </div>
      <div className="meter-and-calendar">
        <div className="meter-and-title">
          <progress
            className="calorie-meter"
            min="0"
            value={usedCalories ? usedCalories : 0}
            max={
              totalCalories ? totalCalories : usedCalories ? usedCalories : 0
            }
          >
            {usedCalories}%
          </progress>
          <h3 className="meter-numbers">
            <span className={usedCalories > totalCalories ? "red" : "green"}>
              {Number(usedCalories)}
            </span>{" "}
            / {totalCalories} Calories Eaten
          </h3>
        </div>
        <DaySelect
          setFoodOfSelectedDate={setFoodOfSelectedDate}
          userDetails={userDetails}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>

      <div className="meals-container">
        {meals.map((meal, index) => (
          <div
            className={selectedMeal === meal ? "chosen-meal" : "meal"}
            key={"M" + index}
          >
            <div className="add-to-container">
              <h1>{meal}</h1>
              {selectedDay.toLocaleDateString() ===
                new Date().toLocaleDateString() && (
                <button
                  onClick={() => {
                    setSelectedMeal(meal);
                    setAddFoodPressed(true);
                    setSearchInput();
                  }}
                  className="add-food-button"
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    color="white"
                    className="fa-fa"
                  />
                </button>
              )}
            </div>
            <div className="meal-container">
              {foodOfSelectedDate &&
                foodOfSelectedDate.map((food) => {
                  return (
                    food.meal_of_the_day === meal && (
                      <div className="eaten-food-container" key={food.id}>
                        <h4>
                          {food.name} ({food.weight * food.amount}g)
                        </h4>
                        <p>{food.calories * food.amount} calories</p>
                        <p>{food.protein * food.amount} protein</p>
                        <p>{food.carbs * food.amount} carbs</p>

                        <p>{food.fats * food.amount} fats</p>
                        {selectedDay.toLocaleDateString() ===
                          new Date().toLocaleDateString() && (
                          <button
                            className="delete-eaten-food-button"
                            onClick={() => deleteItemFromMeal(food.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrashAlt}
                              color="black"
                              className="fa-fa"
                            />
                          </button>
                        )}
                      </div>
                    )
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      {addFoodPressed && (
        <div className="popup-background">
          <div className="popup-add-food">
            <input
              className="search-food-input"
              placeholder="What do you want to eat today ?"
              onChange={searchFood}
            />
            <button
              className="popup-close-button"
              onClick={() => {
                setAddFoodPressed(false);
                setSelectedMeal("");
                setSearchInput();
              }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                color="#acacac"
                className="fa-fa"
              />
            </button>
            <div className="searched-food-list">
              {searchedFood.map((food, i) => {
                return (
                  <h4
                    className="searched-food-single"
                    key={food.id}
                    onClick={() => {
                      setAddFoodAmount(1);
                      setPopUpAddFood(food);
                    }}
                    key={food.id}
                  >
                    {food.name} ({food.weight}g)
                  </h4>
                );
              })}

              {popUpAddFood && (
                <div className="pop-up-selected-food">
                  <h3>
                    {popUpAddFood.name} ({popUpAddFood.weight * addFoodAmount}g)
                  </h3>
                  <p>Calories: {popUpAddFood.calories * addFoodAmount}</p>
                  <p>Protein: {popUpAddFood.protein * addFoodAmount}</p>
                  <p>Carbs: {popUpAddFood.carbs * addFoodAmount}</p>
                  <p>Fats: {popUpAddFood.fats * addFoodAmount}</p>
                  <label>Amount:</label>
                  <input
                    onChange={(e) => setAddFoodAmount(e.target.value)}
                    value={addFoodAmount}
                  ></input>
                  <button
                    className="add-food-button"
                    onClick={() => {
                      addFoodOfSelectedDate(popUpAddFood);
                      setPopUpAddFood();
                    }}
                  >
                    ADD
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
