import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
  ANALYZE_IMAGE,
  ANALYZE_IMAGE_SUCCESS,
  ANALYZE_IMAGE_FAILURE,
  CAMERA_LOCAL_IMAGE,
  RESET_ANALYSIS,
  RUN_AUTOSETUP,
  RUN_AUTOSETUP_SUCCESS,
  RUN_AUTOSETUP_FAILURE,
  GET_CAMERA_PING,
  GET_CAMERA_PING_SUCCESS,
  GET_CAMERA_PING_FAILURE,
} from "../../constants/ActionType";

const initialState = {
  loading: false,
  autosetupLoading: false,
  result: null,
  analyzeResult: null,
  error: null,
  connected:false,
};

const Camera = (state = initialState, action) => {
  switch (action.type) {
    case GET_CAMERA_PING:
      return { ...state, loading: true };

    case GET_CAMERA_PING_SUCCESS:
      return {
        ...state,
        loading: false,
        connected: action.payload,
      };

    case GET_CAMERA_PING_FAILURE:
      return {
        ...state,
        loading: false,
        connected: false,
        error: action.payload,
      };
    case CAMERA_TRIGGER:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CAMERA_TRIGGER_SUCCESS:
      return {
        ...state,
        loading: false,
        result: action.payload,
        imageBase64: action.payload.image_base64,
      };

    case CAMERA_LOCAL_IMAGE:
      return {
        ...state,
        loading: false,
        result: {
          ...(state.result || {}),
          image_base64: action.payload,
        },
      };

    case CAMERA_TRIGGER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ANALYZE_IMAGE:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ANALYZE_IMAGE_SUCCESS:
      return {
        ...state,
        loading: false,
        analyzeResult: action.payload,
      };

    case ANALYZE_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case RESET_ANALYSIS:
      return {
        ...state,
        loading: false,
        result: null,
        analyzeResult: null,
        error: null,
      };

    case RUN_AUTOSETUP:
      return {
        ...state,
        autosetupLoading: true,
        error: null,
      };

    case RUN_AUTOSETUP_SUCCESS:
      return {
        ...state,
        autosetupLoading: false,
      };

    case RUN_AUTOSETUP_FAILURE:
      return {
        ...state,
        autosetupLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default Camera;
