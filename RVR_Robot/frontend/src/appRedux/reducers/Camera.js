import {
  CAMERA_TRIGGER,
  CAMERA_TRIGGER_SUCCESS,
  CAMERA_TRIGGER_FAILURE,
} from "../../constants/ActionType";

const initialState = {
  loading: false,
  result: null,
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
      };

    case CAMERA_TRIGGER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default Camera;
