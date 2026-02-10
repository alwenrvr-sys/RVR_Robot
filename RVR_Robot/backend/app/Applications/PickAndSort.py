import threading
import time
import cv2

from app.robot.Robot import get_robot
from app.robot.Camera_service import SickCamera
from app.robot.Helpers import (
    object_present,
    analyze_image,
    sort_analyze_image,
    get_latest_image_path,
    wait_for_image_ready,
    image_to_base64
)

# --------------------------------------------------
# ROBOT + CAMERA
# --------------------------------------------------

robot = get_robot()
camera = SickCamera("192.168.58.67", 2114)

# --------------------------------------------------
# POSES
# --------------------------------------------------

HOME_POSE   = [260, 431, 160, -180, 0, 45]
HOME_2_POSE = [700, 10, 160, -180, 0, 45]
FOCUS       = [10, 700, 350, 180, 0, 45]
FOCUS_2     = [700, 10, 350, 180, 0, 45]

FTP_IMAGE_DIR = r"C:\ftp_root\nova"

# --------------------------------------------------
# AUTO STATE
# --------------------------------------------------

AUTO_RUN = False

AUTO_RESULT = {
    "success": None,
     "stage": "idle",  
    "image_base64": None,
    "analysis": None,
    "target_pose": None,
    "tcp": None,
    "error": None,
}

# --------------------------------------------------
# PICK & PLACE
# --------------------------------------------------

def PickAndSort():
    def worker():
        global AUTO_RUN, AUTO_RESULT

        bgr = None
        analysis = None
        target_pose = None
        tcp = None

        try:
            AUTO_RUN = True
            print("[AUTO] Started")

            camera.connect()

            while AUTO_RUN:

                # ---------- MOVE TO FOCUS ----------
                print("[AUTO] Moving to FOCUS")
                res = robot.move_to_pose_l(FOCUS)
                if not res["success"]:
                    AUTO_RESULT["success"] = False
                    AUTO_RESULT["error"] = "move_focus_failed"
                    return

                time.sleep(1.0)

                # ---------- WAIT FOR OBJECT ----------
                print("[AUTO] Waiting for object...")

                bgr = None
                tcp = None

                while AUTO_RUN:
                    err, tcp = robot.get_tcp()
                    if err != 0:
                        print("[AUTO] Failed to read TCP")
                        time.sleep(0.5)
                        continue

                    z = tcp[2]
                    camera.trigger_with_autosetup(z)

                    time.sleep(0.3)

                    img_path = get_latest_image_path(FTP_IMAGE_DIR)
                    if not img_path:
                        time.sleep(0.5)
                        continue

                    if not wait_for_image_ready(img_path):
                        continue

                    bgr = cv2.imread(img_path)
                    if bgr is None:
                        continue
                    AUTO_RESULT.update({
                        "stage": "image_captured",
                        "image_base64": image_to_base64(bgr),
                        "tcp": tcp,
                    })            
                    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
                    gray = cv2.GaussianBlur(gray, (5, 5), 0)

                    if object_present(gray):
                        AUTO_RESULT.update({
                            "stage": "object_detected",
                            "image_base64": image_to_base64(bgr),
                            "tcp": tcp,
                        })
                        print("[AUTO] Object detected")
                        break

                    print("[AUTO] No object → waiting...")
                    time.sleep(1.0)

                if not AUTO_RUN:
                    break

                # ---------- ANALYZE ----------
                print("[AUTO] Analyzing image")
                _, tcp = robot.get_tcp()

                analysis = sort_analyze_image(bgr, tcp)
                AUTO_RESULT.update({
                    "stage": "analyzed",
                    "analysis": analysis,
                    "image_base64": image_to_base64(bgr),
                    "tcp": tcp,
                })
                if not analysis.get("success"):
                    AUTO_RESULT.update({
                        "success": False,
                        "image_base64": image_to_base64(bgr),
                        "analysis": analysis,
                        "tcp": tcp,
                    })
                    continue

                tgt = analysis["target"]

                TARGET_Z = 140.0
                target_pose = [
                    tgt["target_X"],
                    tgt["target_Y"],
                    TARGET_Z,
                    tcp[3],
                    tcp[4],
                    tgt["target_Rz"],
                ]

                # ---------- MOVE TO TARGET ----------
                print("[AUTO] Moving to target")
                res = robot.move_to_pose_l(target_pose)
                if not res["success"]:
                    print("[AUTO] Target move failed")
                    continue

                time.sleep(0.5)

                # ---------- PICK ----------
                print("[AUTO] Picking")
                robot.pick_unpick()
                time.sleep(0.5)

                # ---------- RETREAT ----------
                print("[AUTO] Retreat to FOCUS")
                robot.move_to_pose_l(FOCUS)
                time.sleep(0.5)

                # ---------- PLACE ----------
                print("[AUTO] Move to FOCUS_2")
                robot.move_to_pose_l(FOCUS_2)
                time.sleep(0.5)

                print("[AUTO] Move to HOME_2")
                robot.move_to_pose_l(HOME_2_POSE)

                print("[AUTO] Placing")
                robot.pick_unpick()

                # ---------- STORE RESULT ----------
                AUTO_RESULT.update({
                    "success": True,
                    "image_base64": image_to_base64(bgr),
                    "analysis": analysis,
                    "target_pose": target_pose,
                    "tcp": tcp,
                    "error": None,
                })

                print("[AUTO] Cycle complete → restarting")
                time.sleep(1.0)

            print("[AUTO] Stopped")

        except Exception as e:
            AUTO_RUN = False
            AUTO_RESULT.update({
                "success": False,
                "error": str(e),
            })
            print("[AUTO] ERROR:", e)

        finally:
            camera.close()

    threading.Thread(target=worker, daemon=True).start()


# --------------------------------------------------
# OPTIONAL STOP FUNCTION
# --------------------------------------------------

def StopPickAndSort():
    global AUTO_RUN
    AUTO_RUN = False
    print("[AUTO] Stop requested")
