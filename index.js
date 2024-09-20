const express = require("express");
const db = require("./utils/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRouter = require("./router/auth");
const slotRouter = require("./router/slots");
const appointmentRouter = require("./router/appointments");
const appointments = require("./models/appointments");
const prescriptions=require("./models/prescriptions")
const doctor = require("./models/doctor");
const patients = require("./models/patient");
const docRouter=require("./router/doctors")
const prescRouter=require("./router/prescriptions")
const documents=require("./models/documents")
const reviews=require("./models/reviews")
const reviewsRouter=require("./router/reviews")
const documentRouter=require("./router/documents")
const path=require("path")

const {CronJob} =require("./utils/createSlots")


const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


console.log("Patient model:", patients);
console.log("Doctor model:", doctor);
console.log("Appointments model:", appointments);

patients.hasMany(appointments, { foreignKey: "patientId" });
patients.hasMany(reviews,{foreignKey:"patientId"})
doctor.hasMany(reviews,{foreignKey:"doctorId"})
reviews.belongsTo(patients,{foreignKey:"patientId"})
reviews.belongsTo(doctor,{foreignKey:"doctorId"})
patients.hasMany(documents,{ foreignKey: "patientId" })
documents.belongsTo(patients,{ foreignKey: "patientId" })
doctor.hasMany(appointments, { foreignKey: "doctorId" });
appointments.belongsTo(patients,{foreignKey:"patientId"})
appointments.belongsTo(doctor,{foreignKey: "doctorId"})
patients.hasMany(prescriptions, { foreignKey: "patientId" })
doctor.hasMany(prescriptions,{foreignKey: "doctorId"})
prescriptions.belongsTo(doctor,{foreignKey: "doctorId"})
prescriptions.belongsTo(patients,{ foreignKey: "patientId" })
appointments.hasMany(prescriptions,{foreignKey:"appointmentId"})
prescriptions.belongsTo(appointments,{foreignKey:"appointmentId"})



db.sync()
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((err) => console.log("Error: ", err));


app.get("/",(req,res,next)=>{
    res.status(202).json("We are live...")
})


app.use("/auth", authRouter);
app.use("/slots", slotRouter);
app.use("/appointments", appointmentRouter);
app.use("/doctors",docRouter)
app.use("/prescriptions",prescRouter)
app.use("/reviews",reviewsRouter)
app.use("/documents",documentRouter)


CronJob()

app.listen(5500, () => console.log("Server started on port 5500"));
