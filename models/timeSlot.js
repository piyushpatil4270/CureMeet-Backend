const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const timeSlot=sequelize.define("timeslot",{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    daySlotId:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    slotTime:{
        type:Sequelize.TIME,
        allowNull:false
    },
    isAvailable:{
        type:Sequelize.BOOLEAN,
        defaultValue:true
    }
},{
    timestamps:false
})

module.exports=timeSlot