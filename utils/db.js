const sequelize=require("sequelize")


const db=new sequelize('hcare','root','Piyush@nyc85',{dialect:'mysql',host:'localhost'})

module.exports=db