const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const doctor=sequelize.define("doctors",{
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
    department:{
        type:Sequelize.STRING,
        allowNull:false
    },
    profilePic:{
        type:Sequelize.TEXT,
        defaultValue:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRek5-2kU3bDDM0DOiaEzG9XBfIfKDxIgeZSA&s"
    }
   

},{
    timestamps:false
})


module.exports=doctor