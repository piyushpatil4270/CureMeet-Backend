const express=require("express")
const router=express.Router()
const authenticate = require("../middleware/auth")
const { getDoctor, getDoctorByCategory } = require("../controllers/doctors")




router.get("/doctor/:id",authenticate,getDoctor)

router.get("/doctors/:category",authenticate,getDoctorByCategory)






module.exports=router