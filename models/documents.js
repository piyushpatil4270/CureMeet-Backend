const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const appointments=sequelize.define("documents",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    patientId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    document:{
        type:Sequelize.STRING,
        allowNull:false
    },
    documentKey:{
        type:Sequelize.TEXT,
        allowNull:false
    }
},{
    timestamps:false
})

module.exports=appointments