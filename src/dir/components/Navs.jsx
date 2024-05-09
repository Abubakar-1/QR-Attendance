import { Typography } from "@material-tailwind/react";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";

export const Navs = () => {
  return <div>Navs</div>;
};

function StudentNavList() {
  const navigate = useNavigate();
  const logOut = async () => {
    try {
      await axios.get("http://localhost:5006/logout").then((result) => {
        console.log(result);
        navigate("/");
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <a
          href="#courses"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Courses
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <a
          href="#attendance"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Attendance
        </a>
      </Typography>

      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
        onClick={logOut}
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Sign Out
        </a>
      </Typography>
    </ul>
  );
}

function AdminNavList() {
  const navigate = useNavigate();
  const logOut = async () => {
    try {
      await axios.get("http://localhost:5006/logout").then((result) => {
        console.log(result);
        navigate("/");
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Courses
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Teachers
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Students
        </a>
      </Typography>

      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
        onClick={logOut}
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Sign Out
        </a>
      </Typography>
    </ul>
  );
}

function TeacherNavList() {
  const navigate = useNavigate();
  const logOut = async () => {
    try {
      await axios.get("http://localhost:5006/logout").then((result) => {
        console.log(result);
        navigate("/");
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Courses
        </a>
      </Typography>

      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-medium"
        onClick={logOut}
      >
        <a
          href="#"
          className="flex items-center hover:text-blue-500 transition-colors"
        >
          Sign Out
        </a>
      </Typography>
    </ul>
  );
}

export { StudentNavList, AdminNavList, TeacherNavList };
