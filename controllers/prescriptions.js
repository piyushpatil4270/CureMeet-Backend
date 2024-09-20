const prescriptions=require("../models/prescriptions")
const patients=require("../models/patient")
const { where, Op } = require("sequelize")
const doctor = require("../models/doctor")
const moment=require("moment")
const appointments = require("../models/appointments")



const createPrescription=async(req,res,next)=>{
    try {
        const {doctorId,patientId,appointmentId,details}=req.body
        const newPresc=await prescriptions.create({
            appointmentId:appointmentId,
            doctorId:doctorId,
            patientId:patientId,
            details:details
        })
        res.status(202).json("Prescrption added successfully")
        
    } catch (error) {
        console.log("Error: ",error)
        res.status(202).json("An error occured try again")
    }
}


const getPatientsPrescriptions=async(req,res,next)=>{
    try {
        const {patientId,date}=req.body
       const startDate= moment(date,"DD-MM-YYYY")
        .startOf("day")
        .toDate();
        const endDate=moment(date,"DD-MM-YYYY")
        .endOf("day")
        .toDate();
        console.log("Start ",startDate," ","End ",endDate)
        const allPrescriptions = await prescriptions.findAll({
            attributes: ['id', 'date'],
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
            ]
          });
          
        res.status(202).json(allPrescriptions)
      
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}


const getDoctorPrescriptions=async(req,res,next)=>{
    try {
        const {doctorId}=req.body
        const allPrescriptions=await prescriptions.findAll({where:{doctorId:doctorId},include: [{
            model: patients,
        }]})
        res.status(202).json(allPrescriptions)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}

module.exports={createPrescription,getDoctorPrescriptions,getPatientsPrescriptions}