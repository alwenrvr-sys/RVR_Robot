import axios from "axios";
import { APICONFIG } from "../config/ApiConfig";

const HOST = APICONFIG.HOST;
const APPLICATION_API = APICONFIG.APPLICATION;

const startAutoPick = () =>
  axios.post(
    HOST + APPLICATION_API.APP_PICKPLACE_START,
    {},
    { withCredentials: true },
  );

const stopAutoPick = () =>
  axios.post(
    HOST + APPLICATION_API.APP_PICKPLACE_STOP,
    {},
    { withCredentials: true },
  );

const getAutoPickStatus = () =>
  axios.get(HOST + APPLICATION_API.APP_PICKPLACE_STATUS, {
    withCredentials: true,
  });

const previewDXF = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(HOST + APPLICATION_API.PREVIEW, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const drawDXF = (params) =>
  axios.post(HOST + APPLICATION_API.DRAW, params, { withCredentials: true });

export const APPLICATION_SERVICE = {
  START: startAutoPick,
  STOP: stopAutoPick,
  STATUS: getAutoPickStatus,
  PREVIEW: previewDXF,
  DRAW: drawDXF,
};
