import {
  GET_USER,
  GET_USER_SUCCESS,
  GET_USER_ERROR
} from "../../constants/ActionType";
import { APPCONFIG } from "../../config/AppConfig";

const INIT_STATE = {
  getUser: [],
  loading: false,
  error: null,
};

const Auth = (state = INIT_STATE, action) => {
  let nextState = { ...state };

  switch (action.type) {
    case GET_USER:
      nextState.getUser = action.payload;
      nextState.loading = false;
      nextState.error = null;
      break;

    case GET_USER_SUCCESS:
      nextState.loading = false;
      nextState.getUser = action.payload;
      nextState.status = "Ok";
      nextState.userMessage = {
        type: APPCONFIG.ERROR_MESSAGE_TYPE.SUCCESS,
        message: "Login successful."
      };
      break;

    case GET_USER_ERROR:
      nextState.loading = false;
      nextState.getUser = null;
      nextState.status = "Error";
      nextState.userMessage = {
        type: APPCONFIG.ERROR_MESSAGE_TYPE.ERROR,
        message: action.payload || "Login failed."
      };
      break;


    default:
      return state;
  }

  return nextState;
};

export default Auth;
