const sequelize=require("../utils/db")
const Sequelize=require("sequelize")


const slots=sequelize.define("Slots",{
id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
},
doctorId:{
    allowNull:false,
    type:Sequelize.INTEGER,
    
},
date:{
    type:Sequelize.DATE,
    defaultValue:Sequelize.NOW,
    
},
time10:{
    type:Sequelize.BOOLEAN,
   defaultValue:true
    
},
time11:{
    type:Sequelize.BOOLEAN,
    defaultValue:true
    
},
time12:{
    type:Sequelize.BOOLEAN,
   defaultValue:true
    
},
time13:{
    type:Sequelize.BOOLEAN,
   defaultValue:true
    
},
time14:{
    type:Sequelize.BOOLEAN,
    defaultValue:true
    
},
time15:{
    type:Sequelize.BOOLEAN,
    defaultValue:true
    
},
time16:{
    type:Sequelize.BOOLEAN,
    defaultValue:true
    
},
time17:{
    type:Sequelize.BOOLEAN,
    defaultValue:true
},
},{
    timestamps:false
})


module.exports=slots