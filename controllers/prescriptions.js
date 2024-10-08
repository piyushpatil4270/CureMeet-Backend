const prescriptions=require("../models/prescriptions")
const patients=require("../models/patient")
const { where, Op } = require("sequelize")
const doctor = require("../models/doctor")
const moment=require("moment")
const Sequelize=require("sequelize")
const appointments = require("../models/appointments")
const { handleCreatePrescription, handleGetDoctorPrescriptions } = require("../services/prescriptions")
const db=require("../utils/db")


const createPrescription=async(req,res,next)=>{
    try {
      const transaction=await db.transaction()
        const result=await handleCreatePrescription(req.body,req.user.id)
        res.status(202).json("Prescrption added successfully")
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        res.status(202).json("An error occured try again")
        await transaction.rollback()
    }
}


const getPatientsPrescriptions=async(req,res,next)=>{
    try {
      const transaction=await db.transaction()
        const {patientId,date}=req.body
       const startDate= moment(date,"DD-MM-YYYY")
        .startOf("day")
        .toDate();
        const endDate=moment(date,"DD-MM-YYYY")
        .endOf("day")
        .toDate();
        console.log("Start ",startDate," ","End ",endDate)
        const allPrescriptions = await prescriptions.findAll({
            where: {
              patientId: patientId,
              date: {
                [Op.between]: [startDate, endDate]  
              }
            },
            include: [
              {
                model: doctor,
                attributes: ['firstname', 'lastname', 'email']  
              }
            ],
            attributes: [
              'appointmentId', 
              [Sequelize.fn('GROUP_CONCAT', Sequelize.col('details')), 'prescriptionDetails'], 
              'date' 
            ],
            group: ['appointmentId', 'date', 'doctor.id'],  
            order: [['date', 'ASC']] 
          });
          
          
          
          
          
          
        res.status(202).json(allPrescriptions)
        await transaction.commit()
      
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json(error)
        await transaction.rollback()
    }
}


const getDoctorPrescriptions=async(req,res,next)=>{
    try {
      const transaction=await db.transaction()
        const result=await handleGetDoctorPrescriptions(req.body)
        res.status(202).json(result)
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}

module.exports={createPrescription,getDoctorPrescriptions,getPatientsPrescriptions}