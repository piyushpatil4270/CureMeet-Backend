const express=require("express")
const { patientSignin, doctorProfile, doctorSignup, doctorSignin, patientDocument, getPatientDocuments, getPatientData, patientProfile } = require("../controllers/auth")
const router=express.Router()
const auth=require("../middleware/auth")

const multer=require("multer")
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });
router.post("/patient/signup",upload.single("file"),async(req,res,next)=>{
    
})




router.post("/patient/signin",patientSignin)


router.post("/doctor/profile",auth,doctorProfile)

router.post("/doctor/signup",upload.single("file"),doctorSignup)


router.post("/doctor/signin",doctorSignin)







router.post("/patient/document",upload.single("file"),patientDocument)
router.post("/profile",auth,patientProfile)


router.post("/profile/doc",auth,async(req,res,next)=>{
    try {
        const userId=req.user.id
        const existingUser=await doctors.findOne({where:{id:userId}})
        if(!existingUser) return res.status(202).json("User not found")
        res.status(202).json(existingUser)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
})


router.post("/patient/doc",auth,getPatientDocuments)


router.post("/patient/data",auth,getPatientData)




module.exports=router