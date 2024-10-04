const moment = require("moment/moment")
const slots=require("../models/slots")
const doctor = require("../models/doctor")
const cron=require("node-cron")
const {Op}=require("sequelize")
const sequelize = require("../utils/db")

const createSlotsForDoctor=async(doctoId,date)=>{
    try {
        await slots.create({
            doctorId:doctoId,
            date:date,
            time10: true,
            time11: true,
            time12: true,
            time13: true,
            time14: true,
            time15: true,
            time16: true,
             time17:true,
        })
        console.log("Slot created successfully")
    } catch (error) {
    console.log(error)    
    }

}



 const createSlotsForMonth=async(doctorId,startDate,endDate)=>{
    try {
        const start = moment(startDate)
        const end=moment(endDate)
        while(start<=end){
            const dateString=start.format("YYYY-MM-DD")
            await createSlotsForDoctor(doctorId,dateString)
            start.add(1,"days")
        }
    } catch (error) {
        console.log(error)

    }
}


const deleteRedundantSlots=async(startDate,endDate)=>{
  try {
    const date=moment.utc().subtract(1,"day")
    const startDate = moment.utc(date).startOf('month').toDate();
    const endDate = moment.utc(date).endOf('month').toDate();
    await slots.destroy({where:{date:{
      [Op.between]: [startDate, endDate]
    }}})
  } catch (error) {
    console.log("Error occured while deleting slots :",error)
  }
}


async function CronJob(){
 
    cron.schedule('30 18 28-31 * *', async () => {
      if (new Date().getDate() === 1) {
        try {
          console.log('Scheduler running: Creating slots for the new month');
          
          const startDate = moment.utc().startOf('month').toDate();
          const endDate = moment.utc().endOf('month').toDate();
          
          const docs = await doctor.findAll();
        
      
          for (const doc of docs) {
            await createSlotsForMonth(doc.id, startDate, endDate);
          }
         
          console.log('Slots for doctors created successfully');
         await deleteRedundantSlots()
          console.log('Redundant slots deleted')
        } catch (error) {
          console.error('Error while creating slots:', error);
        }
      }
        
      });
    
}

module.exports={createSlotsForDoctor,createSlotsForMonth,CronJob}