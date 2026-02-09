import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_START_SUCCESS,
  APP_PICKPLACE_START_FAILURE,
  APP_PICKPLACE_STOP,
  APP_PICKPLACE_STOP_SUCCESS,
  APP_PICKPLACE_STOP_FAILURE,
  APP_PICKPLACE_STATUS_SUCCESS,
  APP_PICKPLACE_STATUS_FAILURE,
  RESET_ANALYSIS,
  DXF_PREVIEW,
  DXF_PREVIEW_SUCCESS,
  DXF_PREVIEW_FAILURE,
  DXF_DRAW,
  DXF_DRAW_SUCCESS,
  DXF_DRAW_FAILURE,
  DXF_RESET,
} from "../../constants/ActionType";

const initialState = {
  running: false,
  loading: false,
  stage: "idle",
  image_base64: null,
  analysis: null,
  target_pose: null,
  tcp: null,
  previewPaths: null, // scaled DXF paths
  drawPaths: null, // robot-ready paths
  origin: null,
  params: null,
  pathCount: 0,
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

    case APP_PICKPLACE_STATUS_SUCCESS:
      return {
        ...state,
        ...action.payload,
        error: null,
      };

    case APP_PICKPLACE_STATUS_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case RESET_ANALYSIS:
      return {
        ...initialState,
      };
    case DXF_PREVIEW:
    case DXF_DRAW:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DXF_PREVIEW_SUCCESS:
      return {
        ...state,
        loading: false,
        previewPaths: action.payload.paths,
      };

    case DXF_DRAW_SUCCESS:
      return {
        ...state,
        loading: false,
        drawPaths: action.payload.paths,
        origin: action.payload.origin,
        params: action.payload.params,
        pathCount: action.payload.path_count,
      };

    case DXF_PREVIEW_FAILURE:
    case DXF_DRAW_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case DXF_RESET:
      return { ...initialState };

    default:
      return state;
  }
};

export default Applications;
