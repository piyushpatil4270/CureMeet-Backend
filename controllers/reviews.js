const reviews=require("../models/reviews")
const { handleCreateReview } = require("../services/reviews")
const db=require("../utils/db")

const createReview=async(req,res,next)=>{
    try {
      const transaction=await db.transaction()
      const userId=req.user.id
      const result= handleCreateReview(userId,req.body)
      res.status(202).json("Review added successfully")
      await transaction.commit()
    } catch (error) {
      console.log("Error: ",error)
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }


  module.exports={createReview}