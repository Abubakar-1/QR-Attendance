require("dotenv").config();
// require("./models");

const express = require("express");
const app = require("express")();
const mongoose = require("mongoose");
const http = require("http").createServer(app);
const port = 5006;
const cors = require("cors");
const { default: helmet } = require("helmet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verify } = require("jsonwebtoken");
const User = require("./users");
const db = "mongodb://localhost:27017/Qr-Attendance";
const cookieParser = require("cookie-parser");
const { Teacher, Student, Subject, Class } = require("./models");
const path = require("path");

const connectionparams = {};

const corsOption = {
  credentials: true,
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST"],
  optionSuccessStatus: 200,
};

app.use(cors(corsOption));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const validateToken = async (req, res, next) => {
  const usersToken =
    req.headers["x-access-token"] ||
    req.cookies.soks ||
    req.headers["authorization"];

  if (!usersToken) {
    return res.status(405).send("No auth found");
  }
  try {
    const validToken = verify(usersToken, process.env.ACCESS_TOKEN_SECRET);
    if (validToken) {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.send("Error");
  }
};

app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    // Retrieve the _id of the created user
    const userId = user._id;

    if (role === "teacher") {
      await createTeacher(name, email, userId);
    } else if (role === "student") {
      await createStudent(name, email, userId);
    }

    return res.status(200).send("User created successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).send("Error registering user");
  }
});

async function createTeacher(name, email, userId) {
  const teacher = new Teacher({
    _id: userId,
    name,
    email,
    subjects: [],
  });
  await teacher.save();
}

async function createStudent(name, email, userId) {
  const student = new Student({
    _id: userId,
    name,
    email,
    subjects_registered_for: [],
  });
  await student.save();
}

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    const { role, _id: id, name } = user;
    const authenticate = await bcrypt.compare(password, user.password);
    if (!authenticate) return res.status(400).send("Not allowed");

    const accessToken = await jwt.sign(
      {
        role,
        id,
        name,
        email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    if (!accessToken) return res.send("No access token generated");

    res.cookie("soks", accessToken, {
      path: "/",
    });

    return res.status(201).json({ accessToken: accessToken, user });
  } catch (error) {
    console.log(error);
    res.clearCookie("soks");
    return res.status(500).send("Error");
  }
});

