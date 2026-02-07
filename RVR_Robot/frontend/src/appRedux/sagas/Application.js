import { call, put, takeEvery, fork, cancel, delay } from "redux-saga/effects";
import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_START_SUCCESS,
  APP_PICKPLACE_START_FAILURE,
  APP_PICKPLACE_STOP,
  APP_PICKPLACE_STOP_SUCCESS,
  APP_PICKPLACE_STOP_FAILURE,
  APP_PICKPLACE_STATUS_SUCCESS,
  APP_PICKPLACE_STATUS_FAILURE,
} from "../../constants/ActionType";

import { APPLICATION_SERVICE } from "../../services/ApplicationServices";

let statusTask = null;

/* -------------------- STATUS POLLING -------------------- */
function* autoPickStatusAsync() {
  try {
    while (true) {
      const res = yield call(APPLICATION_SERVICE.STATUS);
      yield put({
        type: APP_PICKPLACE_STATUS_SUCCESS,
        payload: res.data,
      });
      yield delay(1000);
    }
  } catch (err) {
    yield put({
      type: APP_PICKPLACE_STATUS_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* -------------------- START -------------------- */
function* startAutoPickAsync() {
  try {
    const res = yield call(APPLICATION_SERVICE.START);

    yield put({
      type: APP_PICKPLACE_START_SUCCESS,
      payload: res.data,
    });
    if (!statusTask) {
      statusTask = yield fork(autoPickStatusAsync);
    }
  } catch (err) {
    yield put({
      type: APP_PICKPLACE_START_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* -------------------- STOP -------------------- */
function* stopAutoPickAsync() {
  try {
    const res = yield call(APPLICATION_SERVICE.STOP);

    yield put({
      type: APP_PICKPLACE_STOP_SUCCESS,
      payload: res.data,
    });

    // 🛑 stop status polling
    if (statusTask) {
      yield cancel(statusTask);
      statusTask = null;
    }
  } catch (err) {
    yield put({
      type: APP_PICKPLACE_STOP_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* -------------------- WATCHER -------------------- */
export function* AppPickandPlace() {
  yield takeEvery(APP_PICKPLACE_START, startAutoPickAsync);
  yield takeEvery(APP_PICKPLACE_STOP, stopAutoPickAsync);
}
