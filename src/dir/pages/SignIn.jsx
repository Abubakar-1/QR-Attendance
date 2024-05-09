import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserProvider";
import { Button, Card, Input } from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const SignIn = () => {
  axios.defaults.withCredentials = true;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      axios
        .post("http://localhost:5006/login", {
          email,
          password,
        })
        .then(async (result) => {
          console.log(result);
          const userData = result.data.user;
          userData.role === "admin" && navigate(`/admin/${userData._id}`);
          userData.role === "teacher" && navigate(`/teacher/${userData._id}`);
          userData.role === "student" && navigate(`/student/${userData._id}`);
        })
        .catch((error) => {
          toast.error(error.response.data);
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      setLoggedIn(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="h-[100vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl text-center text-blue-600">
          Login | QR Attendance System
        </h2>
        <Card className="mt-6 w-96 p-10">
          <form onSubmit={handleLogin} className="grid place-items-center">
            <div className="flex w-72 flex-col gap-6">
              <Input
                type="email"
                color="blue"
                label="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                color="blue"
                label="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" color="blue">
                Login
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};
