const express=require("express")
const router=express.Router()
const reviews=require("../models/reviews")
const authenticate = require("../middleware/auth")
const { createReview } = require("../controllers/reviews")

router.post("/add",authenticate,createReview)







module.exports=router