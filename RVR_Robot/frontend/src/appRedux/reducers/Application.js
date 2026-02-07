import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_START_SUCCESS,
  APP_PICKPLACE_START_FAILURE,
  APP_PICKPLACE_STOP,
  APP_PICKPLACE_STOP_SUCCESS,
  APP_PICKPLACE_STOP_FAILURE,
} from "../../constants/ActionType";

const initialState = {
  running: false,
  loading: false,
  error: null,
};

const Applications = (state = initialState, action) => {
  switch (action.type) {

    case APP_PICKPLACE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case APP_PICKPLACE_START_SUCCESS:
      return {
        ...state,
        loading: false,
        running: true,
      };

    case APP_PICKPLACE_START_FAILURE:
      return {
        ...state,
        loading: false,
        running: false,
        error: action.payload,
      };

    case APP_PICKPLACE_STOP:
      return {
        ...state,
        loading: true,
      };

    case APP_PICKPLACE_STOP_SUCCESS:
      return {
        ...state,
        loading: false,
        running: false,
      };

    case APP_PICKPLACE_STOP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default Applications;
