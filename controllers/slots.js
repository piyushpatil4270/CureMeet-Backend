const doctors = require("../models/doctor");
const moment = require("moment");
const slots = require("../models/slots");
const { Op } = require("sequelize");
const authenticate = require("../middleware/auth");
const doctor = require("../models/doctor");
const { createSlotsForMonth } = require("../services/slots");
const db=require("../utils/db");
const daySlot = require("../models/daySlot");
const timeSlot = require("../models/timeSlot");
const getSlots = async (req, res) => {
  const transaction=await db.transaction()
  try {
  
    const { date, doctorId } = req.body;

    const appointmentDate = moment(date, "DD-MMMM-YYYY").format("YYYY-MM-DD 00:00:00")
    const startDate=moment(appointmentDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    const endDate = moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");
   console.log("Date is ",appointmentDate)
    console.log("Start Date:",startDate);
    console.log("End Date:", endDate);
    const appointmentDay=await daySlot.findOne({
      where:{
        doctorId:doctorId,
        appointmentDate:{
          [Op.between]:[startDate,endDate]
        }
      }
    })
    if(!appointmentDay){
      console.log("Slot not found")
      res.status(404).json("Slot not found")
    }
    console.log("Slot id is ",appointmentDay.id)
    const appointmentTime=await timeSlot.findAll({
      where:{
        daySlotId:appointmentDay.id
      }
    })
    console.log("Appointments time is => ",appointmentTime)
    const timeSlots = [
      { time: "10:00 AM", sqlTime: "10:00:00", available: true },
      { time: "11:00 AM", sqlTime: "11:00:00", available: true },
      { time: "12:00 PM", sqlTime: "12:00:00", available: true },
      { time: "01:00 PM", sqlTime: "01:00:00", available: true },
      { time: "02:00 PM", sqlTime: "02:00:00", available: true },
      { time: "03:00 PM", sqlTime: "03:00:00", available: true },
      { time: "04:00 PM", sqlTime: "04:00:00", available: true },
    ];
    const updatedSlots=timeSlots.map((element)=>{
      const index=appointmentTime.findIndex((el)=>el.slotTime===element.sqlTime)
      if(index===-1) return {...element}
      else return {
        ...element,
        available:appointmentTime[index].isAvailable
      }
    })
    console.log("Updated slots ",updatedSlots)
    res.status(202).json(updatedSlots)

    await transaction.commit()
  } catch (error) {
    console.log(error)
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};


const createTimeSlots = async (req, res, next) => {
  try {
    const transaction=await db.transaction()
    const docs = await doctor.findAll();
    const startDate = moment.utc().startOf("month").toDate();
    const endDate = moment.utc().endOf("month").toDate();

    for (const doc of docs) {
      await createSlotsForMonth(doc.id, startDate, endDate);
    }
    res.status(202).json("Slots created successfully");
    await transaction.commit()
  } catch (error) {
    console.log(error);
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};

module.exports = { createTimeSlots, updateSlots, getSlots };
