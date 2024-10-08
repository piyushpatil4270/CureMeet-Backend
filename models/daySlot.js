const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const daySlot=sequelize.define("dayslot",{
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
    appointmentDate:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.NOW
    }
},{
    timestamps:false
})

module.exports=daySlot