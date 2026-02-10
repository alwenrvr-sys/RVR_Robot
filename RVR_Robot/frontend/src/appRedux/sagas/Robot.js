import { call, put, takeEvery } from "redux-saga/effects";
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
  ROBOT_PICK_UNPICK_SUCCESS,
  ROBOT_PICK_UNPICK_FAILURE,
} from "../../constants/ActionType";
import { showNotification } from "../actions/Notify";
import { ROBOT_SERVICE } from "../../services/RobotServices";

const formatPose = (pose) => {
  const [x, y, z, rz] = pose;
  return `X=${x.toFixed(1)} Y=${y.toFixed(1)} Z=${z.toFixed(1)} RZ=${rz.toFixed(1)}`;
};

function* getTcpAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.GET_TCP);
    yield put({
      type: GET_TCP_SUCCESS,
      payload: response.data,
    });
    yield put(showNotification("robot", "Robot Current Pose Fetched"));
  } catch (error) {
    yield put({
      type: GET_TCP_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
}

export function* getTcp() {
  yield takeEvery(GET_TCP, getTcpAsync);
}

function* getRobotPingAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.PING);

    yield put({
      type: GET_ROBOT_PING_SUCCESS,
      payload: response.data.connected,
    });
    yield put(showNotification("robot", "Robot Connected"));
  } catch (error) {
    yield put({
      type: GET_ROBOT_PING_FAILURE,
      payload: error.message,
    });
  }
}

export function* getRobotPing() {
  yield takeEvery(GET_ROBOT_PING, getRobotPingAsync);
}

function* setAutoModeAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.SET_AUTO_MODE);
    yield put({
      type: ROBOT_MODE_SUCCESS,
      payload: response.data.value, // 0
    });
  } catch (error) {
    yield put({
      type: ROBOT_MODE_FAILURE,
      payload: error.message,
    });
  }
}

function* setManualModeAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.SET_MANUAL_MODE);
    const value = response.data.value;
    yield put({
      type: ROBOT_MODE_SUCCESS,
      payload: value, // 1
    });
  } catch (error) {
    yield put({
      type: ROBOT_MODE_FAILURE,
      payload: error.message,
    });
  }
}

export function* robotMode() {
  yield takeEvery(ROBOT_MODE_AUTO, setAutoModeAsync);
  yield takeEvery(ROBOT_MODE_MANUAL, setManualModeAsync);
}

function* enableRobotAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.ENABLE);
    yield put({
      type: ROBOT_ENABLE_SUCCESS,
      payload: response.data.value, // 1
    });
    yield put(showNotification("robot", "Robot Enabled :)"));
  } catch (error) {
    yield put({
      type: ROBOT_ENABLE_FAILURE,
      payload: error.message,
    });
  }
}

function* disableRobotAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.DISABLE);
    yield put({
      type: ROBOT_ENABLE_SUCCESS,
      payload: response.data.value, // 0
    });
    yield put(showNotification("robot", "Robot Disabled :("));
  } catch (error) {
    yield put({
      type: ROBOT_ENABLE_FAILURE,
      payload: error.message,
    });
  }
}

export function* robotEnable() {
  yield takeEvery(ROBOT_ENABLE, enableRobotAsync);
  yield takeEvery(ROBOT_DISABLE, disableRobotAsync);
}

function* stopRobotAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.STOP);
    yield put({
      type: ROBOT_SAFETY_SUCCESS,
      payload: response.data.action, // "STOP"
    });
    yield put(showNotification("robot", "Robot Movement Stoped"));
  } catch (error) {
    yield put({
      type: ROBOT_SAFETY_FAILURE,
      payload: error.message,
    });
  }
}

function* resetErrorsAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.RESET);
    yield put({
      type: ROBOT_SAFETY_SUCCESS,
      payload: response.data.action, // "ERRORS RESET"
    });
    yield put(showNotification("robot", "Robot Errors Cleared"));
  } catch (error) {
    yield put({
      type: ROBOT_SAFETY_FAILURE,
      payload: error.message,
    });
  }
}

export function* robotSafety() {
  yield takeEvery(ROBOT_STOP, stopRobotAsync);
  yield takeEvery(ROBOT_RESET, resetErrorsAsync);
}

function* moveLAsync(action) {
  try {
    const { pose } = action.payload;
    if (!Array.isArray(pose) || pose.length !== 6) {
      throw new Error("Pose must be [x,y,z,rx,ry,rz]");
    }
    const response = yield call(ROBOT_SERVICE.MOVE_L, pose);
    yield put({
      type: ROBOT_MOVEL_SUCCESS,
      payload: response.data,
    });
    yield put(
      showNotification("robot", `(MoveL) Moving to → ${formatPose(pose)}`),
    );
  } catch (error) {
    const message =
      error.response?.data?.detail || error.message || "MoveL failed";
    yield put({
      type: ROBOT_MOVEL_FAILURE,
      payload: message,
    });

    yield put(showNotification("robot", message));
  }
}

export function* robotMoveL() {
  yield takeEvery(ROBOT_MOVEL, moveLAsync);
}

function* pickUnpickAsync() {
  try {
    const response = yield call(ROBOT_SERVICE.PICK_UNPICK);

    yield put({
      type: ROBOT_PICK_UNPICK_SUCCESS,
      payload: response.data,
    });
    const value = response.data.current;
    if (value === 1) {
      yield put(showNotification("robot", "Object Picked"));
    } else {
      yield put(showNotification("robot", "Object Placed"));
    }
  } catch (error) {
    yield put({
      type: ROBOT_PICK_UNPICK_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
}

export function* pickUnpick() {
  yield takeEvery(ROBOT_PICK_UNPICK, pickUnpickAsync);
}
