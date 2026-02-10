import axios from "axios";
import { APICONFIG } from "../config/ApiConfig";

const HOST = APICONFIG.HOST;
const CAMERA_API = APICONFIG.CAMERA;

const pingCamera = async () => {
  return axios.get(HOST + CAMERA_API.PING, {
    withCredentials: true,
  });
};

const triggerCamera = async (currentZ) => {
  try {
    const response = await axios.post(
      HOST + CAMERA_API.TRIGGER,
      {
        current_z: currentZ,
      },
      {
        withCredentials: true,
      },
    );

    return response;
  } catch (error) {
    throw error;
  }
};

const analyzeImage = async (payload) => {
  return axios.post(HOST + CAMERA_API.ANALYZE, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });
};

const runAutosetup = () =>
  axios.post(
    HOST + CAMERA_API.AUTOSETUP,
    {},
    { withCredentials: true },
  );

export const CAMERA_SERVICE = {
  PING:pingCamera,
  CAMERA_TRIGGER: triggerCamera,
  ANALYZE: analyzeImage,
  AUTOSETUP:runAutosetup,
};
