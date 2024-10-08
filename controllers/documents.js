
const db=require("../utils/db")
const { handleDeleteDocument, handleGetAllDocuments, handleCreateDocument, handleDocumentsforAppointment } = require("../services/document")


const deleteDocument=async(req,res,next)=>{
    try {
        const transaction=await db.transaction()
        const result=await handleDeleteDocument(req.body)
        res.status(202).json("Document deleted successfully")
        await transaction.commit()
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}

const getAllDocuments=async(req,res,next)=>{
    try {
        const transaction=await db.transaction()
        const userId=req.user.id
        const result=await handleGetAllDocuments(userId)
        res.status(202).json(result)
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}

const createDocument=async(req,res,next)=>{
    try {
        const transaction=await db.transaction()
        const userId=req.user.id
        console.log("User is   " ,req.user.id)
        const result=await handleCreateDocument(userId,req.file)
        if(result===1)  return res.status(404).json("An error occured while uploading file. Try again")
        res.status(202).json(result) 
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}



getDocumentsForAppointment=async(req,res,next)=>{
    try {
        const transaction=await db.transaction()
        const result=await handleDocumentsforAppointment(req.body)
        res.status(202).json(result)
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}
module.exports={createDocument,getAllDocuments,deleteDocument,getDocumentsForAppointment}