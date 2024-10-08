const doctors=require("../models/doctor")
const express=require("express")

const router=express.Router()
const moment=require("moment")
const slots = require("../models/slots")
const {Op}=require("sequelize")
const authenticate = require("../middleware/auth")
const doctor = require("../models/doctor")

const { getSlots, updateSlots, createTimeSlots } = require("../controllers/slots")




router.post("/getSlots",authenticate,getSlots)


//router.post("/updateslots",authenticate,updateSlots)


router.post("/createSlots",createTimeSlots)

module.exports=router
