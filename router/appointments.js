const express = require("express");
const router = express.Router();
const appointments = require("../models/appointments");
const moment = require("moment");
const nodemailer = require("nodemailer");
const patient = require("../models/patient");
const slots = require("../models/slots");
const { Sequelize, Op, where } = require("sequelize");
const cron = require("node-cron");
const doctor = require("../models/doctor");
const prescriptions = require("../models/prescriptions");
const reviews = require("../models/reviews");
const authenticate=require("../middleware/auth")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "piyushpatil4270@gmail.com",
    pass: "zymz tuhd qocf kqfo",
  },
});

const getAllMonths = () => {
  const months = [];
  let current = moment().startOf("year");

  for (let i = 0; i < 12; i++) {
    months.push(current.format("MMMM YYYY"));
    current.add(1, "month");
  }

  return months;
};

function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
}

router.post("/bookAppointment",authenticate,async (req, res) => {
  try {
    const { doctorId, date, time} = req.body;
    const patientId=req.user.id
    const docEmail = await doctor.findOne({ where: { id: doctorId } });
    const appointmentDateTime = moment(
      `${date} ${time}`,
      "DD-MMMM-YYYY HH:mm:ss"
    );
    const reminderDateTime = moment(appointmentDateTime).subtract(30, "minutes").format("m H * * *");
    console.log(appointmentDateTime)
    console.log("Remainder-Time ",moment(appointmentDateTime).subtract(15, "minutes").toString())
    

    if (!docEmail) return res.status(404).json("Doctor doesnt exist");
    const mailOptions = {
      from: "piyushpatil4270@gmail.com",
      to: docEmail.email,
      subject: "Appointment Reminder",
      text:
        "This is a reminder for your appointment scheduled on " +
        appointmentDateTime.format("LLLL"),
    };
    cron.schedule(reminderDateTime, () => sendEmail(mailOptions), {
     
    });
    const appointmentDate = moment.utc(date, "DD-MMMM-YYYY").toDate();

    const appointmentTime = moment(time, "HH:mm:ss").format("HH:mm:ss");

    const appointment = await appointments.create({
      doctorId: doctorId,
      patientId: patientId,
      status: "Pending",
      time: appointmentTime,
      Date: appointmentDate,
    });

    const startDate = moment(date, "DD-MMMM-YYYY")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(date, "DD-MMMM-YYYY")
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    const slot = await slots.findOne({
      where: {
        doctorId: doctorId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    if (!slot) return res.status(404).json("Invalid Timeslot");

    const availabilityMap = {
      "10:00:00": "time10",
      "11:00:00": "time11",
      "12:00:00": "time12",
      "13:00:00": "time13",
      "14:00:00": "time14",
      "15:00:00": "time15",
      "16:00:00": "time16",
      "17:00:00": "time17",
    };

    const timeField = availabilityMap[appointmentTime];

    await slots.update({ [timeField]: false }, { where: { id: slot.id } });
    res.status(202).json("Appointment created successfully");
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occurred, try again");
  }
});

router.get("/doctor/todaysAppointments",authenticate,async(req,res)=>{
  try {
    const startDate=moment.utc().startOf("day").format("YYYY-MM-DD HH:mm:ss")
    const endDate=moment.utc().endOf("day").format("YYYY-MM-DD HH:mm:ss")
    const doctorId=req.user.id
    console.log(startDate,"  ",endDate)
    const currAppointments=await appointments.findAll({where:{doctorId:doctorId,status:"Pending",Date:{
      [Op.between]:[startDate,endDate]
    }},include: [{
      model: patient
    }]})
    res.status(202).json(currAppointments)
  } catch (error) {
    console.log(error)
    res.status(404).json("An error occured try again")
  }
})

router.post("/doctor/appointment",authenticate,async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    
    const appt = await appointments.findOne({
      where: { id: appointmentId },
      include: { model: patient },
    });
    const prescs = await prescriptions.findAll({
      where: { appointmentId: appointmentId },
    });
   const docReviews=await reviews.findOne({where:{appointmentId:appointmentId},include: { model: patient },})
    res.status(202).json({ appointments: appt, prescriptions: prescs,reviews:docReviews});
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});



router.post("/cancelAppointment",authenticate,async (req, res, next) => {
  try {
    const { doctorId, time, aptId } = req.body;
    const deleteApt = await appointments.findOne({ where: { id: aptId } });
    if (!deleteApt) return res.status(404).json("Appointment not found");
    const date = deleteApt.Date;
    console.log("Original Date is ", date);
    await deleteApt.destroy();
    const startDate = moment(date, "DD-MMMM-YYYY")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const endDate = moment(date, "DD-MMMM-YYYY")
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    const slot = await slots.findOne({
      where: {
        doctorId: doctorId,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    if (!slot) return res.status(404).json("Invalid Timeslot");

    const availabilityMap = {
      "10:00:00": "time10",
      "11:00:00": "time11",
      "12:00:00": "time12",
      "13:00:00": "time13",
      "14:00:00": "time14",
      "15:00:00": "time15",
      "16:00:00": "time16",
      "17:00:00": "time17",
    };
    const timeField = availabilityMap[time];

    await slots.update({ [timeField]: true }, { where: { id: slot.id } });
    res.status(202).json("Appointment cancelled successfully");
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});

router.post("/doctor/appointments",authenticate,async (req, res) => {
  try {
    const { date} = req.body;
    const appointmentDate = moment(date)
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
      const doctorId=req.user.id
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
    res.status(202).json(allAppointments);
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});

router.post("/patients/appointments",authenticate,async (req, res, next) => {
  try {
    const {  date } = req.body;
    const patientId=req.user.id

    const startDate = moment(date, "DD-MM-YYYY").startOf("day").toDate();
    const endDate = moment(date, "DD-MM-YYYY").endOf("day").toDate();
    console.log(
      "selected date is ",
      date,
      " start ",
      startDate,
      " end ",
      endDate
    );
    const allAppointments = await appointments.findAll({
      where: {
        patientId: patientId,
        date: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: doctor, attributes: ["firstname", "lastname", "email", "id"] },
      ],
    });
    res.status(202).json(allAppointments);
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});


router.post("/reviews/add",authenticate,async(req,res,next)=>{
  try {
    const patientId=req.user.id
    const {appointmentId,rating,details,doctorId}=req.body
    const patientReview=await reviews.create({
      appointmentId:appointmentId,
      patientId:patientId,
      rating:rating,
      details:details,
      doctorId:doctorId
    })
    res.status(202).json("Review Added")
    
  } catch (error) {
    console.log("Error: ",error)
    res.status(404).json("An error occured try again")
  }
})

router.post("/patient/appointment",authenticate,async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    const appt = await appointments.findOne({
      where: { id: appointmentId },
      include: { model: doctor },
    });
    const prescs = await prescriptions.findAll({
      where: { appointmentId: appointmentId },
    });
    const myReview=await reviews.findOne({where:{appointmentId:appointmentId,patientId:1}})
    res.status(202).json({ appointments: appt, prescriptions: prescs,review:myReview });
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});
router.post("/successful",authenticate ,async (req, res, next) => {
  try {
    const { appointmentId, presc, patientId } = req.body;
    const doctorId=req.user.id
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
    if (updateRows === 0) return res.status(404).json("Appoinment Not Found");
    res.status(202).json("Appoinment Finished");
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});

router.post("/patient/monthlyData",authenticate,async (req, res, next) => {
  try {
    const userId=req.user.id
    const startDate = moment.utc().startOf("year").format("YYYY-MM-DD");
    const endDate = moment.utc().endOf("year").format("YYYY-MM-DD");
    const appts = await appointments.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("date"), "%Y-%m"), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalAppointments"],
      ],
      where: {
        patientid: 1,
        status: "Successful",
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ["month"],
      raw: true,
    });
    console.log(appts);

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

    res.status(200).json(finalResult);
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});

router.post("/doctor/monthlyData",authenticate,async (req, res, next) => {
  try {
    const userId=req.user.id
    const startDate = moment.utc().startOf("year").format("YYYY-MM-DD");
    const endDate = moment.utc().endOf("year").format("YYYY-MM-DD");
    console.log("start is ", startDate, " end is ", endDate);
    const appts = await appointments.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("date"), "%Y-%m"), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalAppointments"],
      ],
      where: {
        doctorId: userId,
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

    console.log("Start of Day:", startOfDay, "End of Day:", endOfDay);

    const apptTrend = await appointments.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("date"), "%Y-%m-%d"), "day"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalAppointments"],
      ],
      where: {
        doctorId: userId,
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
      
      last7Days[idx].appointments=element.totalAppointments;
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

    res.status(200).json({final:finalResult,trend:last7Days });
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});

module.exports = router;
