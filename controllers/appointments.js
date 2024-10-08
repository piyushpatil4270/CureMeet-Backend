const appointments = require("../models/appointments");
const moment = require("moment");
const db=require("../utils/db")
const patient = require("../models/patient");
const slots = require("../models/slots");
const { Sequelize, Op, where } = require("sequelize");
const cron = require("node-cron");
const doctor = require("../models/doctor");
const prescriptions = require("../models/prescriptions");
const reviews = require("../models/reviews");
const {sendEmail, handleBookAppointment, handleTodaysAppointments, handlegetDoctorAppointment, handleCancelAppointment, handlegetDoctorAppointments, handlePatientAppointments, handleAddReview, handlegetPatientAppointment, handleAppontmentSuccessful, handlePatientMonthlyData, handleDoctorMonthlyData}=require("../services/appointment")
require("dotenv").config()


const getAllMonths = () => {
  const months = [];
  let current = moment().startOf("year");

  for (let i = 0; i < 12; i++) {
    months.push(current.format("MMMM YYYY"));
    current.add(1, "month");
  }

  return months;
};




const bookAppointment=async (req, res) => {
  const transaction=await db.transaction()
    try {
        
        const result=await handleBookAppointment(req.body,req.user.id)
        if(result===1) return res.status("Doctor doesnt exist")
        if(result===2) return res.status("Invalid timeslots")
      res.status(202).json("Appointment created successfully");
    await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occurred, try again");
      await transaction.rollback()
    }
  }

  const todaysAppointments=async(req,res)=>{
    try {
      const transaction=await db.transaction()
      const doctorId=req.user.id
      const result=await handleTodaysAppointments(doctorId,req.body)
      res.status(202).json(result)
      await transaction.commit()
    } catch (error) {
      console.log(error)
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }

  const getDoctorAppointment=async (req, res, next) => {
    try {
      const transaction=await db.transaction()
      const result=await handlegetDoctorAppointment(req.body)
      res.status(202).json(result);
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }

  const cancelAppointment=async (req, res, next) => {
    const transaction=await db.transaction()
    try { 
      
         const result=await handleCancelAppointment(req.body)
         if(result===1) res.status(404).json("Appointment not found")
          if(result===2) res.status(401).json("Slot not found")
         res.status(202).json("Appointment cancelled successfully");
        await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }

  const getDoctorAppointments=async (req, res) => {
    try {
      const transaction=await db.transaction()
      const { date} = req.body;
      const doctorId=req.user.id
      const result=await handlegetDoctorAppointments(req.body,doctorId)
      res.status(202).json(result);
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }

  const patientAppointments=async (req, res, next) => {
    const transaction=await db.transaction()
    try {
      
      const patientId=req.user.id
      const result=await handlePatientAppointments(req.body,patientId)
      res.status(202).json(result);
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }

  const addReview=async(req,res,next)=>{
    try {
      const transaction=await db.transaction()
      const patientId=req.user.id
     
      const result=await handleAddReview(req.body,patientId)
      res.status(202).json("Review Added")
      await transaction.commit()
      
    } catch (error) {
      console.log("Error: ",error)
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }

  const getPatientAppointment=async (req, res, next) => {
    try {
      const transaction=await db.transaction()
       const result=await handlegetPatientAppointment(req.body)
      res.status(202).json(result);
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }


  const appointmentSuccessful=async (req, res, next) => {
    try {
      const transaction=await db.transaction()
      const doctorId=req.user.id
       const result=await handleAppontmentSuccessful(req.body,doctorId)
      if (result === 0) return res.status(404).json("Appoinment Not Found");
      res.status(202).json("Appoinment Finished");
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }


  const getPatientMonthlyData=async (req, res, next) => {
    try {
      const transaction=await db.transaction()
      const userId=req.user.id
      const result=await handlePatientMonthlyData(userId,req.body)
      res.status(200).json(result)
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }


  const getDoctorMonthlyData=async (req, res, next) => {
    try {
      const transaction=await db.transaction()
      const userId=req.user.id
      const result=await handleDoctorMonthlyData(userId,req.body)
      res.status(200).json(result)
      await transaction.commit()
    } catch (error) {
      console.log("Error: ", error);
      res.status(404).json("An error occured try again");
      await transaction.rollback()
    }
  }


  module.exports={bookAppointment,getPatientMonthlyData,getDoctorMonthlyData,appointmentSuccessful,getPatientAppointment,addReview,patientAppointments,getDoctorAppointments,todaysAppointments,cancelAppointment,getDoctorAppointment}