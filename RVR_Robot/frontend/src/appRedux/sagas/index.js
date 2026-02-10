import { all, fork } from "redux-saga/effects";
import { getUser } from "./Auth";
import {
  triggerCamera,
  analyzeImage,
  runAutosetup,
  getCameraPing,
} from "./Camera";
import {
  getRobotPing,
  getTcp,
  robotMode,
  robotEnable,
  robotSafety,
  robotMotionParams,
  robotMoveL,
  pickUnpick,
} from "./Robot";
import { AppPickandPlace, AppPickandSort,DXF } from "./Application";
export default function* rootSaga() {
  yield all([
    fork(getUser),
    fork(getCameraPing),
    fork(triggerCamera),
    fork(runAutosetup),
    fork(getTcp),
    fork(getRobotPing),
    fork(robotMode),
    fork(robotEnable),
    fork(robotSafety),
    fork(robotMoveL),
    fork(analyzeImage),
    fork(pickUnpick),
    fork(AppPickandPlace),
    fork(DXF),
    fork(robotMotionParams),
    fork(AppPickandSort)
  ]);
}
