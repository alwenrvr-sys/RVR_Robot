import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
  ANALYZE_IMAGE,
  ANALYZE_IMAGE_SUCCESS,
  ANALYZE_IMAGE_FAILURE,
  CAMERA_LOCAL_IMAGE,
  RESET_ANALYSIS
} from "../../constants/ActionType";

const initialState = {
  loading: false,
  result: null,
  analyzeResult: null,
  error: null,
};

const Camera = (state = initialState, action) => {
  switch (action.type) {
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
        ...initialState, 
      };
    default:
      return state;
  }
};

export default Camera;
