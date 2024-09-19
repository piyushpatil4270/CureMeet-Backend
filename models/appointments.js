const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const appointments=sequelize.define("appointments",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    doctorId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    patientId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    status:{
        type:Sequelize.STRING,
        allowNull:true,

    },
    Date:{
        type:Sequelize.DATE,
        allowNull:false,
    },
    time:{
      type:Sequelize.TIME,
      allowNull:false,
    }
},{
    timestamps:false
})

module.exports=appointments