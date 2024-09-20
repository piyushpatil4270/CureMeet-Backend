
const document=require("../models/documents")

const { uploadS3Object, deleteFileFromS3 } = require("../aws")


const deleteDocument=async(req,res,next)=>{
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
}

const getAllDocuments=async(req,res,next)=>{
    try {
        const userId=req.user.id
        const documents=await document.findAll({where:{patientId:userId}})
        res.status(202).json(documents)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}

const createDocument=async(req,res,next)=>{
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
}



getDocumentsForAppointment=async(req,res,next)=>{
    try {
        const {userId}=req.body
        const documents=await document.findAll({where:{patientId:userId}})
        res.status(202).json(documents)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}
module.exports={createDocument,getAllDocuments,deleteDocument,getDocumentsForAppointment}