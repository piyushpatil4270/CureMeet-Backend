const appointments = require("../models/appointments");
const moment = require("moment-timezone");

const patient = require("../models/patient");
const slots = require("../models/slots");
const { Sequelize, Op, where } = require("sequelize");
const cron = require("node-cron");
const doctor = require("../models/doctor");
const prescriptions = require("../models/prescriptions");
const reviews = require("../models/reviews");

require("dotenv").config()


const getAllMonths = () => {
  const months = [];
  let current = moment().startOf("year");

  for (let i = 0; i < 12; i++) {
    months.push(current.format("MMMM YYYY"));
    current.add(1, "month");
  }

  return months;
};


const nodemailer = require("nodemailer");
const daySlot = require("../models/daySlot");
const timeSlot = require("../models/timeSlot");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.User_Email,
      pass: process.env.User_Pass,
    },
  });

exports.sendEmail=async(mailOptions)=>{
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });
  }



  exports.handleBookAppointment=async(body,patientId)=>{
    const { doctorId, date, time}=body
    console.log("Appointment date is => ",date)
   const user=await doctor.findOne({where:{id:doctorId}})
   const appointmentDateTime = moment(
    `${date} ${time}`,
    "DD-MMMM-YYYY HH:mm:ss"
  );
  const reminderDateTime = moment(appointmentDateTime).subtract(30, "minutes").format("m H * * *");
  if(!user) return 1
  const mailOptions = {
    from: "piyushpatil4270@gmail.com",
    to:user.email,
    subject: "Appointment Reminder",
    text:
      "This is a reminder for your appointment scheduled on " +
      appointmentDateTime.format("LLLL"),
  };
  cron.schedule(reminderDateTime, () => sendEmail(mailOptions), {
   

  });
      
      const appointmentDate = moment(date,"DD-MMMM-YYYY").format("YYYY-MM-DD 00:00:00");

      const startDate=moment(appointmentDate).startOf("day")
      const endDate=moment(appointmentDate).endOf("day")
      const appointmentTime = moment(time, "HH:mm:ss").format("HH:mm:ss")
      console.log("Date  of current appointment is  => ",appointmentDate," Time => ",appointmentTime)
      const appointmentDay=await daySlot.findOne({
        where:{doctorId:doctorId,appointmentDate:{ [Op.between]: [startDate, endDate] }},
        
      })
      if(!appointmentDay) {
        console.log("Day not found...")
        return 2
      }
     
      console.log("Appointment day => ",appointmentDay.id)
      const appointmentTimeSlot=await timeSlot.findOne({
        where:{
         
          daySlotId:appointmentDay.id,
          slotTime:appointmentTime
        }
      })
      if(!appointmentTimeSlot) return 2
      console.log("Appointment-time slot is ",appointmentTimeSlot.id)
      appointmentTimeSlot.isAvailable = false;
      appointmentTimeSlot.changed('isAvailable', true); 
      await appointmentTimeSlot.save();
      const newAppointment=await appointments.create({
        doctorId:doctorId,
        patientId:patientId,
        Date:appointmentDate,
        time:appointmentTime,
        status:"Pending"
      })
      return 3


  }

exports.handleTodaysAppointments=async(doctorId,body)=>{
  const startDate=moment.utc().startOf("day").format("YYYY-MM-DD HH:mm:ss")
  const endDate=moment.utc().endOf("day").format("YYYY-MM-DD HH:mm:ss")
  const currAppointments=await appointments.findAll({where:{doctorId:doctorId,status:"Pending",Date:{
    [Op.between]:[startDate,endDate]
  }},include: [{
    model: patient
  }]})
  return currAppointments
}



exports.handlegetDoctorAppointment=async(body)=>{
  const { appointmentId } = body
  const appt = await appointments.findOne({
    where: { id: appointmentId },
    include: { model: patient },
  });
  const prescs = await prescriptions.findAll({
    where: { appointmentId: appointmentId },
  });
 const docReviews=await reviews.findOne({where:{appointmentId:appointmentId},include: { model: patient },})
 return { appointments: appt, prescriptions: prescs,reviews:docReviews}
}


