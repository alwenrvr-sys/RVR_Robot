import { all, fork } from "redux-saga/effects";
import { getUser } from "./Auth";
import { triggerCamera,analyzeImage } from "./Camera";
import {
  getRobotPing,
  getTcp,
  robotMode,
  robotEnable,
  robotSafety,
  robotMoveL
} from "./Robot";
export default function* rootSaga() {
  yield all([
    fork(getUser),
    fork(triggerCamera),
    fork(getTcp),
    fork(getRobotPing),
    fork(robotMode),
    fork(robotEnable),
    fork(robotSafety),
    fork(robotMoveL),
    fork(analyzeImage)
  ]);
}
