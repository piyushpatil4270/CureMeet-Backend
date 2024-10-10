require("dotenv").config();
const patients = require("../models/patient");
const sequelize = require("sequelize");
const doctors = require("../models/doctor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db=require("../utils/db")
const moment = require("moment");

const document = require("../models/documents");
const appointments = require("../models/appointments");
const slots = require("../models/slots");
const { createSlotsForMonth } = require("../services/slots");
const { uploadS3Object } = require("../services/aws");
const { handlePatientSignup, handlePatientSignin, handleDoctorProfile, handleDoctorSignup, handleDoctorSignin, handlePatientdocument, handlePatientsProfile, handlegetPatientDocuments, handlegetPatientData } = require("../services/auth");

const saltrounds = 10;
function generateToken(id) {
  const token = jwt.sign({ userId: id }, process.env.JWT_KEY);
  return token;
}

const patientSignup = async (req, res, next) => {
  const transaction=await db.transaction()
  try {
    console.log("Patient signin up ",req.body)
    
    const result=await handlePatientSignup(req.body)
    if (result===1) {
      await transaction.rollback();
      return res.status(400).json("Email already registered");
    }
   
    res.status(202).json("User registered succesfully");
    await transaction.commit()
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json("Something went wrong try again");
    await transaction.rollback()
  }
};

const patientSignin = async (req, res, next) => {
  const transaction=await db.transaction()
  try {
  
   const result=await handlePatientSignin(req.body)
    if (result===1) {
      return res.status(400).json("User with email doesnt exist");
    }
    if (result===2) return res.status(401).json("Incorrect password");
    res
      .status(202)
      .json(result);
      await transaction.commit()
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json("Something went wrong try again");
    await transaction.rollback()
  }
};

const doctorProfile = async (req, res, next) => {
  const transaction=await db.transaction()
  try {
    
    const result=await handleDoctorProfile(req.user.id,req.body)
    if(result===1) return res.status(404).json("User not found")
    res.status(202).json(result)
  await transaction.commit()
     } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};

const doctorSignup = async (req, res, next) => {
  const transaction=await db.transaction()
  try {
    
    const result=await handleDoctorSignup(req)
    if(result===1) return res.status(400).json("User with email already exist")
    res.status(202).json("Doctor registered succesfully");
  await transaction.commit()
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json("Something went wrong try again");
    await transaction.rollback()
  }
};

const doctorSignin = async (req, res, next) => {
  try {
    const transaction=await db.transaction()
     const result=await handleDoctorSignin(req.body)
     if(result===1) return res.status(400).json("User with email doesnt exist")
    if(result===2) return res.status(401).json("Password doesnt match")
    res
      .status(202)
      .json(result);
      await transaction.commit()
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json("Something went wrong try again");
    await transaction.rollback()
  }
};

const patientDocument = async (req, res, next) => {
  try {
    const transaction=await db.transaction()
    await handlePatientdocument(req.body)
    res.status(202).json("Document uploaded successfully");
    await transaction.commit()
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};



const patientProfile = async (req, res, next) => {
  try {
    const transaction=await db.transaction()
    const userId = req.user.id;
    const result=await handlePatientsProfile(userId,req.body)
    if (!result) return res.status(202).json("User not found");
    res.status(202).json(result);
    await transaction.commit()
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};

const getPatientDocuments = async (req, res, next) => {
  try {
    const transaction=await db.transaction()
    const userId = req.user.id;
    const result=await handlegetPatientDocuments(userId,req.body)
    res.status(202).json(result);
    await transaction.commit()
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json(error);
    await transaction.rollback()
  }
};

const getPatientData = async (req, res, next) => {
  try {
    const transaction=await db.transaction()
    const userId = req.user.id;
    const result=await handlegetPatientData(userId,req.body)
    res.status(202).json(result);
    await transaction.commit()
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};

module.exports = {
  patientSignin,
  patientSignup,
  patientDocument,
  patientProfile,
  getPatientData,
  getPatientDocuments,
  doctorProfile,
  doctorSignin,
  doctorSignup,
};
