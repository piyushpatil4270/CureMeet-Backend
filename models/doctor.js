const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const doctor=sequelize.define("Doctor",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    firstname:{
        type:Sequelize.STRING,
        allowNull:false
    },
    lastname:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    isAdmin:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    department:{
        type:Sequelize.STRING,
        allowNull:false
    }
   

},{
    timestamps:false
})


module.exports=doctor