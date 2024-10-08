const moment = require("moment/moment")
const slots=require("../models/slots")
const doctor = require("../models/doctor")
const cron=require("node-cron")
const {Op}=require("sequelize")
const sequelize = require("../utils/db")
const daySlot = require("../models/daySlot")
const timeSlot = require("../models/timeSlot")

const createSlotsForDoctor=async(doctoId,date)=>{
    try {

     

      const promises=[]
    const currentDaySlot=  await daySlot.create({
        doctorId:doctoId,
        appointmentDate:date
      })
       let currentTime=moment("10:00","HH:ss")
       let targetTime=moment("16:00","HH:ss")
      while(currentTime<=targetTime){
        const currSlotTime=currentTime.format("hh:mm:ss")
        console.log(currSlotTime)
        promises.push(
          timeSlot.create({
            daySlotId:currentDaySlot.id,
            slotTime:currSlotTime,
            isAvailable:true
          })
        )
        currentTime.add(1,"hour")
       } 
      await Promise.all(promises)
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


const deleteRedundantSlots=async()=>{
  try {
    const date=moment.utc().subtract(1,"day")
    const startDate = moment.utc(date).startOf('month').toDate();
    const endDate = moment.utc(date).endOf('month').toDate();
    const previousSlots=await daySlot.findAll({where:{appointmentDate:{
      [Op.between]: [startDate, endDate]
    }}})
    Promise.all(previousSlots.map(async(slot)=>{
      await timeSlot.destroy({where:{
       daySlotId:slot.id
      }})
      await daySlot.destroy({where:{id:slot.id}})
    }))
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



module.exports={createSlotsForDoctor,createSlotsForMonth,CronJob,deleteRedundantSlots}