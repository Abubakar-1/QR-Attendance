import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode.react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Collapse,
  Dialog,
  IconButton,
  Input,
  Navbar,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { TeacherNavList } from "../components/Navs";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { UserContext } from "./UserProvider";

export const TeacherHome = () => {
  axios.defaults.withCredentials = true;
  const { id } = useParams();
  const [teacherDetails, setTeacherDetails] = useState({});
  const { name, email, subjects } = teacherDetails || {};
  const [lessonSubject, setLessonSubject] = useState();
  const [lessonTime, setLessontime] = useState();
  const [lessonDate, setLessonDate] = useState();
  const [classes, setClasses] = useState([]);
  const [showQr, setShowQr] = useState(false);
  const [finalQrData, setfinalQrData] = useState();
  const [open, setOpen] = useState(false);
  const [openNav, setOpenNav] = useState(false);
  const [classAttendance, setClassAttendance] = useState([]);

  const { user } = useContext(UserContext);

  const TABLE_HEAD = ["Course", "Date", "Time", "Generate", "View Attendance"];
  const ATTENDANCE_TABLE_HEAD = [
    "Student Name",
    "Time",
    "Data",
    "Status",
    "Lecture",
    "Course",
    "Course Code",
  ];
  const tableClasses = "p-4 border-b border-blue-gray-50";

  const viewClasses = () => {
    try {
      axios.get(`http://localhost:5006/classes/${id}`).then((result) => {
        console.log(result);
        const classesData = result.data;
        setClasses(classesData);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createLesson = (e) => {
    e.preventDefault();
    console.log("cliced");
    try {
      axios
        .post("http://localhost:5006/create-class", {
          subjectId: lessonSubject,
          teacherId: id,
          date: lessonDate,
          time: lessonTime,
        })
        .then((result) => {
          toast.success("Lecture created successfully");
          viewClasses();
          console.log(result);
          setOpen(false);
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.error);
        });
    } catch (error) {
      alert("An error occured while trying to create lecture");
      console.error(error);
    }
  };

  const generateQrCode = (classId) => {
    console.log("generating");
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);
    const qrData = { classId, expirationTime };
    setfinalQrData(qrData);
    setShowQr(true);
    const strrr = JSON.stringify(qrData);
    const ppp = JSON.parse(strrr);
    console.log("strrr", strrr);
    console.log("PPP", ppp);
    // console.log(JSON.stringify(qrData), "qr");
  };

  const getSpecificClass = (classId) => {
    try {
      axios.get(`http://localhost:5006/class/${classId}`).then((result) => {
        console.log(result);
        const foundClass = result.data;
        const attendanceRows = foundClass.attendance.map((entry) => ({
          "Student Name": entry.student.name,
          Time: foundClass.time,
          Date: new Date(foundClass.date).toLocaleDateString(),
          Status: entry.status,
          Class: foundClass._id,
          Subject: foundClass.subject.name,
          SubjectCode: foundClass.subject.subjectCode || "null",
        }));
        setClassAttendance(attendanceRows);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpen = () => setOpen((cur) => !cur);

  const fetchTeacherDetails = async () => {
    try {
      await axios.get(`http://localhost:5006/teachers/${id}`).then((result) => {
        console.log(result);
        const teacherDetail = result.data;
        console.log(teacherDetail, "lecturer");
        setTeacherDetails(teacherDetail);
      });
    } catch (error) {
      console.log("er", error);
    }
  };

  console.log(teacherDetails, "lll");

  useEffect(() => {
    fetchTeacherDetails();
    viewClasses();

    return () => {
      fetchTeacherDetails();
      viewClasses();
    };
  }, []);

  return (
    <>
      <ToastContainer position="top-center" />
      <Navbar className="mx-auto max-w-screen-xl px-6 py-3">
        <div className="flex items-center justify-between text-blue-gray-900">
          <Typography
            as="a"
            href="#"
            variant="h6"
            className="mr-4 cursor-pointer py-1.5"
          >
            QR Attendance
          </Typography>
          <div className="hidden lg:block">
            <TeacherNavList />
          </div>
          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Bars3Icon className="h-6 w-6" strokeWidth={2} />
            )}
          </IconButton>
        </div>
        <Collapse open={openNav}>
          <TeacherNavList />
        </Collapse>
      </Navbar>
      <div className="p-10 text-2xl text-center flex items-center justify-center flex-col">
        <h2>Welcome, {name}</h2>
        <Button onClick={handleOpen} color="blue" className="m-3">
          Create a Lecture
        </Button>
      </div>
      <div className="p-5" id="courses">
        <Typography color="blue" variant="h5">
          List of Courses You Teach
        </Typography>
        <ul>
          {subjects?.map((subject, key) => (
            <div key={key}>
              <Typography>{subject.name}</Typography>
            </div>
          ))}
        </ul>
      </div>
      <Dialog
        size="xs"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[24rem]">
          <CardBody className="flex flex-col gap-4">
            <Typography variant="h4" color="blue-gray">
              Create a Lecture
            </Typography>

            <Typography className="-mb-2" variant="h6">
              Course Name
            </Typography>
            <Select
              label="Course"
              color="blue"
              value={lessonSubject}
              onChange={(e) => setLessonSubject(e)}
            >
              {subjects?.map((subject, key) => (
                <Option value={subject._id} key={key}>
                  {subject.name}
                </Option>
              ))}
            </Select>

            <Typography className="-mb-2" variant="h6">
              Lecture Date
            </Typography>
            <Input
              color="blue"
              label="Date"
              size="lg"
              type="date"
              onChange={(e) => setLessonDate(e.target.value)}
            />

            <Typography className="-mb-2" variant="h6">
              Lecture Time
            </Typography>
            <Input
              color="blue"
              label="Time"
              size="lg"
              type="time"
              onChange={(e) => setLessontime(e.target.value)}
            />
          </CardBody>
          <CardFooter className="pt-0">
            <Button
              variant="gradient"
              fullWidth
              color="blue"
              type="submit"
              onClick={createLesson}
            >
              Create Lecture
            </Button>
          </CardFooter>
        </Card>
      </Dialog>

      {/* <div className="flex items-center justify-center">
        <Button onClick={viewClasses} color="blue" className="m-3">
          View Classes
        </Button>
      </div> */}

      <CardBody className="overflow-scroll mx-0">
        <table className="w-full min-w-max table-auto text-center">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((eachClass, key) => (
              <tr key={key}>
                <td className={tableClasses}>{eachClass.subject.name}</td>
                <td className={tableClasses}>
                  {new Date(eachClass.date).toLocaleDateString()}
                </td>
                <td className={tableClasses}>{eachClass.time}</td>
                <td className={tableClasses}>
                  <Button
                    color="blue"
                    onClick={() => generateQrCode(eachClass._id)}
                  >
                    Generate QR
                  </Button>
                </td>
                <td className={tableClasses}>
                  <Button
                    color="blue"
                    onClick={() => getSpecificClass(eachClass._id)}
                  >
                    View Attendance
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>

      <CardBody className="overflow-scroll mx-0">
        <table className="w-full min-w-max table-auto text-center">
          <thead>
            <tr>
              {ATTENDANCE_TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classAttendance.map((row, key) => (
              <tr key={key}>
                <td className={tableClasses}>{row["Student Name"]}</td>
                <td className={tableClasses}>{row.Time}</td>
                <td className={tableClasses}>
                  {new Date(row.Date).toLocaleDateString()}
                </td>
                <td className={tableClasses}>
                  <div className="w-max">
                    <Chip
                      size="sm"
                      variant="ghost"
                      value={row.Status}
                      color={
                        row.Status === "present"
                          ? "green"
                          : row.Status === "absent"
                          ? "red"
                          : "amber"
                      }
                    />
                  </div>
                </td>
                <td className={tableClasses}>{row.Class}</td>
                <td className={tableClasses}>{row.Subject}</td>
                <td className={tableClasses}>{row.SubjectCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>

      <Dialog
        size="xs"
        open={showQr}
        handler={setShowQr}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[24rem]">
          <CardBody className="flex flex-col gap-4">
            <h2 className="text-center">
              QR Code for Lecture ID: {finalQrData?.classId}
            </h2>
            <div className="flex items-center justify-center">
              <QRCode value={JSON.stringify(finalQrData)} />
            </div>
          </CardBody>
        </Card>
      </Dialog>
    </>
  );
};
