const prescriptions=require("../models/prescriptions")
const patients=require("../models/patient")
const { where, Op } = require("sequelize")
const doctor = require("../models/doctor")
const moment=require("moment")
const Sequelize=require("sequelize")
const appointments = require("../models/appointments")


exports.handleCreatePrescription=async(body,patientId)=>{
    const {doctorId,appointmentId,details}=body
    const newPresc=await prescriptions.create({
        appointmentId:appointmentId,
        doctorId:doctorId,
        patientId:patientId,
        details:details
    })
    return 1

}


exports.handleGetDoctorPrescriptions=async(body)=>{
const {doctorId}=body
const allPrescriptions=await prescriptions.findAll({where:{doctorId:doctorId},include: [{
    model: patients,
}]})
return allPrescriptions
}