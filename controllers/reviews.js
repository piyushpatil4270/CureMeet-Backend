const reviews=require("../models/reviews")
const { handleCreateReview } = require("../services/reviews")


const createReview=async(req,res,next)=>{
    try {
      const userId=req.user.id
      const result= handleCreateReview(userId,req.body)
      res.status(202).json("Review added successfully")
  
    } catch (error) {
      console.log("Error: ",error)
    }
  }


  module.exports={createReview}