app.get("/admin", validateToken, async (req, res) => {
  try {
    return res.send("soks");
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
});

// Create a new subject
app.post("/create-subject", async (req, res) => {
  try {
    const { name, subjectCode, teacherId } = req.body;

    // Initialize subject with an empty teacher field
    let subject = new Subject({ name, subjectCode, teacher: null });

    // If teacherId is provided, assign the teacher to the subject
    if (teacherId) {
      subject.teacher = teacherId;
    }

    // Save the subject to the database
    await subject.save();

    return res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Error creating subject" });
  }
});

// Route to register a student under a subject
app.post("/:studentId/register", async (req, res) => {
  try {
    const { subjectId } = req.body;
    const studentId = req.params.studentId;

    // Find the student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Find the subject by ID
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Check if the student is already registered for the subject
    const alreadyRegistered = student.subjects_registered_for.some((subject) =>
      subject.subject.equals(subjectId)
    );

    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ error: "Student is already registered for this subject" });
    }

    // Add the subject to the student's subjects_registered_for array

    // If not, create a new entry for the current subject
    student.subjects_registered_for.push({
      subject: subjectId,
      attendance: [],
    });

    // Find the index of the current subject in the subjects_registered_for array
    const subjectIndex = student.subjects_registered_for.findIndex((entry) =>
      entry.subject.equals(subjectId)
    );

    // Fetch all classes associated with the subject
    const classes = await Class.find({ subject: subjectId });

    // Populate the student's attendance array with entries for each class
    for (const classObj of classes) {
      const classAttendance = {
        class: classObj._id,
        status: "absent",
      };
      // Add the student to the class attendance array
      classObj.attendance.push({
        student: student._id,
        status: "absent",
      });
      // Save the updated class
      await classObj.save();

      // Add the class to the student's attendance array
      student.subjects_registered_for[subjectIndex].attendance.push(
        classAttendance
      );
    }

    await student.save();

    res
      .status(200)
      .json({ message: "Student registered under subject successfully" });
  } catch (error) {
    console.error("Error registering student under subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to create a class
app.post("/create-class", async (req, res) => {
  try {
    const { subjectId, teacherId, date, time } = req.body;

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Create the class
    const newClass = new Class({
      subject: subjectId,
      teacher: teacherId,
      date,
      time,
      attendance: [],
    });
    await newClass.save();

    // Fetch students registered for the subject
    const students = await Student.find({
      subjects_registered_for: { $elemMatch: { subject: subjectId } },
    });

    // Update attendance for each student and class attendance
    const attendanceEntries = students.map((student) => ({
      student: student._id,
      status: "absent",
    }));

    newClass.attendance = attendanceEntries;
    await newClass.save();

    // Update each student's attendance array
    for (const student of students) {
      const subjectIndex = student.subjects_registered_for.findIndex(
        (subject) => subject.subject.equals(subjectId)
      );
      if (subjectIndex !== -1) {
        student.subjects_registered_for[subjectIndex].attendance.push({
          class: newClass._id,
          status: "absent",
        });
      }
      await student.save();
    }

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define the route to get details of all teachers
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find();

    if (!teachers) {
      return res.status(404).send("Teachers info not found");
    }

    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define the route to get all details of a teacher
app.get("/teachers/:id", validateToken, async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Find the teacher by ID and populate their subjects
    const teacher = await Teacher.findById(teacherId).populate("subjects");

    // If the teacher is not found, return a 404 Not Found response
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Return the teacher details including their subjects
    res.status(200).json(teacher);
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch student details by ID
app.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Find the student by ID
    const student = await Student.findById(studentId)
      .populate("subjects_registered_for.subject", "name subjectCode") // Populate subject details
      .populate("subjects_registered_for.attendance.class", "date time"); // Populate class details

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define the route to get details of all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();

    if (!students) {
      return res.status(404).send("Teachers info not found");
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define the route to get details of all subjects
app.get("/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find().populate("teacher", "name");

    if (!subjects) {
      return res.status(404).send("Teachers info not found");
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch admin details by ID
app.get("/admin/:id", async (req, res) => {
  try {
    const adminId = req.params.id;

    // Find the student by ID
    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to get details of a specific class by ID
app.get("/class/:id", async (req, res) => {
  try {
    // Extract the class ID from the request parameters
    const classId = req.params.id;

    // Find the class by its ID and populate the subject, teacher, and attendance details
    const foundClass = await Class.findById(classId)
      .populate("subject")
      .populate("teacher")
      .populate({
        path: "attendance.student",
        model: "Student",
      })
      .exec();

    if (!foundClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Return the details of the class
    res.status(200).json(foundClass);
  } catch (error) {
    console.error("Error retrieving class details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define the route to get classes data based on teacher's ID
app.get("/classes/:teacherId", async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // Find classes where the teacher's ID matches
    const classes = await Class.find({ teacher: teacherId })
      .populate("subject")
      .populate("attendance.student");

    // If no classes found for the teacher, return an empty array
    if (!classes || classes.length === 0) {
      return res.status(200).json([]);
    }

    // Return the classes data
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to mark attendance for a specific student in a class
app.post("/mark-attendance", async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    // Find the class based on the provided classId
    const foundClass = await Class.findById(classId);

    if (!foundClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Check if the student is registered for this class
    const studentAttendance = foundClass.attendance.find((entry) =>
      entry.student.equals(studentId)
    );
    if (!studentAttendance) {
      return res
        .status(400)
        .json({ error: "Student is not registered for this class" });
    }

    // Mark attendance for the student
    studentAttendance.status = "present";
    await foundClass.save();

    // Update attendance status in the student's record
    const student = await Student.findById(studentId);
    console.log(student);

    // Find the subject index in the subjects_registered_for array
    const subjectIndex = student.subjects_registered_for.findIndex((entry) =>
      entry.subject.equals(foundClass.subject)
    );
    console.log(subjectIndex);

    // Find the class index in the attendance array for the specific subject
    const classIndex = student.subjects_registered_for[
      subjectIndex
    ].attendance.findIndex((entry) => entry.class.equals(classId));
    console.log(classIndex);

    // Update the attendance status for the specific class
    student.subjects_registered_for[subjectIndex].attendance[
      classIndex
    ].status = "present";
    await student.save();

    return res.status(200).json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/user", validateToken, async (req, res) => {
  var token = req.cookies.soks;
  // var token = req.params.cookie;

  if (!token) {
    return res
      .status(400)
      .send("You cannot perform any activities until you are logged In");
  }

  verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    } else {
      req.decoded = decoded;

      try {
        // const user = await User.findById(req.decoded.id).select("-password");
        const user = await User.findOne({ email: req.decoded.email }).select(
          "-password"
        );

        if (user) {
          return res.send(user);
        } else {
          return res.status(403).send("Unable to fetch your reques data");
        }
      } catch (err) {
        return res.status(403).send("Unable to fetch your requested data");
      }
    }
  });
});

// Endpoint to logut

// app.get("/logout", (req, res, next) => {
//   if (req.cookies.soks) {
//     res.clearCookie("soks");
//     res
//       .status(202)
//       .json({ auth: false, loggedIn: false, cookie: "No cookies" });
//     res.end();
//   } else {
//     res.clearCookie("soks");
//     res
//       .status(202)
//       .json({ auth: false, loggedIn: false, cookie: "You are not logged in" });
//   }
//   next();
// });

app.get("/logout", (req, res, next) => {
  console.log("logging out");
  return res.send("Logged Out");
});

mongoose
  .connect(db, connectionparams)
  .then(() => {
    console.log("database connected successfullly");
  })
  .catch((error) => {
    console.error("error", error);
  });

http.listen(port, () => {
  console.log("Server connected");
});
