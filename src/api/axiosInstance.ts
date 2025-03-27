import axios from "axios";

const postTicket = (data: any) => {
  return axios
    .post(
      "https://rznmm0jo8f.execute-api.eu-west-3.amazonaws.com/dev/resource",
      data
    )
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
