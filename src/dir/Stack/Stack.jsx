import React from "react";
import { Route, Routes } from "react-router-dom";
import { Index } from "../pages/Index";
import { SignIn } from "../pages/SignIn";
import { Error } from "../pages/Error";
import { Admin } from "../pages/Admin";
import { TeacherHome } from "../pages/TeacherHome";
import { Student } from "../pages/Student";

export const Stack = () => {
  return (
    <>
      <Routes>
        <Route element={<Student />} path="/student/:id" />
        <Route element={<SignIn />} index />
        <Route element={<Admin />} path="/admin/:adminId" />
        <Route element={<TeacherHome />} path="/teacher/:id" />
        <Route element={<Error />} path="*" />
      </Routes>
    </>
  );
};
