const reviews=require("../models/reviews")



exports.handleCreateReview=async(patientId,body)=>{
    const {appointmentId,rating,details,doctorId}=req.body
      const newReview=await reviews.create({
        doctorId:doctorId,
        patientId:patientId,
        appointmentId:appointmentId,
        rating:rating,
        details:details,
      })
      return 1
}