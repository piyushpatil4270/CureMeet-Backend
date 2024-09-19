const express=require("express")
const router=express.Router()
const document=require("../models/documents")
const authenticate = require("../middleware/auth")
const multer=require("multer")
const { uploadS3Object, deleteFileFromS3 } = require("../aws")

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post("/delete",authenticate,async(req,res,next)=>{
    try {
        const {docId}=req.body
        const deleteDocument=await document.findOne({where:{id:docId}})
        await deleteFileFromS3(deleteDocument.documentKey)
        await document.destroy({where:{id:docId}})
        res.status(202).json("Document deleted successfully")
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
})


router.post("/getAll",authenticate,async(req,res,next)=>{
    try {
        const {userId}=req.body
        const documents=await document.findAll({where:{patientId:userId}})
        res.status(202).json(documents)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
})

router.post("/create",upload.single("file"),authenticate,async(req,res,next)=>{
    try {
        const {userId}=req.body
        const newUserId=parseInt(userId)
       const url= await uploadS3Object(req.file)
       if(!url){
        return res.status(404).json("File uploading failed")
       }
       const newDocument=await document.create({
        patientId:newUserId,
        document:url[0],
        documentKey:url[1]
       })
        res.status(202).json(newDocument) 
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
})





module.exports=router