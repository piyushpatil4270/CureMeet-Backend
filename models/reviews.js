const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const reviews=sequelize.define("Reviews",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    doctorId:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    appointmentId:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    patientId:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    rating:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    details:{
        type:Sequelize.TEXT,

    }

},{
    timestamps:false
})


module.exports=reviews