const express=require("express")
const router=express.Router()
const document=require("../models/documents")
const authenticate = require("../middleware/auth")

router.post("/delete",authenticate,async(req,res,next)=>{
    try {
        const {docId}=req.body
        const deleteDocument=await document.destroy({where:{id:docId}})
        res.status(202).json("Document deleted successfully")
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
})


router.post("/getAll",authenticate,async(req,res,next)=>{
    try {
        const patientId=req.user.id
        const documents=await document.findAll({where:{patientId:patientId}})
        res.status(202).json(documents)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
})

router.post("/create",authenticate,async(req,res,next)=>{
    try {
        const {userId}=req.body
        const id=parseInt(userId)
        const allDocs=await document.findAll({where:{patientId:id}})
        res.status(202).json(allDocs) 
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
})





module.exports=router