import { all, fork } from "redux-saga/effects";
import { getUser } from "./Auth";
import { triggerCamera, analyzeImage, runAutosetup ,getCameraPing} from "./Camera";
import {
  getRobotPing,
  getTcp,
  robotMode,
  robotEnable,
  robotSafety,
  robotMoveL,
  pickUnpick,
} from "./Robot";
import { AppPickandPlace, DXF } from "./Application";
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
  ]);
}
