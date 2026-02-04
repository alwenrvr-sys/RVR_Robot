import { call, put, takeEvery, delay } from "redux-saga/effects";
import {
  GET_USER,
  GET_USER_SUCCESS,
  GET_USER_ERROR,
} from "../../constants/ActionType";

import { AUTH_SERVICE } from "../../services/AuthServices";
import { APPCONFIG } from "../../config/AppConfig";
// import {
//   prepareSuccessMessage,
//   prepareErrorMessage,
//   resetMessage,
// } from "../actions/Common";

// --- SIGN IN ---
// function* signInUserAsync({ payload }) {
//   try {
//     const response = yield call(AUTH_SERVICE.LOGIN, payload);
//     const { status, data } = response.data;

//     if (status === APPCONFIG.API_STATUS.SUCCESS) {
//       yield put({ type: GET_USER_SUCCESS, payload: data });
//       yield put(prepareSuccessMessage(SET_USER_MESSAGE, "Login successful"));
//     } else {
//       yield put({ type: GET_USER_ERROR, payload: data });
//       yield put(prepareErrorMessage(SET_USER_MESSAGE, data?.error || "Login failed"));
//     }
//   } catch (error) {
//     const errMsg = error.response?.data?.error || "Something went wrong";
//     yield put({ type: GET_USER_ERROR, payload: { error: errMsg } });
//     yield put(prepareErrorMessage(SET_USER_MESSAGE, errMsg));
//   }

//   yield delay(5000);
//   yield put(resetMessage(RESET_USER));
// }

// export function* signInUser() {
//   yield takeEvery(GET_USER, signInUserAsync);
// }



function* getUserAsync() {
  console.log("Saga triggered ✅");

  try {
    const response = yield call(AUTH_SERVICE.GETUSER);
    console.log("Saga response ✅", response);

    const { status, data } = response.data;

    if (status === APPCONFIG.API_STATUS.SUCCESS) {
      yield put({ type: GET_USER_SUCCESS, payload: data });
    } else {
      yield put({ type: GET_USER_ERROR, payload: data });
    }
  } catch (error) {
    console.error("Saga error ❌", error);
    yield put({
      type: GET_USER_ERROR,
      payload: { error: "Something went wrong" },
    });
  }
}


export function* getUser() {
  yield takeEvery(GET_USER, getUserAsync);
}