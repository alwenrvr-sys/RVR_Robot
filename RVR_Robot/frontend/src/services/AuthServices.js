import axios from "axios";
import { APICONFIG } from "../config/ApiConfig";

const HOST = APICONFIG.HOST;
const AUTH_API = APICONFIG.AUTH;

const getUser = async () => {
  try {
    const response = await axios.get(
      HOST + AUTH_API.GETUSER,
      {
        withCredentials: true, //  correct place
      }
    );

    // console.log("API CALLED ", response);
    return response;
  } catch (error) {
    // console.error("API FAILED ", error);
    throw error;
  }
};


  export const AUTH_SERVICE = {
  GETUSER: getUser

};