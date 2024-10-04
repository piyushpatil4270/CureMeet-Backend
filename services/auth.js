require("dotenv").config();
const patients = require("../models/patient");
const sequelize = require("sequelize");
const doctors = require("../models/doctor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const moment = require("moment");

const document = require("../models/documents");
const appointments = require("../models/appointments");
const slots = require("../models/slots");
const { createSlotsForMonth } = require("../services/slots");
const { uploadS3Object } = require("../services/aws");

const saltrounds = 10;
function generateToken(id) {
  const token = jwt.sign({ userId: id }, process.env.JWT_KEY);
  return token;
}

exports.handlePatientSignup = async (body) => {
  const { firstname, lastname, email, password } = body;
  const existingUser = await patients.findOne({ where: { email: email } });
  if (existingUser) return 1;
  const hashedPass = await bcrypt.hash(password, saltrounds);
  const newPatient = await patients.create({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: hashedPass,
  });
  return 2;
};


exports.handlePatientSignin=async(body)=>{
    const {email,password}=body

    const existingUser = await patients.findOne({ where: { email: email } });
    if(!existingUser) return 1
    const match=await bcrypt.compare(password,existingUser.password)
    if(!match) return 2
    const token=generateToken(existingUser.id)
    return { msg: "login successful", token: token, id: existingUser.id }

}


exports.handleDoctorProfile=async(userId,body)=>{
    const {date}=body
    const doc=await doctors.findByPk(userId)
    if(!doc) return 1
    const startDate = moment(date)
      .add(1, "day")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(date)
      .add(1, "day")
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    const getSlot = await slots.findOne({
      where: {
        date: {
          [sequelize.Op.between]: [startDate, endDate],
        },
      },
    });
    if (!doc.isAdmin) {
      return { doctor: doc }
    }
    return { doctor: doc, permission: getSlot ? false : true }
  

}


exports.handleDoctorSignup=async(body,userId)=>{
    const { firstname, lastname, email, password, department } =body
    const doc = await doctors.findOne({ where: { email: email } });
    if(!doc) return 1
    const hashedPass=await bcrypt.hash(password,saltrounds)
    const startDate = moment.utc().startOf("month").toDate();
    const endDate = moment.utc().endOf("month").toDate();
    if (req.file) {
      const profileUrl = await uploadS3Object(req.file);
      const newDoctor = await doctors.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPass,
        department: department,
        profilePic: profileUrl[0],
      })
      await createSlotsForMonth(newDoctor.id, startDate, endDate);
    }
    else {
        const newDoctor = await doctors.create({
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: hashedPass,
          department: department,
        });
        await createSlotsForMonth(newDoctor.id, startDate, endDate);
      }
      return 2

}


exports.handleDoctorSignin=async(body)=>{
const {email,password}=body
const doc = await doctors.findOne({ where: { email: email } });
    if (!doc) {
      return 1;
    }
    const match=await bcrypt.compare(password,doc.password)
    if(!match) return 2
    const token=generateToken(doc.id)
    return {msg: "login successful", token: token, id: doc.id }
}


exports.handlePatientdocument=async(body)=>{
    const {userId}=body
    const id=parseInt(userId)
 const newDoc=await document.create({
    patientId:id,
    document:req.file.filename
 })
 return 1
}


exports.handlePatientsProfile=async(userId,body)=>{
const user=await patients.findOne({where:{id:userId}})
if(!user) return 1
return user
}


exports.handlegetPatientDocuments=async(userId,body)=>{
const userDocuments=await document.findAll({where:{id:userId}})
return userDocuments
}


exports.handlegetPatientData=async(userId,body)=>{
    const data = await appointments.findAll({
        attributes: [
          [
            sequelize.fn("COUNT", sequelize.col("appointments.id")),
            "totalAppointments",
          ],
          [sequelize.col("doctor.department"), "department"],
        ],
        where: { patientId: userId },
        include: {
          model: doctors,
          attributes: [],
        },
        group: ["doctor.department"],
      });
      return data
}