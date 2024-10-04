
const doctor = require("../models/doctor")
const reviews = require("../models/reviews")
const patients=require("../models/patient")

const {Sequelize}=require("sequelize")
const { handleGetDoctor, handleGetDoctorByCategory } = require("../services/doctor")



const getDoctor=async(req,res,next)=>{
    try {
        const {id}=req.params
        const docId=parseInt(id)
        const result=await handleGetDoctor(docId)
        res.status(202).json(result)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}



const getDoctorByCategory=async(req,res,next)=>{
    try {
        const {category}=req.params
        const result=await handleGetDoctorByCategory(category)
        res.status(202).json(result) 
    } catch (error) {
        console.log("Error: ",error)
    }
}


module.exports={getDoctor,getDoctorByCategory}