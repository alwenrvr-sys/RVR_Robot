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
    image_to_base64,
    set_priority_for_groups 
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
FOCUS       = [10, 700, 450, 180, 0, 45]
FOCUS_2     = [700, 10, 450, 180, 0, 45]

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
    "priority_order": [],
    "error": None,
}

# --------------------------------------------------
# PICK & PLACE
# --------------------------------------------------

def PickAndSort():

    def worker():
        global AUTO_RUN, AUTO_RESULT

        AUTO_RUN = True
        print("[AUTO] Started")

        try:
            camera.connect()

            while AUTO_RUN:

                # ==================================================
                # 1️ MOVE TO FOCUS (SAFE VIEW POSITION)
                # ==================================================
                print("[AUTO] Moving to FOCUS")
                res = robot.move_to_pose_l(FOCUS)
                if not res["success"]:
                    AUTO_RESULT.update({
                        "success": False,
                        "error": "move_focus_failed"
                    })
                    break

                time.sleep(0.8)

                # ==================================================
                # 2️ CAPTURE IMAGE
                # ==================================================
                err, tcp = robot.get_tcp()
                if err != 0:
                    print("[AUTO] TCP read failed")
                    time.sleep(0.5)
                    continue

                z = tcp[2]
                camera.trigger_with_autosetup(z)
                time.sleep(0.3)

                img_path = get_latest_image_path(FTP_IMAGE_DIR)
                if not img_path or not wait_for_image_ready(img_path):
                    print("[AUTO] Image not ready")
                    time.sleep(0.5)
                    continue

                bgr = cv2.imread(img_path)
                if bgr is None:
                    continue

                AUTO_RESULT.update({
                    "stage": "image_captured",
                    "image_base64": image_to_base64(bgr),
                    "tcp": tcp,
                })
                
                # =========================================
                # 3️ QUICK OBJECT PRESENCE CHECK
                # =========================================
                # gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
                # gray = cv2.GaussianBlur(gray, (5, 5), 0)

                # if not object_present(gray):
                #     print("[AUTO] No object detected → waiting")
                #     time.sleep(0.8)
                #     continue

                # print("[AUTO] Object detected")

                # ==================================================
                # 4 ANALYZE + GROUP
                # ==================================================
                print("[AUTO] Analyzing image")

                analysis = sort_analyze_image(bgr, tcp)

                if not analysis.get("success"):
                    print("[AUTO] Analysis failed")
                    time.sleep(0.5)
                    continue

                objects = analysis.get("objects", [])

                if not objects:
                    print("[AUTO] No objects detected")
                    time.sleep(0.8)
                    continue

                # ==================================================
                # 5 APPLY USER PRIORITY
                # ==================================================
                priority_order = AUTO_RESULT.get("priority_order", [])
                ordered_objects = set_priority_for_groups(
                    analysis,
                    priority_order
                )

                if not ordered_objects:
                    print("[AUTO] No objects after priority sorting")
                    time.sleep(0.5)
                    continue

                # ==================================================
                # 6 PICK ONLY ONE OBJECT
                # ==================================================
                obj = ordered_objects[0]
                tgt = obj["target"]

                TARGET_Z = 140.0

                target_pose = [
                    tgt["target_X"],
                    tgt["target_Y"],
                    TARGET_Z,
                    tcp[3],
                    tcp[4],
                    tgt["target_Rz"],
                ]

                print(f"[AUTO] Picking object ID {obj['id']}")

                res = robot.move_to_pose_l(target_pose)
                if not res["success"]:
                    print("[AUTO] Move to target failed")
                    continue

                time.sleep(0.3)

                robot.pick_unpick()   # PICK
                time.sleep(0.4)

                # ==================================================
                # 7 PLACE SEQUENCE
                # ==================================================
                robot.move_to_pose_l(FOCUS)
                time.sleep(0.3)

                robot.move_to_pose_l(FOCUS_2)
                time.sleep(0.3)

                robot.move_to_pose_l(HOME_2_POSE)
                robot.pick_unpick()   # RELEASE

                time.sleep(0.3)

                print("[AUTO] One object processed → reanalyzing")

                # ==================================================
                # 8 UPDATE RESULT STATE
                # ==================================================
                AUTO_RESULT.update({
                    "success": True,
                    "stage": "object_processed",
                    "analysis": analysis,
                    "target_pose": target_pose,
                    "tcp": tcp,
                    "error": None,
                })

                # Loop continues automatically
                # Next cycle will re-capture + re-analyze

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
