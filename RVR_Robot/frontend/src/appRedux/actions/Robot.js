import {
  GET_TCP,
  GET_TCP_SUCCESS,
  GET_TCP_FAILURE,
  GET_ROBOT_PING,
  GET_ROBOT_PING_SUCCESS,
  GET_ROBOT_PING_FAILURE,
  ROBOT_MODE_AUTO,
  ROBOT_MODE_MANUAL,
  ROBOT_MODE_SUCCESS,
  ROBOT_MODE_FAILURE,
  ROBOT_ENABLE,
  ROBOT_DISABLE,
  ROBOT_ENABLE_SUCCESS,
  ROBOT_ENABLE_FAILURE,
  ROBOT_STOP,
  ROBOT_RESET,
  ROBOT_SAFETY_SUCCESS,
  ROBOT_SAFETY_FAILURE,
  ROBOT_MOVEL,
  ROBOT_MOVEL_SUCCESS,
  ROBOT_MOVEL_FAILURE,
  ROBOT_PICK_UNPICK,
} from "../../constants/ActionType";

export const getTcp = () => ({
  type: GET_TCP,
});

export const getTcpSuccess = (data) => ({
  type: GET_TCP_SUCCESS,
  payload: data,
});

export const getTcpFailure = (error) => ({
  type: GET_TCP_FAILURE,
  payload: error,
});

export const RobotPing = () => ({
  type: GET_ROBOT_PING,
});

export const RobotPingSuccess = (connected) => ({
  type: GET_ROBOT_PING_SUCCESS,
  payload: connected,
});

export const RobotPingFailure = (error) => ({
  type: GET_ROBOT_PING_FAILURE,
  payload: error,
});

export const setAutoMode = () => ({
  type: ROBOT_MODE_AUTO,
});

export const setManualMode = () => ({
  type: ROBOT_MODE_MANUAL,
});

export const robotModeSuccess = (mode) => ({
  type: ROBOT_MODE_SUCCESS,
  payload: mode, // 0 or 1
});

export const robotModeFailure = (error) => ({
  type: ROBOT_MODE_FAILURE,
  payload: error,
});

export const enableRobot = () => ({
  type: ROBOT_ENABLE,
});

export const disableRobot = () => ({
  type: ROBOT_DISABLE,
});

export const robotEnableSuccess = (value) => ({
  type: ROBOT_ENABLE_SUCCESS,
  payload: value, // 1 or 0
});

export const robotEnableFailure = (error) => ({
  type: ROBOT_ENABLE_FAILURE,
  payload: error,
});

export const stopRobot = () => ({
  type: ROBOT_STOP,
});

export const resetRobotErrors = () => ({
  type: ROBOT_RESET,
});

export const robotSafetySuccess = (action) => ({
  type: ROBOT_SAFETY_SUCCESS,
  payload: action, // "STOP" | "ERRORS RESET"
});

export const robotSafetyFailure = (error) => ({
  type: ROBOT_SAFETY_FAILURE,
  payload: error,
});

export const moveL = (data) => ({
  type: ROBOT_MOVEL,
  payload: data,
});

export const moveLSuccess = (data) => ({
  type: ROBOT_MOVEL_SUCCESS,
  payload: data,
});

export const moveLFailure = (error) => ({
  type: ROBOT_MOVEL_FAILURE,
  payload: error,
});

export const pickUnpick = () => ({
  type: ROBOT_PICK_UNPICK,
});
