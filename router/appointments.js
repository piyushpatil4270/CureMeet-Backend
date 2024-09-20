const express = require("express");
const router = express.Router();
const authenticate=require("../middleware/auth");
const { getDoctorMonthlyData, getPatientMonthlyData, appointmentSuccessful, getPatientAppointment, addReview, patientAppointments, getDoctorAppointments, cancelAppointment, getDoctorAppointment, todaysAppointments, bookAppointment } = require("../controllers/appointments");
require("dotenv").config()


router.post("/bookAppointment",authenticate,bookAppointment);

router.get("/doctor/todaysAppointments",authenticate,todaysAppointments)

router.post("/doctor/appointment",authenticate,getDoctorAppointment);



router.post("/cancelAppointment",authenticate,cancelAppointment);

router.post("/doctor/appointments",authenticate,getDoctorAppointments);

router.post("/patients/appointments",authenticate,patientAppointments);


router.post("/reviews/add",authenticate,addReview)

router.post("/patient/appointment",authenticate,getPatientAppointment);
router.post("/successful",authenticate ,appointmentSuccessful);

router.post("/patient/monthlyData",authenticate,getPatientMonthlyData);

router.post("/doctor/monthlyData",authenticate,getDoctorMonthlyData);

module.exports = router;
