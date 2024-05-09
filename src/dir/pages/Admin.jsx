import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Input,
  Dialog,
  CardBody,
  CardFooter,
  Select,
  Option,
} from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Admin = () => {
  axios.defaults.withCredentials = true;
  const { adminId } = useParams();
  const [adminDetails, setAdminDetails] = useState({});
  const { email, name, _id } = adminDetails || {};
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [subjectDetails, setSubjectDetails] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [teacherDetails, setTeacherDetails] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [open, setOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const handleOpen = () => setOpen((cur) => !cur);
  const handleSubjectOpen = () => setSubjectOpen((cur) => !cur);

  const TABLE_HEAD = ["S/N", "Name", "Email", "Subjects Registered For"];
  const SUBJECT_TABLE_HEAD = ["S/N", "Name", "Teacher"];

  const fetchAdminDetails = async () => {
    try {
      await axios
        .get(`http://localhost:5006/admin/${adminId}`)
        .then((result) => {
          console.log(result);
          const details = result.data;
          setAdminDetails(details);
        })
        .catch((error) => {
          console.log(error);
          setAdminDetails(null);
        });
    } catch (error) {
      console.log(error.response);
    }
  };

  const fetchTeacherDetails = async () => {
    try {
      await axios
        .get("http://localhost:5006/teachers")
        .then((result) => {
          console.log("teachers", result);
          const finalData = result.data;
          setTeacherDetails(finalData);
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
      await axios
        .get("http://localhost:5006/students")
        .then((result) => {
          console.log("students", result);
          const finalData = result.data;
          setStudentDetails(finalData);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  };

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

  const createUsers = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post("http://localhost:5006/register", {
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
        })
        .then((result) => {
          console.log(result);
          setOpen(false);
          toast.success("User Created Successfully");
        })
        .catch((error) => {
          console.log(error);
          setOpen(false);
          toast.error(error.response.data);
        });
    } catch (error) {
      toast.error(error.response);
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post("http://localhost:5006/create-subject", {
          name: subjectName,
          teacherId: teacherId,
        })
        .then((result) => {
          console.log(result);
          setSubjectOpen(false);
          toast.success("Subject created succesfully");
        })
        .catch((error) => {
          toast.error(error.response.data.error);
          console.log(error);
          setSubjectOpen(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
    fetchTeacherDetails();
    fetchStudentDetails();
    fetchSubjects();
  }, []);
  return (
    <>
      {adminDetails ? (
        <div>
          <ToastContainer position="top-center" />

          <div className="sm:flex justify-between px-16 mt-10 text-2xl capitalize text-balance">
            <Typography color="blue" variant="h2">
              Welcome, {name}
            </Typography>
            <div className="flex">
              <Button onClick={handleOpen} color="blue" className="m-3">
                Create a User
              </Button>
              <Button onClick={handleSubjectOpen} color="blue" className="m-3">
                Create Subject
              </Button>
            </div>
          </div>

          <div className="px-10 py-5 text-2xl">
            <Card className="h-full w-full overflow-scroll mt-10">
              <h2 className="">List of Students</h2>
              <table
                className="w-full min-w-max table-auto text-left"
                id="#teachers"
              >
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
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
                  {studentDetails?.map(
                    ({ name, email, subjects_registered_for }, index) => (
                      <tr key={name} className="even:bg-blue-gray-50/50">
                        <td className="p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {index + 1}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {email}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {subjects_registered_for.length}
                          </Typography>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </Card>

            <Card className="h-full w-full overflow-scroll mt-10">
              <h2 className="">List of Subjects</h2>
              <table
                className="w-full min-w-max table-auto text-left"
                id="#teachers"
              >
                <thead>
                  <tr>
                    {SUBJECT_TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
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
                  {subjectDetails?.map(({ name, teacher }, index) => (
                    <tr key={name} className="even:bg-blue-gray-50/50">
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {index + 1}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {name}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {teacher.name}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
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
                  Create User
                </Typography>
                <Typography
                  className="mb-3 font-normal"
                  variant="paragraph"
                  color="gray"
                >
                  Create a new User
                </Typography>
                <Typography className="-mb-2" variant="h6">
                  Name
                </Typography>
                <Input
                  color="blue"
                  label="Name"
                  size="lg"
                  onChange={(e) => setUserName(e.target.value)}
                />
                <Typography className="-mb-2" variant="h6">
                  Email
                </Typography>
                <Input
                  color="blue"
                  label="Email"
                  size="lg"
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <Typography className="-mb-2" variant="h6">
                  Role
                </Typography>
                <Select
                  label="Role"
                  value={userRole}
                  onChange={(e) => setUserRole(e)}
                  color="blue"
                >
                  <Option value="teacher">Teacher</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="student">Student</Option>
                </Select>
                <Typography className="-mb-2" variant="h6">
                  Password
                </Typography>
                <Input
                  color="blue"
                  label="Password"
                  size="lg"
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </CardBody>
              <CardFooter className="pt-0">
                <Button
                  variant="gradient"
                  fullWidth
                  color="blue"
                  type="submit"
                  onClick={createUsers}
                >
                  Sign In
                </Button>
              </CardFooter>
            </Card>
          </Dialog>

          <Dialog
            size="xs"
            open={subjectOpen}
            handler={handleSubjectOpen}
            className="bg-transparent shadow-none"
          >
            <ToastContainer position="top-center" />
            <Card className="h-full w-full mt-14 flex items-center justify-center shadow-lg p-5">
              <Typography variant="h4" color="blue-gray">
                Create Subject
              </Typography>

              <form className=" mb-2 w-full">
                <div className="flex items-center justify-center">
                  <div className="mb-1 flex flex-col gap-3 w-full">
                    <Typography className="-mb-2" variant="h6">
                      Subject
                    </Typography>
                    <Input
                      color="blue"
                      label="Name"
                      size="lg"
                      onChange={(e) => setSubjectName(e.target.value)}
                    />
                    <Typography className="-mb-2" variant="h6">
                      Teacher
                    </Typography>
                    <Select
                      label="Teacher"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e)}
                      color="blue"
                    >
                      {teacherDetails?.map((teacher, key) => (
                        <Option value={teacher._id} key={key}>
                          {teacher.name}
                        </Option>
                      ))}
                    </Select>

                    <CardFooter className="pt-0">
                      <Button
                        variant="gradient"
                        fullWidth
                        color="blue"
                        type="submit"
                        onClick={createSubject}
                      >
                        Create
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </form>
            </Card>
          </Dialog>
        </div>
      ) : (
        <div>Admin Not found</div>
      )}
    </>
  );
};
