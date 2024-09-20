const express=require("express")
const prescriptions=require("../models/prescriptions")
const patients=require("../models/patient")
const { where, Op } = require("sequelize")
const doctor = require("../models/doctor")
const moment=require("moment")
const appointments = require("../models/appointments")
const authenticate = require("../middleware/auth")
const { createPrescription, getPatientsPrescriptions, getDoctorPrescriptions } = require("../controllers/prescriptions")
const router=express.Router()



router.post("/create",authenticate,createPrescription)

router.post("/patient/all",authenticate,getPatientsPrescriptions)

router.post("/doctor/all",authenticate,getDoctorPrescriptions)







module.exports=router