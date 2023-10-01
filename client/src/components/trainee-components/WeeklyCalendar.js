import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { SetErrorContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function WeeklyCalendar({ userDetails }) {
  const [needToEat, setNeedToEat] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [chosenWorkout, setChosenWorkout] = useState();
  const [done, setDone] = useState({ done: false, workout: undefined });
  const setError = useContext(SetErrorContext);

  useEffect(() => {
    if (userDetails) {
      axios
        .get(
          `http://localhost:3001/api/food/need-to-eat/${userDetails.coach_id}?traineeId=${userDetails.id}`
        )
        .then(({ data }) => {
          setNeedToEat(data);

          axios
            .get(
              `http://localhost:3001/api/trainee/workouts/show/${userDetails.coach_id}?traineeId=${userDetails.id}`
            )
            .then(({ data }) => {
              setWorkouts(data);
            })
            .catch((err) => {
              setError(err.response.data);
            });
        })
        .catch((err) => {
          setError(err.response.data);
        });
    }
  }, [userDetails]);

  useEffect(() => {
    if (userDetails)
      axios
        .get("/api/logs/workout/check/" + userDetails.id)
        .then(({ data }) => {
          setDone(data);
        })
        .catch((err) => setError(err.response.data));
  }, [userDetails]);

  const handleExerciseClicked = (workout) => {
    if (workout.exercises.length == 0) return;
    setChosenWorkout(workout);
  };

  const Meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const DaysOfTheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="weekly-calendar start">
      <table className="table">
        <thead>
          <tr>
            <td className="category-td"></td>
            {DaysOfTheWeek.map((day, index) => (
              <td key={index} className="table-one-container">
                <h2 className="day-title">{day.slice(0, 3)}</h2>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {Meals.map((meal, mi) => (
            <tr key={mi}>
              <td className="category-td">
                <strong>{meal}</strong>
              </td>
              {DaysOfTheWeek.map((day, di) => {
                let items = needToEat.filter(
                  (foodToEat) =>
                    foodToEat.day === day && foodToEat.meal_of_the_day === meal
                );
                return (
                  <td key={di}>
                    <div className="table-one-container">
                      {items.map((item) => {
                        return <p>{item && item.name + " X" + item.amount}</p>;
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="category-td">
              <strong>Workout</strong>
            </td>
            {DaysOfTheWeek.map((day, index) => {
              let item = workouts.find((workout) => workout.day === day);
              return (
                <td key={index}>
                  <div className="table-one-container">
                    {item && (
                      <div onClick={() => handleExerciseClicked(item)}>
                        <span>{item.name}</span>
                        <h4>
                          {done.workout &&
                            item.day.startsWith(done.workout.day) &&
                            (done.done ? "Done!" : "Your Workout Today!")}
                        </h4>
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      {chosenWorkout && (
        <div className="popup-background">
          <div className="popup-workout">
            <button
              onClick={() => setChosenWorkout(false)}
              className="popup-close-button"
            >
              <FontAwesomeIcon
                icon={faTimes}
                color="#acacac"
                className="fa-fa"
              />
            </button>
            {chosenWorkout &&
              chosenWorkout.day.startsWith(
                new Date().toString().split(" ")[0]
              ) &&
              (!done.done ? (
                <Link
                  to={`/trainee/workout/${chosenWorkout.id}`}
                  className="popup-start-button"
                >
                  <FontAwesomeIcon
                    icon={faPlayCircle}
                    color="#acacac"
                    className="s-fa"
                  />
                  Start
                </Link>
              ) : (
                <h2 className="done-header">Done!</h2>
              ))}
            <h1>{chosenWorkout.name}</h1>
            {chosenWorkout.exercises.map((exercise) => {
              return (
                <div>
                  <h3>{exercise.name}</h3>
                  <p>Sets: {exercise.sets}</p>
                  <p>Minimum reps: {exercise.min_reps}</p>
                  <p>Maximum reps: {exercise.max_reps}</p>
                  <p>Adeed weight: {exercise.added_weight}</p>
                  <p>Rest: {exercise.rest}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
