
const document=require("../models/documents")

const { uploadS3Object, deleteFileFromS3 } = require("../services/aws")



exports.handleDeleteDocument=async(body)=>{
const {docId}=body
const deleteDocument=await document.findOne({where:{id:docId}})
        await deleteFileFromS3(deleteDocument.documentKey)
        await document.destroy({where:{id:docId}})
        return 1
}


exports.handleGetAllDocuments=async(patientId)=>{
    const documents=await document.findAll({where:{patientId:patientId}})
        
    return documents
}


exports.handleCreateDocument=async(patientId,file)=>{
   
        
        console.log("PatientId ",patientId)
        const url= await uploadS3Object(file)
       if(!url){
        return 1
       }
       const newDocument=await document.create({
        patientId:patientId,
        document:url[0],
        documentKey:url[1]
       })
        return newDocument
}



exports.handleDocumentsforAppointment=async(body)=>{
const {userId}=body
const documents=await document.findAll({where:{patientId:userId}})
return documents
}