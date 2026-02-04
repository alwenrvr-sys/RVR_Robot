import { all, fork } from 'redux-saga/effects';
import { getUser } from './Auth';
export default function* rootSaga() {
  yield all([
    fork(getUser),
  ]);
}
