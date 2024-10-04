const doctor = require("../models/doctor")
const reviews = require("../models/reviews")
const patients=require("../models/patient")

const {Sequelize}=require("sequelize")


exports.handleGetDoctor=async(doctorId)=>{
    const doc=await doctor.findByPk(doctorId)
    const docReviews = await reviews.findAll({
        where: { doctorId: doctorId },
        limit: 5,
        include: [
          {
            model: patients,
            attributes: ['firstName']
          }
        ],
        order: [['rating', 'DESC']] 
      });

      const ratings=await reviews.findAll({
        attributes:[[Sequelize.fn("Sum",Sequelize.col("rating")),"totalRating"],[Sequelize.fn("Count",Sequelize.col("id")),"totalCount"]],
        where:{doctorId:doctorId}

      })
      return {doctor:doc,reviews:docReviews,rating:ratings}
}


exports.handleGetDoctorByCategory=async(category)=>{
    if(category==="All"){
        const docs=await doctor.findAll()
        return  docs
    }
    const docs=await doctor.findAll({where:{department:category}})
   return docs
}