exports.handleCancelAppointment=async(body)=>{
const {doctorId,time,aptId,date}=body

const exAppointment=await appointments.findOne({where:{id:aptId}})
if(!exAppointment) return 1
const appointmentDate=moment(date,"YYYY-MM-DD").format("YYYY-MM-DD")
const startDate=moment(appointmentDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
const endDate=moment(appointmentDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
console.log(startDate," ",endDate)

await exAppointment.destroy()
const appointmentDaySlot=await daySlot.findOne({
  where:{
    doctorId:doctorId,
    appointmentDate:{
      [Op.between]:[startDate,endDate]
    }
  }
})
if(!appointmentDaySlot) return 1
console.log("Date is ",date)
console.log("Time is ",time)
console.log("Day slot id is ",appointmentDaySlot.id)
const appointmentTime=await timeSlot.findOne({
  where:{
    daySlotId:appointmentDaySlot.id,
    slotTime:time
  }
})
if(!appointmentTime) return 2;
appointmentTime.isAvailable=true
await appointmentTime.save()

return 3
}


exports.handlegetDoctorAppointments=async(body,doctorId)=>{
  const {date}=body
  const appointmentDate = moment(date)
  .startOf("day")
  .format("YYYY-MM-DD HH:mm:ss");
  const endDate = moment(date).endOf("day").format("YYYY-MM-DD HH:mm:ss");
  const allAppointments = await appointments.findAll({
    where: {
      date: {
        [Op.between]: [appointmentDate, endDate],
      },
      doctorId: doctorId,
    },
    include: [
      {
        model: patient,
        attributes: ["id", "firstname", "lastname"],
      },
    ],
  });
  return allAppointments
}


exports.handlePatientAppointments=async(body,patientId)=>{
  const {date}=body
  const startDate = moment(date, "DD-MM-YYYY").startOf("day").toDate();
  const endDate = moment(date, "DD-MM-YYYY").endOf("day").toDate();
  const allAppointments = await appointments.findAll({
    where: {
      patientId: patientId,
      date: { [Op.between]: [startDate, endDate] },
    },
    include: [
      { model: doctor, attributes: ["firstname", "lastname", "email", "id"] },
    ],
  });
  
  const formattedAppointments=allAppointments.map((appointment)=>{
    const appointmentData=appointment.toJSON();
    return{
      ...appointmentData, 
    Date: moment.tz(appointment.Date, "Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
    }
  })
  return formattedAppointments
}


exports.handleAddReview=async(body,patientId)=>{
  const {appointmentId,rating,details,doctorId}=body
  const patientReview=await reviews.create({
    appointmentId:appointmentId,
    patientId:patientId,
    rating:rating,
    details:details,
    doctorId:doctorId
  })
  return 1
}

exports.handlegetPatientAppointment=async(body)=>{
const {appointmentId}=body
const appt = await appointments.findOne({
  where: { id: appointmentId },
  include: { model: doctor },
});
const prescs = await prescriptions.findAll({
  where: { appointmentId: appointmentId },
});
const myReview=await reviews.findOne({where:{appointmentId:appointmentId,patientId:1}})
return { appointments: appt, prescriptions: prescs,review:myReview }
}


exports.handleAppontmentSuccessful=async(body,doctorId)=>{
  const { appointmentId, presc, patientId }=body
  await Promise.all(
    presc.map(async (pres) => {
      await prescriptions.create({
        appointmentId: appointmentId,
        doctorId: doctorId,
        patientId: patientId,
        details: pres,
      });
    })
  );
  const [updateRows] = await appointments.update(
    { status: "Successful" },
    { where: { id: appointmentId } }
  );
  return updateRows

}


exports.handlePatientMonthlyData=async(patientId,body)=>{
  const startDate = moment.utc().startOf("year").format("YYYY-MM-DD");
  const endDate = moment.utc().endOf("year").format("YYYY-MM-DD");
  const appts = await appointments.findAll({
    attributes: [
      [Sequelize.fn("DATE_FORMAT", Sequelize.col("date"), "%Y-%m"), "month"],
      [Sequelize.fn("COUNT", Sequelize.col("id")), "totalAppointments"],
    ],
    where: {
      patientid: patientId,
      status: "Successful",
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: ["month"],
    raw: true,
  });
  

  const allMonths = getAllMonths();

  const formattedAppointments = appts.reduce((acc, appointment) => {
    const month = moment(appointment.month + "-01", "YYYY-MM-DD").format(
      "MMMM YYYY"
    );
    acc[month] = appointment.totalAppointments;
    return acc;
  }, {});

  const finalResult = allMonths.map((month) => ({
    month,
    totalAppointments: formattedAppointments[month] || 0,
  }));

 return finalResult
}



exports.handleDoctorMonthlyData=async(doctorId,body)=>{
  const startDate = moment.utc().startOf("year").format("YYYY-MM-DD");
      const endDate = moment.utc().endOf("year").format("YYYY-MM-DD");
      console.log("start is ", startDate, " end is ", endDate);
      const appts = await appointments.findAll({
        attributes: [
          [Sequelize.fn("DATE_FORMAT", Sequelize.col("date"), "%Y-%m"), "month"],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "totalAppointments"],
        ],
        where: {
          doctorId:doctorId,
          status: "Successful",
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: ["month"],
        raw: true,
      });

      const startOfDay = moment
        .utc()
        .subtract(7, "days")
        .startOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
      const endOfDay = moment.utc().endOf("day").format("YYYY-MM-DD HH:mm:ss");
      const apptTrend = await appointments.findAll({
        attributes: [
          [Sequelize.fn("DATE_FORMAT", Sequelize.col("date"), "%Y-%m-%d"), "day"],
          [Sequelize.fn("COUNT", Sequelize.col("id")), "totalAppointments"],
        ],
        where: {
          doctorId: doctorId,
          status: "Successful",
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        group: ["day"],
        order:[[Sequelize.col('day'), 'DESC']],
       
        raw: true,
      });
      const last7Days = [];
  
      for (let i = 0; i < 7; i++) {
      const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
      last7Days.push({day:day,appointments:0});
    }
    apptTrend.forEach(element => {
      const idx = last7Days.findIndex(el => el.day === element.day);
      
      if (idx !== -1) {
        
        last7Days[idx].appointments+=element.totalAppointments;
      }
    });
    const allMonths = getAllMonths();
  
      const formattedAppointments = appts.reduce((acc, appointment) => {
        const month = moment(appointment.month + "-01", "YYYY-MM-DD").format(
          "MMMM YYYY"
        );
        acc[month] = appointment.totalAppointments;
        return acc;
      }, {});
      const finalResult = allMonths.map((month) => ({
        month,
        totalAppointments: formattedAppointments[month] || 0,
      }));
      return {final:finalResult,trend:last7Days }
}

