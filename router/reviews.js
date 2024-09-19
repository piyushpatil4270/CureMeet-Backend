const express=require("express")
const router=express.Router()
const reviews=require("../models/reviews")
const authenticate = require("../middleware/auth")

router.post("/add",authenticate,async(req,res,next)=>{
    try {
      const {appointmentId,rating,details}=req.body
      const newReview=await reviews.create({
        doctorId:1,
        patientId:1,
        appointmentId:appointmentId,
        rating:rating,
        details:details,
      })
      res.status(202).json("Review added successfully")
  
    } catch (error) {
      console.log("Error: ",error)
    }
  })







module.exports=router