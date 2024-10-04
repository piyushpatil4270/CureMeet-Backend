

const { handleDeleteDocument, handleGetAllDocuments, handleCreateDocument, handleDocumentsforAppointment } = require("../services/document")


const deleteDocument=async(req,res,next)=>{
    try {
        const result=await handleDeleteDocument(req.body)
        res.status(202).json("Document deleted successfully")
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
}

const getAllDocuments=async(req,res,next)=>{
    try {
        const userId=req.user.id
        const result=await handleGetAllDocuments(userId)
        res.status(202).json(result)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}

const createDocument=async(req,res,next)=>{
    try {
        const userId=req.user.id
        console.log("User is   " ,req.user.id)
        const result=await handleCreateDocument(userId,req.file)
        if(result===1)  return res.status(404).json("An error occured while uploading file. Try again")
        res.status(202).json(result) 
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}



getDocumentsForAppointment=async(req,res,next)=>{
    try {
        const result=await handleDocumentsforAppointment(req.body)
        res.status(202).json(result)
    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}
module.exports={createDocument,getAllDocuments,deleteDocument,getDocumentsForAppointment}