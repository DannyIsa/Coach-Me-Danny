const models = require("../models");
const { Op, Model } = require("sequelize");
const Sequelize = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.SQL_DATA_BASE,
  process.env.SQL_USERNAME,
  process.env.SQL_PASSWORD,
  {
    host: process.env.SQL_HOST,
    dialect: "mysql",
  }
);
const express = require("express");
const { Router } = require("express");
const logs = require("./logs");
const trainee = Router();

trainee.use(express.json());
trainee.use("/logs", logs);

trainee.get("/trainee-name/:coachId", async (req, res) => {
  const { coachId } = req.params;
  if (!coachId) return res.status(400).send("must send coachId");
  const coach = await models.Coach.findOne({ where: { id: coachId } });
  if (!coach) return res.status(404).send("No Matching Coach");
  res.status(200).send(coach.name);
});

trainee.post("/request/send/:traineeId", (req, res) => {
  const { coachId, traineeName, content } = req.body;
  const { traineeId } = req.params;
  const io = req.app.get("socketIo");
  if (!Number(coachId) || !Number(traineeId)) {
    return res.status(400).send("Invalid ID");
  }
  if (!content || !traineeName) {
    return res.status(400).send("Invalid Content");
  }
  models.CoachRequest.create({
    trainee_id: traineeId,
    coach_id: coachId,
    trainee_name: traineeName,
    content,
  })
    .then((data) => {
      io.emit("request received", coachId);
      res.status(201).send(data);
    })
    .catch(async (err) => {
      if (
        err === "Validation error" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        const request = await models.CoachRequest.findOne({
          where: { trainee_id: traineeId },
        });
        if (!request) return res.status(404).send("No Trainee With That Id");
        request
          .update({ coach_id: coachId, content })
          .then(() => {
            io.emit("request received", coachId);
            return res.status(201).send(request);
          })
          .catch((err) => {
            return res.status(400).send(err);
          });
      } else {
        res.status(400).send(err);
      }
    });
});

trainee.get("/request/show/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const trainee = await models.Trainee.findOne({ where: { id: traineeId } });
  if (!trainee) return res.status(404).send("No Matching Id");
  const request = await trainee.getCoachRequest();
  if (!request) return res.status(200).send({ coach_id: 0 });
  return res.status(200).send(request);
});

trainee.get("/workouts/show/:coachId", async (req, res) => {
  const { coachId } = req.params;
  const { traineeId } = req.query;
  const trainee = await models.Trainee.findOne({
    where: { id: traineeId, coach_id: coachId },
  });
  if (!trainee) return res.status(404).send("No Matching Id");
  const calendars = await trainee.getCalendars();
  if (!calendars) return res.status(200).send([]);
  const workouts = await Promise.all(
    calendars.map(async (calendar) => {
      let workout = await calendar.getWorkout();
      if (!workout) return { calendar };
      let exercises = await workout.getExerciseSets();
      let item = { ...workout.toJSON(), exercises, day: calendar.day };
      delete item.ExerciseSets;
      return item;
    })
  );
  if (!workouts) res.status(200).send([]);
  res.status(200).send(workouts);
});

trainee.get("/workout/show/one/:workoutId", async (req, res) => {
  const { coachId } = req.query;
  const { traineeId } = req.query;
  const { workoutId } = req.params;
  const trainee = await models.Trainee.findOne({
    where: { id: traineeId, coach_id: coachId },
  });
  if (!trainee) return res.status(404).send("No Matching Id");
  const workout = await models.Workout.findOne({ where: { id: workoutId } });
  if (!workout) res.status(404).send("Workout Not Found");

  const exercises = await workout.getExerciseSets();
  if (!exercises) return res.status(404).send("Invalid Workout");
  const exercisesWithImages = await Promise.all(
    exercises.map(async (exercise) => {
      let { image } = await exercise.getExercise({ attributes: ["image"] });
      return { ...exercise.toJSON(), image };
    })
  );
  const data = { ...workout.toJSON(), exercises: exercisesWithImages };
  delete data.ExerciseSets;
  res.status(200).send(data);
});

trainee.get("/coach/show/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  if (!traineeId) return res.status(400).send("Id Required");
  const trainee = await models.Trainee.findOne({ where: { id: traineeId } });
  if (!trainee) return res.status(404).send("Trainee Not Found");
  const coach = await trainee.getCoach();
  return res.status(200).send(coach);
});

trainee.get("/coach/tags", async (req, res) => {
  const eTags = await models.Coach.findAll({
    attributes: [
      [Sequelize.fn("DISTINCT", Sequelize.col("expertise")), "expertise"],
    ],
    order: [["expertise", "ASC"]],
  });
  const cTags = await models.Coach.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("city")), "city"]],
    order: [["city", "ASC"]],
  });
  let dataToSend = {};
  dataToSend.expertise = eTags ? eTags.map((item) => item.expertise) : [];
  dataToSend.cities = cTags ? cTags.map((item) => item.city) : [];
  return res.status(200).send(dataToSend);
});

trainee.patch("/coach/leave/:traineeId", async (req, res) => {
  const { traineeId } = req.params;
  const { coachId } = req.query;
  if (!traineeId || !coachId) return res.status(400).send("Id Required");
  const trainee = await models.Trainee.findOne({
    where: { id: traineeId, coach_id: coachId },
  });
  if (!trainee) return res.status(404).send("No Trainee Found");
  trainee
    .update({ coach_id: 0 })
    .then((data) => {
      return res.status(201).send("Left Successfully");
    })
    .catch((err) => res.status(400).send(err));
});
module.exports = trainee;
