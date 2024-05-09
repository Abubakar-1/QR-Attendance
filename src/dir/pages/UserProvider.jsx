import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  axios.defaults.withCredentials = true;
  const [user, setUser] = useState();

  const fetchUser = async () => {
    try {
      await axios.get(`http://localhost:5006/user`).then((result) => {
        setUser(result?.data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <>
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
    </>
  );
};

export { UserContext };
