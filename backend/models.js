const mongoose = require("mongoose");

// Define schema for teachers collection
const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
});

// Define schema for subjects collection
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjectCode: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
});

// Define schema for classes collection
const classSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  attendance: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: { type: String, enum: ["present", "absent"] },
    },
  ],
});

// Define schema for students collection
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subjects_registered_for: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      attendance: [
        {
          class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
          status: { type: String, enum: ["present", "absent"] },
        },
      ],
    },
  ],
});

const updateRelatedDocuments = async function (doc) {
  //   console.log("Middleware called with doc:", doc);

  if (doc instanceof Subject) {
    // console.log("Document is a Subject:", doc);
    // Find the teacher document associated with the subject
    const teacher = await Teacher.findById(doc.teacher);
    // Add the subject's ID to the teacher's subjects array
    if (teacher) {
      //   console.log("Found associated teacher:", teacher);
      teacher.subjects.push(doc._id);
      await teacher.save();
      //   console.log("Teacher updated with new subject:", teacher);
    }
  }
};

// Register the middleware function to run after saving documents
subjectSchema.post("save", updateRelatedDocuments);

// Define models based on the schemas
const Teacher = mongoose.model("Teacher", teacherSchema);
const Subject = mongoose.model("Subject", subjectSchema);
const Class = mongoose.model("Class", classSchema);
const Student = mongoose.model("Student", studentSchema);

module.exports = { Teacher, Subject, Class, Student };
