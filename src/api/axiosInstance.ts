import axios from "axios";

// axios.get("http://localhost:3000/").then(function (response) {
//   console.log(response);
// });
// const axiosInstance = axios.create({
//   baseURL: "https://x3vds4f7fi.execute-api.eu-west-1.amazonaws.com/dev/",
// });

const postTicket = (data: any) => {
  return axios
    .post(" http://localhost:3000/submit", data)
    .then((response) => {
      console.log("Réponse:", response);
      return response;
    })
    .catch((error) => {
      console.error("Erreur API:", error);
      throw error;
    });
};

export default postTicket;
//"https://x3vds4f7fi.execute-api.eu-west-1.amazonaws.com/dev/submit"
