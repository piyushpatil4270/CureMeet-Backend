const reviews=require("../models/reviews")


const createReview=async(req,res,next)=>{
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
  }


  module.exports={createReview}