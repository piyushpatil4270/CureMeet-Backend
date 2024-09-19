const Sequelize = require("sequelize")
const db=require("../utils/db")


const prescriptions=db.define("prescriptions",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    appointmentId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    doctorId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    patientId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    details:{
        type:Sequelize.TEXT,
        allowNull:false
    },
    date:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.NOW
    }
},{
    timestamps:false
})


module.exports=prescriptions