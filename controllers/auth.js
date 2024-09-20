
const patients=require("../models/patient")
const sequelize=require("sequelize")
const doctors=require("../models/doctor")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

const moment=require("moment")

const document=require("../models/documents")
const appointments = require("../models/appointments")
const slots=require("../models/slots")
const { Model } = require("sequelize")
const { uploadS3Object } = require("../aws")


const saltrounds=10
function generateToken(id) {
    const token = jwt.sign({ userId: id }, "fskhkahkk88245fafjklakljfalk");
    return token;
  }


const patientSignup=async(req,res,next)=>{
    try {
        const {firstname,lastname,email,password}=req.body
        const user=await patients.findOne({where:{email:email}})
        console.log("user ",user)
        if(user){
         return  res.status(200).json("Email already registered")
        }
        const hashedPass=await bcrypt.hash(password,saltrounds)
        const newPatient=await patients.create({
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:hashedPass
        })
        res.status(202).json("User registered succesfully")
        
    } catch (error) {
        console.log("error: ",error)
        res.status(404).json("Something went wrong try again")
    }
}


const patientSignin=async(req,res,next)=>{
    try {
        const {email,password}=req.body
        const user=await patients.findOne({where:{email:email}})
        if(!user){
            return res.status(200).json("User with email doesnt exist")
        }

        const match=await bcrypt.compare(password,user.password)
        if(!match) return res.status(201).json("Incorrect password")
        const token=generateToken(user.id)
    res.status(202).json({msg:"login successful",token:token,id:user.id})

        
    } catch (error) {
        console.log("error: ",error)
        res.status(404).json("Something went wrong try again")
    }
}

const doctorProfile=async(req,res,next)=>{
    try {
       const {date} =req.body
       const userId=req.user.id
       const doc=await doctors.findByPk(userId)
       if(!doc) return res.status(404).json("User not found")
       
      
       const startDate=moment(date).add(1,"day").startOf("day").format("YYYY-MM-DD HH:mm:ss")
       const endDate=moment(date).add(1,"day").endOf("day").format("YYYY-MM-DD HH:mm:ss")
       
       const getSlot=await slots.findOne({where:{date:{
        [sequelize.Op.between]:[startDate,endDate]
       }}})
       if(!doc.isAdmin){
         return res.status(200).json({doctor:doc})
       }
    res.status(202).json({doctor:doc,permission:getSlot?false:true})
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}

const doctorSignup=async(req,res,next)=>{
    try {
        const {firstname,lastname,email,password,department}=req.body
        const user=await doctors.findOne({where:{email:email}})
        console.log("user ",user)
        if(user){
         return  res.status(200).json("Email already registered")
        }
        const hashedPass=await bcrypt.hash(password,saltrounds)
      
        if(req.file){
          const  profileUrl=await uploadS3Object(req.file)
          const newDoctor=await doctors.create({
            firstname:firstname,
            lastname:lastname,
            email:email,
            password:hashedPass,
            department:department,
            profilePic:profileUrl[0]
        })
        }
        else {
            const newDoctor=await doctors.create({
                firstname:firstname,
                lastname:lastname,
                email:email,
                password:hashedPass,
                department:department,
                
            })
        }
        
        res.status(202).json("Doctor registered succesfully")
        
    } catch (error) {
        console.log("error: ",error)
        res.status(404).json("Something went wrong try again")
    }
}

const doctorSignin=async(req,res,next)=>{
    try {
        const {email,password}=req.body
        const user=await doctors.findOne({where:{email:email}})
        if(!user){
            return res.status(200).json("User with email doesnt exist")
        }

        const match=await bcrypt.compare(password,user.password)
        if(!match) return res.status(201).json("Incorrect password")
        const token=generateToken(user.id)
    res.status(202).json({msg:"login successful",token:token,id:user.id})

        
    } catch (error) {
        console.log("error: ",error)
        res.status(404).json("Something went wrong try again")
    }
}


const patientDocument=async(req,res,next)=>{
    try {
        const {userId}=req.body
        const id=parseInt(userId)
        const newDoc=await document.create({
            patientId:id,
            document:req.file.filename
        })
        res.status(202).json("Document uploaded successfully")
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}

const uploadDocument=async(req,res,next)=>{
    try {
        const {userId}=req.body
        const id=parseInt(userId)
        const newDoc=await document.create({
            patientId:id,
            document:req.file.filename
        })
        res.status(202).json("Document uploaded successfully")
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}


const patientProfile=async(req,res,next)=>{
    try {
        const userId=req.user.id
        const existingUser=await patients.findOne({where:{id:userId}})
        if(!existingUser) return res.status(202).json("User not found")
        res.status(202).json(existingUser)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}


const getPatientDocuments=async(req,res,next)=>{
    try {
        const userId=req.user.id
        const docs=await document.findAll({where:{id:userId}})
        res.status(202).json(docs)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json(error)
    }
}


const getPatientData=async(req,res,next)=>{
    try {
        const userId=req.user.id
        console.log("route hitted")
        const data=await appointments.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('appointments.id')), 'totalAppointments'], 
                [sequelize.col('doctor.department'), 'department']],
            where:{patientId:userId},
            include:{
                model:doctors,
                attributes:[]
            },
            group:['doctor.department']
        })
        res.status(202).json(data)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}


module.exports={patientSignin,patientSignup,patientDocument,patientProfile,getPatientData,getPatientDocuments,doctorProfile,doctorSignin,doctorSignup}