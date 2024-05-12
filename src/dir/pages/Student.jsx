import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
  Card,
  Button,
  Select,
  Option,
  CardFooter,
  CardBody,
  Dialog,
  CardHeader,
  Chip,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { CameraIcon } from "../components/Icons";
import Scanner from "../components/QrScanner";
import { StudentNavList } from "../components/Navs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Student = () => {
  axios.defaults.withCredentials = true;
  const { id } = useParams();
  const [studentDetails, setStudentdetails] = useState();
  const { name, _id } = studentDetails || {};
  const [openNav, setOpenNav] = useState(false);
  const [cameraClicked, setCameraClicked] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [open, setOpen] = useState(false);
  const [subjectDetails, setSubjectDetails] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const nileUniversityLatitude = 9.018276910896537;
  const nileUniversityLongitude = 7.4016056846574445;

  const handleOpen = () => setOpen((cur) => !cur);

  const fetchSubjects = async () => {
    try {
      await axios
        .get("http://localhost:5006/subjects")
        .then((result) => {
          console.log("subjects", result);
          const finalData = result.data;
          setSubjectDetails(finalData);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentDetails = async () => {
    try {
      await axios.get(`http://localhost:5006/student/${id}`).then((result) => {
        const studentDetail = result.data;
        const registeredsubjects = studentDetail.subjects_registered_for;
        const listOfSubjects = registeredsubjects.map(
          (sub) => sub.subject.name
        );
        setStudentSubjects(listOfSubjects);
        setStudentdetails(studentDetail);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleWindowResize = () =>
    window.innerWidth >= 960 && setOpenNav(false);
  useEffect(() => {
    fetchStudentDetails();
    fetchSubjects();

    return () => {};
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const handleScanAgain = () => {
    setScannedCode(null);
    setCameraClicked(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(`http://localhost:5006/${id}/register`, {
          subjectId: subjectName,
        })
        .then((result) => {
          console.log(result);
          setOpen(false);
          toast.success("Registered Successfully");
        })
        .catch((error) => {
          console.log(error.response.data.error);
          setOpen(false);
          toast.error(error.response.data.error);
        });
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.error);
    }
  };

  const TABLE_HEAD = [
    "S/N",
    "Time",
    "Date",
    "Status",
    "Lecture",
    "Course",
    "Course Code",
  ];

  const classes = "p-4 border-b border-blue-gray-50";
  const [attendanceRows, setAttendanceRows] = useState([]);

  const getAttendance = () => {
    if (studentDetails && studentDetails.subjects_registered_for) {
      const rows = studentDetails.subjects_registered_for.reduce(
        (acc, curr) => {
          return acc.concat(
            curr.attendance.map((entry, index) => ({
              sn: acc.length + index + 1,
              time: entry.class.time,
              date: new Date(entry.class.date).toLocaleDateString(),
              status: entry.status,
              class: entry.class._id, // Assuming class name is available
              subject: curr.subject.name,
              subejctCode: curr.subject.subjectCode || "null",
            }))
          );
        },
        []
      );
      setAttendanceRows(rows);
    }
  };

  const isQrCodeExpired = (qrData) => {
    console.log("checking expiration");
    const currentTime = new Date();
    const currentTimeISO = currentTime.toISOString();

    console.log(currentTimeISO);
    console.log(qrData.expirationTime);
    console.log(currentTime > qrData.expirationTime);
    return currentTimeISO > qrData.expirationTime;
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        const scannedData = JSON.parse(data);
        console.log("scannedData", scannedData);
        if (!properLocation()) {
          toast.error(
            "You are not within Nile premises. Attendance Cannot be marked"
          );
          return;
        }
        if (isQrCodeExpired(scannedData)) {
          console.log("QR code has expired");
          toast.error("QR code has expired");
          return;
        }
        console.log("test");
        setScannedCode(scannedData.classId);
        setCameraClicked(false);

        try {
          console.log(scannedData.classId, "sss");
          const response = await axios.post(
            "http://localhost:5006/mark-attendance",
            {
              classId: scannedData.classId,
              studentId: _id,
            }
          );
          console.log(response);
        } catch (error) {
          console.log("Error marking attendance", error);
          toast.error("Error marking attendance");
        }
      } catch (error) {
        console.log("Error parsing scanned data as JSON:", error);
        toast.error("Error scanning QR code");
      }
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Error getting user location");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance;
  }

  useEffect(() => {
    getLocation();
  }, []);

  function properLocation() {
    const distanceToNileUniversity = calculateDistance(
      latitude,
      longitude,
      nileUniversityLatitude,
      nileUniversityLongitude
    );

    const thresholdDistance = 531.72;

    if (distanceToNileUniversity <= thresholdDistance) {
      console.log(
        "Student is within Nile University's premises. Attendance can be marked."
      );
      return true;
    } else {
      console.log(
        "Student is outside Nile University's premises. Attendance cannot be marked."
      );
      return false;
    }
  }

  useEffect(() => {
    getAttendance();
  }, [studentDetails]);

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
            <StudentNavList />
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
          <StudentNavList />
        </Collapse>
      </Navbar>

      <div className="p-10 text-2xl text-center flex items-center justify-center flex-col">
        <h2>Welcome, {name}</h2>
        <Button onClick={handleOpen} color="blue" className="m-3">
          Register for Course
        </Button>
        <Card className="sm:w-[25%] m-10 p-10 flex items-center justify-center">
          <IconButton
            className="m-5"
            onClick={() => setCameraClicked((prev) => !prev)}
          >
            <CameraIcon />
          </IconButton>
          <div className="">Open Camera to mark Attendance</div>
        </Card>

        {scannedCode && (
          <div>
            <p>Scanned Code: {scannedCode}</p>
            <button onClick={handleScanAgain}>Scan Again</button>
          </div>
        )}

        {cameraClicked && (
          <div>
            <Scanner onScan={handleScan} />
            <button onClick={() => setCameraClicked(false)}>
              Close Camera
            </button>
          </div>
        )}
      </div>

      <div className="p-5" id="courses">
        <Typography color="blue" variant="h5">
          List of Courses Registered for
        </Typography>
        <ul>
          {studentSubjects.map((subject, key) => (
            <div key={key}>
              <Typography>{subject}</Typography>
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
              Register for a Course
            </Typography>

            <Typography className="-mb-2" variant="h6">
              Course Name
            </Typography>
            <Select
              label="Subject"
              color="blue"
              value={subjectName}
              onChange={(e) => setSubjectName(e)}
            >
              {subjectDetails?.map((subject, key) => (
                <Option value={subject._id} key={key}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </CardBody>
          <CardFooter className="pt-0">
            <Button
              variant="gradient"
              fullWidth
              color="blue"
              type="submit"
              onClick={handleRegister}
            >
              Register
            </Button>
          </CardFooter>
        </Card>
      </Dialog>

      <Card className="h-full w-full" id="attendance">
        <CardHeader floated={false} shadow={false} className="rounded-none">
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="blue-gray">
                Student Attendance
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                Attendance details for the student
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll px-0">
          <table className="w-full min-w-max table-auto text-left">
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
              {attendanceRows.map((row) => (
                <tr key={row.sn}>
                  <td className={classes}>{row.sn}</td>
                  <td className={classes}>{row.time}</td>
                  <td className={classes}>{row.date}</td>
                  <td className={classes}>
                    <div className="w-max">
                      <Chip
                        size="sm"
                        variant="ghost"
                        value={row.status}
                        color={
                          row.status === "present"
                            ? "green"
                            : row.status === "absent"
                            ? "red"
                            : "amber"
                        }
                      />
                    </div>
                  </td>
                  <td className={classes}>{row.class}</td>
                  <td className={classes}>{row.subject}</td>
                  <td className={classes}>{row.subejctCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
};
