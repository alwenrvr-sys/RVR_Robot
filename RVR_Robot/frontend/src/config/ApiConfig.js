export const APICONFIG = Object.freeze({
  HOST: "http://localhost:8000/",
  AUTH: {
    GETUSER: "auth/users",
  },
  CAMERA: {
    TRIGGER: "camera/trigger",
    AUTOSETUP: "camera/autosetup",
    ANALYZE: "camera/analyze",
    ALLANALYZE:"camera/all/analyze"
  },
  ROBOT: {
    TCP: "robot/tcp",
    PING: "robot/ping",
    MODE_AUTO: "robot/mode/auto",
    MODE_MANUAL: "robot/mode/manual",
    ENABLE: "robot/enable",
    DISABLE: "robot/disable",
    STOP: "robot/stop",
    RESET: "robot/reset",
    MOVEL: "robot/moveL",
    PICK_UNPICK: "robot/pick-unpick",
  },
  APPLICATION: {
    APP_PICKPLACE_START: "app/1-start",
    APP_PICKPLACE_STOP: "app/1-stop",
    APP_PICKPLACE_STATUS: "app/1-status",
    PREVIEW: "app/preview",
    DRAW: "app/draw",
  },
});
