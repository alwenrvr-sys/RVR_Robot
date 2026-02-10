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
  APP_PICKSORT_START,
  APP_PICKSORT_START_SUCCESS,
  APP_PICKSORT_START_FAILURE,
  APP_PICKSORT_STOP,
  APP_PICKSORT_STOP_SUCCESS,
  APP_PICKSORT_STOP_FAILURE,
  APP_PICKSORT_STATUS_SUCCESS,
  APP_PICKSORT_STATUS_FAILURE,
  DXF_PREVIEW,
  DXF_PREVIEW_SUCCESS,
  DXF_PREVIEW_FAILURE,
  DXF_DRAW,
  DXF_DRAW_SUCCESS,
  DXF_DRAW_FAILURE,
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

function* autoSortStatusAsync() {
  try {
    while (true) {
      const res = yield call(APPLICATION_SERVICE.STATUS_SORT);
      yield put({
        type: APP_PICKSORT_STATUS_SUCCESS,
        payload: res.data,
      });
      yield delay(1000);
    }
  } catch (err) {
    yield put({
      type: APP_PICKSORT_STATUS_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* -------------------- START -------------------- */
function* startAutoSortAsync() {
  try {
    const res = yield call(APPLICATION_SERVICE.START_SORT);

    yield put({
      type: APP_PICKSORT_START_SUCCESS,
      payload: res.data,
    });
    if (!statusTask) {
      statusTask = yield fork(autoSortStatusAsync);
    }
  } catch (err) {
    yield put({
      type: APP_PICKSORT_START_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* -------------------- STOP -------------------- */
function* stopAutoSortAsync() {
  try {
    const res = yield call(APPLICATION_SERVICE.STOP_SORT);

    yield put({
      type: APP_PICKSORT_STOP_SUCCESS,
      payload: res.data,
    });
    if (statusTask) {
      yield cancel(statusTask);
      statusTask = null;
    }
  } catch (err) {
    yield put({
      type: APP_PICKSORT_STOP_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* -------------------- WATCHER -------------------- */
export function* AppPickandSort() {
  yield takeEvery(APP_PICKSORT_START, startAutoSortAsync);
  yield takeEvery(APP_PICKSORT_STOP, stopAutoSortAsync);
}

function* previewDXFAsync(action) {
  try {
    const res = yield call(APPLICATION_SERVICE.PREVIEW, action.payload);

    yield put({
      type: DXF_PREVIEW_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    yield put({
      type: DXF_PREVIEW_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* ---------- DRAW ---------- */
function* drawDXFAsync(action) {
  try {
    const res = yield call(APPLICATION_SERVICE.DRAW, action.payload);

    yield put({
      type: DXF_DRAW_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    yield put({
      type: DXF_DRAW_FAILURE,
      payload: err.response?.data || err.message,
    });
  }
}

/* ---------- WATCHER ---------- */
export function* DXF() {
  yield takeEvery(DXF_PREVIEW, previewDXFAsync);
  yield takeEvery(DXF_DRAW, drawDXFAsync);
}
