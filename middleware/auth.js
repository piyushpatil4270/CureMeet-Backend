require("dotenv").config()
const doctor = require("../models/doctor")
const patient = require("../models/patient")
const jwt=require("jsonwebtoken")
const authenticate=async(req,res,next)=>{
const userToken=req.header("Authorization")
const userType=req.header("userType")
console.log(userType)
if(!userToken) return res.status(400).json("You are not authorized to access the resources")
 try {
        const decryptedToken=jwt.verify(userToken,process.env.JWT_KEY)
        console.log("The decrypted token is ",userToken)
        const  userId=decryptedToken.userId
        console.log("USERID is ",userId)
        if(userType==="Patient"){
            const existingUser=await patient.findOne({where:{id:userId}})
           if(!existingUser) return res.status(403).json("User not found")
            req.user=existingUser
           console.log("middleware set ")
           next()
        }
        else {
            const existingUser=await doctor.findOne({where:{id:userId}})
            if(!existingUser) return res.status(403).json("User not found")
                req.user=existingUser
            console.log("middleware set ")
            next()
        }
       
      
    
    
} catch (error) {
    console.log(error)
    res.status(401).json("User not authorized")
}
}



module.exports=authenticate