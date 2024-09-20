const express=require("express")
const router=express.Router()

const authenticate = require("../middleware/auth")
const multer=require("multer")

const { createDocument, getAllDocuments, deleteDocument, getDocumentsForAppointment } = require("../controllers/documents")

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post("/delete",authenticate,deleteDocument)


router.post("/getAll",authenticate,getAllDocuments)

router.post("/create",authenticate,upload.single("file"),createDocument)
router.post("/getPatientDocuments",authenticate,getDocumentsForAppointment)





module.exports=router