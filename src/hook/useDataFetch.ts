import { useMutation, useQuery } from "react-query";
import axiosInstance from "../api/axiosInstance";

const fetchData = async () => {
  const response = await axiosInstance.get("/");
  return response.data;
};
const submitData = async (data: any) => {
  const response = await axiosInstance.post("/submit", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const useDataSubmit = () => {
  return useMutation(submitData);
};

export const useDataFetch = () => {
  return useQuery("data", fetchData);
};
