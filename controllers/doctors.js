
const doctor = require("../models/doctor")
const reviews = require("../models/reviews")
const patients=require("../models/patient")

const {Sequelize}=require("sequelize")



const getDoctor=async(req,res,next)=>{
    try {
        const {id}=req.params
        const docId=parseInt(id)
        const doc=await doctor.findByPk(docId)
        const docReviews = await reviews.findAll({
            where: { doctorId: docId },
            limit: 5,
            include: [
              {
                model: patients,
                attributes: ['firstName']
              }
            ],
            order: [['rating', 'ASC']] 
          });
          

          const ratings=await reviews.findAll({
            attributes:[[Sequelize.fn("Sum",Sequelize.col("rating")),"totalRating"],[Sequelize.fn("Count",Sequelize.col("id")),"totalCount"]],
            where:{doctorId:docId}

          })
        res.status(202).json({doctor:doc,reviews:docReviews,rating:ratings})

    } catch (error) {
        console.log("Error: ",error)
        res.status(404).json("An error occured try again")
    }
}



const getDoctorByCategory=async(req,res,next)=>{
    try {
        const {category}=req.params
        if(category==="All"){
            const docs=await doctor.findAll()
            return res.status(201).json(docs)
        }
       const docs=await doctor.findAll({where:{department:category}})
       res.status(202).json(docs) 
    } catch (error) {
        console.log("Error: ",error)
    }
}


module.exports={getDoctor,getDoctorByCategory}