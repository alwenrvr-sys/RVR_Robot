import { call, put, takeEvery } from "redux-saga/effects";
import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_START_SUCCESS,
  APP_PICKPLACE_START_FAILURE,
  APP_PICKPLACE_STOP,
  APP_PICKPLACE_STOP_SUCCESS,
  APP_PICKPLACE_STOP_FAILURE,
} from "../../constants/ActionType";

import { APPLICATION_SERVICE } from "../../services/ApplicationServices";

function* startAutoPickAsync() {
  try {
    const res = yield call(APPLICATION_SERVICE.START);

    yield put({
      type: APP_PICKPLACE_START_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    yield put({
      type: APP_PICKPLACE_START_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

function* stopAutoPickAsync() {
  try {
    const res = yield call(APPLICATION_SERVICE.STOP);

    yield put({
      type: APP_PICKPLACE_STOP_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    yield put({
      type: APP_PICKPLACE_STOP_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

export function* AppPickandPlace() {
  yield takeEvery(APP_PICKPLACE_START, startAutoPickAsync);
  yield takeEvery(APP_PICKPLACE_STOP, stopAutoPickAsync);
}
