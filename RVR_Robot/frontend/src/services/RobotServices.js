import axios from "axios";
import { APICONFIG } from "../config/ApiConfig";

const HOST = APICONFIG.HOST;
const ROBOT_API = APICONFIG.ROBOT;

const getTcp = async () => {
  return axios.get(HOST + ROBOT_API.TCP, {
    withCredentials: true,
  });
};

const pingRobot = async () => {
  return axios.get(HOST + ROBOT_API.PING, {
    withCredentials: true,
  });
};

const setAutoMode = async () => {
  return axios.get(HOST + ROBOT_API.MODE_AUTO);
};

const setManualMode = async () => {
  return axios.get(HOST + ROBOT_API.MODE_MANUAL);
};

const enableRobot = async () => {
  return axios.get(HOST + ROBOT_API.ENABLE);
};

const disableRobot = async () => {
  return axios.get(HOST + ROBOT_API.DISABLE);
};

const stopRobot = async () => {
  return axios.get(HOST + ROBOT_API.STOP);
};

const resetErrors = async () => {
  return axios.get(HOST + ROBOT_API.RESET);
};

const moveL = async (data) => {
  return axios.post(HOST + ROBOT_API.MOVEL, data, {
    headers: { "Content-Type": "application/json" },
  });
};

const pickUnpick = async () => {
  return axios.get(HOST + ROBOT_API.PICK_UNPICK, { withCredentials: true });
};

export const ROBOT_SERVICE = {
  GET_TCP: getTcp,
  PING: pingRobot,
  SET_AUTO_MODE: setAutoMode,
  SET_MANUAL_MODE: setManualMode,
  ENABLE: enableRobot,
  DISABLE: disableRobot,
  STOP: stopRobot,
  RESET: resetErrors,
  MOVE_L: moveL,
  PICK_UNPICK: pickUnpick,
};
