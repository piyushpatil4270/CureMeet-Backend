const doctors=require("../models/doctor")
const moment=require("moment")
const slots = require("../models/slots")
const {Op}=require("sequelize")
const authenticate = require("../middleware/auth")
const doctor = require("../models/doctor")
const { createSlotsForMonth } = require("../services/slots")



const getSlots=async(req,res)=>{
    try {
        const {date,doctorId}=req.body
       
        const appointmentDate = moment(date).startOf('day').format("YYYY-MM-DD HH:mm:ss");
        const endDate = moment(date).endOf('day').format("YYYY-MM-DD HH:mm:ss");

        console.log("Start Date:", appointmentDate);
        console.log("End Date:", endDate);

        const slot = await slots.findOne({
            where: {
                date: {
                    [Op.between]: [appointmentDate, endDate]
                },
                doctorId: doctorId
            }
        });
        if(!slot) return res.status(404).json("No slots found")
        const timeSlots = [
            { time: '10:00 AM', sqlTime: '10:00:00', available: true },
            { time: '11:00 AM', sqlTime: '11:00:00', available: true },
            { time: '12:00 PM', sqlTime: '12:00:00', available: true },
            { time: '01:00 PM', sqlTime: '13:00:00', available: true },
            { time: '02:00 PM', sqlTime: '14:00:00', available: true },
            { time: '03:00 PM', sqlTime: '15:00:00', available: true },
            { time: '04:00 PM', sqlTime: '16:00:00', available: true },
          ];

          console.log("Slot is ",slot)
          const availabilityMap = {
            '10:00 AM': slot.time10,
            '11:00 AM': slot.time11,
            '12:00 PM': slot.time12,
            '01:00 PM': slot.time13,
            '02:00 PM': slot.time14,
            '03:00 PM': slot.time15,
            '04:00 PM': slot.time16,
            '05:00 PM': slot.time17,
          }
            console.log("AVmap ",availabilityMap)
            const updatedTimeSlots = timeSlots.map(newSlot => ({
                ...newSlot,
            
                available: availabilityMap[newSlot.time]
              }));
              console.log("Updated slots ",updatedTimeSlots)
              res.status(202).json(updatedTimeSlots)
    } catch (error) {

        res.status(404).json("An error occured try again")
    }
}


const updateSlots=async(req,res)=>{
    try {
        const {date,time,doctorId}=req.body
        const availabilityMap={
            '08:00:00':'time8',
            '09:00:00':'time9',
            '10:00:00':'time10',
            '11:00:00':'time11',
            '12:00:00':'time12',
            '13:00:00':'time13',
            '14:00:00':'time14',
            '15:00:00':'time15',
            '16:00:00':'time16',
        }
        const appointmentDate = moment(date).startOf('day').format("YYYY-MM-DD HH:mm:ss");
        const endDate = moment(date).endOf('day').format("YYYY-MM-DD HH:mm:ss");
        const slot = await slots.findOne({
            where: {
                date: {
                    [Op.between]: [appointmentDate, endDate]
                },
                doctorId: doctorId
            }
        });
        if(!slot) return res.status(404).json("No slots found")
        const slotTime=availabilityMap[time]
        if(!slotTime) return res.status(404).json("Invalid slot time")
            const [updatedCount] = await slots.update(
                { [slotTime]: false },
                {
                    where: {
                        date: {
                            [Op.between]: [appointmentDate, endDate],
                        },
                        doctorId: doctorId,
                    },
                }
            );
        if(updatedCount===0)return res.status(200).json("Slot not updated")
       res.status(202).json("slot updated succesfully")
        
    } catch (error) {
        console.log(error)
        res.startDate(404).json("An error occured try again")
    }
}

const createTimeSlots=async(req,res,next)=>{
    try {
        const docs = await doctor.findAll();
        const startDate = moment.utc().startOf('month').toDate();
          const endDate = moment.utc().endOf('month').toDate();
      
          for (const doc of docs) {
            await createSlotsForMonth(doc.id, startDate, endDate);
          }
          res.status(202).json("Slots created successfully")
    } catch (error) {
        console.log(error)
        res.status(404).json("An error occured try again")
    }
}

module.exports={createTimeSlots,updateSlots,getSlots}