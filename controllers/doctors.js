
const doctor = require("../models/doctor")
const reviews = require("../models/reviews")
const patients=require("../models/patient")
const db=require("../utils/db")
const {Sequelize}=require("sequelize")
const { handleGetDoctor, handleGetDoctorByCategory } = require("../services/doctor")



const getDoctor=async(req,res,next)=>{
    try {
        const transaction=await db.transaction()
        const {id}=req.params
        const docId=parseInt(id)
        const result=await handleGetDoctor(docId)
        res.status(202).json(result)
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}



const getDoctorByCategory=async(req,res,next)=>{
    try {
        const transaction=await db.transaction()
        const {category}=req.params
        const result=await handleGetDoctorByCategory(category)
        res.status(202).json(result) 
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        await transaction.rollback()
    }
}


module.exports={getDoctor,getDoctorByCategory}