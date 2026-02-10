import {
  GET_TCP,
  GET_TCP_SUCCESS,
  GET_TCP_FAILURE,
  GET_ROBOT_PING,
  GET_ROBOT_PING_SUCCESS,
  GET_ROBOT_PING_FAILURE,
  ROBOT_MODE_SUCCESS,
  ROBOT_MODE_FAILURE,
  ROBOT_ENABLE_SUCCESS,
  ROBOT_ENABLE_FAILURE,
  ROBOT_SAFETY_SUCCESS,
  ROBOT_SAFETY_FAILURE,
  ROBOT_MOVEL,
  ROBOT_MOVEL_SUCCESS,
  ROBOT_MOVEL_FAILURE,
  ROBOT_PICK_UNPICK,
  ROBOT_PICK_UNPICK_SUCCESS,
  ROBOT_PICK_UNPICK_FAILURE,
} from "../../constants/ActionType";

const initialState = {
  loading: false,
  pose: null,
  mode: null,
  enabled: 0,
  saftey: null,
  moving: false,
  lastPose: null,
  error: null,
};

const Robot = (state = initialState, action) => {
  switch (action.type) {
    case GET_TCP:
      return { ...state, loading: true, error: null };

    case GET_TCP_SUCCESS:
      return { ...state, loading: false, pose: action.payload };

    case GET_TCP_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case GET_ROBOT_PING:
      return { ...state, loading: true };

    case GET_ROBOT_PING_SUCCESS:
      return {
        ...state,
        loading: false,
        connected: action.payload,
      };

    case GET_ROBOT_PING_FAILURE:
      return {
        ...state,
        loading: false,
        connected: false,
        error: action.payload,
      };

    case ROBOT_MODE_SUCCESS:
      return {
        ...state,
        mode: action.payload,
        error: null,
      };

    case ROBOT_MODE_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case ROBOT_ENABLE_SUCCESS:
      return {
        ...state,
        enabled: action.payload,
        error: null,
      };

    case ROBOT_ENABLE_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case ROBOT_SAFETY_SUCCESS:
      return {
        ...state,
        saftey: action.payload,
        error: null,
      };

    case ROBOT_SAFETY_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case ROBOT_MOVEL:
      return {
        ...state,
        moving: true,
        error: null,
      };

    case ROBOT_MOVEL_SUCCESS:
      return {
        ...state,
        moving: false,
        lastPose: action.payload?.pose ?? state.lastPose,
      };

    case ROBOT_MOVEL_FAILURE:
      return {
        ...state,
        moving: false,
        error: action.payload,
      };

    case ROBOT_PICK_UNPICK:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ROBOT_PICK_UNPICK_SUCCESS:
      return {
        ...state,
        loading: false,
        pickResult: action.payload,
      };

    case ROBOT_PICK_UNPICK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default Robot;
