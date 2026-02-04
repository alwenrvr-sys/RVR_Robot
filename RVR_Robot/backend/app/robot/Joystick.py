"""
FR5 Safe Move App (User inputs Cartesian, robot moves using Joint PTP MoveJ)

What it does:
- User enters target TCP pose (X,Y,Z,Rx,Ry,Rz)
- Builds waypoint C = target with Z lifted by SAFE_Z_LIFT
- Computes IK for C and B (target)
- (Optional) SimMoveJ if available
- Executes MoveJ to C then MoveJ to B (PTP joint moves)

UI:
- same simple layout, white background
- Current TCP shows all 6 values
- Simulated Path box shows A/C/B + segment distances + sim codes (if any)

Notes:
- Using MoveJ often avoids some MoveL path/singularity/wrist issues.
"""

import math
import time
import threading
import tkinter as tk
from tkinter import messagebox

from app.sdk.fairino.Robot import RPC

# ===================== CONFIG =====================
ROBOT_IP = "192.168.58.2"

TOOL = 0
USER = 0
BLEND_STOP = -1 
MOVE_VEL = 50
MOVE_ACC = 20
OVL = 100

SAFE_Z_LIFT = 80.0
UI_REFRESH_MS = 200

HOME_POSE = [260, 431, 148, -180, 0, 45]
HOME_2_POSE = [700, 10, 160, -180, 0, 45]
FOCUS = [10,700,450,180,0,45]
FOCUS_2 = [700,10,450,180,0,45]



# If SimMoveJ exists, use it (else skip)
SIMULATE_BEFORE_MOVE = True


# ===================== ROBOT WRAPPER =====================
class RobotClient:
    def __init__(self, ip: str):
        self.robot = RPC(ip)
        self.lock = threading.Lock()

    def has(self, name: str) -> bool:
        return hasattr(self.robot, name)

    def call(self, name: str, *args, **kwargs):
        with self.lock:
            return getattr(self.robot, name)(*args, **kwargs)

    def _first(self, names):
        for n in names:
            if self.has(n):
                return n
        return None

    # ---- Mode / Enable / Errors / Stop ----
    def set_mode(self, mode: int):
        n = self._first(["Mode"])
        if not n:
            raise AttributeError("Mode() not found")
        return self.call(n, mode)

    def robot_enable(self, enable: int):
        n = self._first(["RobotEnable"])
        if not n:
            raise AttributeError("RobotEnable() not found")
        return self.call(n, enable)

    def reset_errors(self):
        n = self._first(["ResetAllError", "ResetError", "ClearAllError"])
        if not n:
            raise AttributeError("ResetAllError() not found")
        return self.call(n)

    def stop(self):
        n = self._first(["STOP", "Stop", "StopMotion", "ProgramStop"])
        if not n:
            raise AttributeError("STOP/StopMotion not found")
        return self.call(n)

    # ---- Live feedback ----
    def get_tcp(self):
        n = self._first(["GetActualTCPPose", "GetTCPPose", "GetToolPose"])
        if not n:
            raise AttributeError("TCP getter not found")
        return self.call(n)

    def get_joints_deg(self):
        n = self._first(["GetActualJointPosDegree", "GetActualJointPos", "GetJointPosDegree", "GetJointPos"])
        if not n:
            raise AttributeError("Joint getter not found")
        return self.call(n)

    # ---- IK ----
    def ik(self, pose):
        n = self._first(["GetInverseKin"])
        if not n:
            raise AttributeError("GetInverseKin not found")
        try:
            return self.call(n, 0, pose)  # your earlier signature
        except TypeError:
            try:
                return self.call(n, pose, TOOL, USER)
            except TypeError:
                return self.call(n, pose)
    
    def set_do(self, do_id: int, value: int, smooth=0, block=0):
        n = self._first(["SetDO"])
        if not n:
            raise AttributeError("SetDO() not found in robot RPC")
        return self.call(n, do_id, value, smooth, block)
    
    def get_do(self):
        """
        Returns:
            (error_code, [do_high, do_low])
        """
        # Preferred: read from live state package (fast, non-blocking)
        if hasattr(self.robot, "robot_state_pkg"):
            pkg = self.robot.robot_state_pkg
            return 0, [pkg.cl_dgt_output_h, pkg.cl_dgt_output_l]

        # Fallback: RPC call if supported
        n = self._first(["GetDO"])
        if not n:
            raise AttributeError("GetDO() not found in robot RPC")
        return self.call(n)
    
    def toggle_do(self, do_id=0):
        error, (do_h, do_l) = self.get_do()
        if error != 0:
            raise RuntimeError("GetDO failed")

        current = (do_l >> do_id) & 1
        new = 1 if current == 0 else 0

        self.set_do(do_id, new)
        time.sleep(0.05)

        _, (_, do_l_after) = self.get_do()
        confirmed = (do_l_after >> do_id) & 1

        return current, confirmed

    def move_l(self, pose):
        # Your code: MoveL(desc_pos=target, tool=0, user=0, vel=..., acc=..., ovl=..., blendR=-1)
        if self.has("MoveL"):
            return self.call(
                "MoveL",
                desc_pos=pose,
                tool=TOOL,
                user=USER,
                vel=MOVE_VEL,
                acc=MOVE_ACC,
                ovl=OVL,
                blendR=BLEND_STOP
            )
        raise AttributeError("MoveL not found in SDK.")
    # ---- MoveJ ----
    def move_j(self, joints):
        n = self._first(["MoveJ"])
        if not n:
            raise AttributeError("MoveJ not found")
        try:
            return self.call(
                n,
                joint_pos=joints,
                tool=TOOL,
                user=USER,
                vel=MOVE_VEL,
                acc=MOVE_ACC,
                ovl=OVL,
                blendT=-1
            )
        except TypeError:
            return self.call(n, joints, TOOL, USER, MOVE_VEL, MOVE_ACC, OVL, -1)

    # ---- SimMoveJ (optional) ----
    def sim_move_j(self, joints, sim_flag: int):
        n = self._first(["SimMoveJ"])
        if not n:
            raise AttributeError("SimMoveJ not found")
        # Different SDKs vary. Try common forms.
        try:
            return self.call(n, joints, sim_flag)
        except TypeError:
            # some take (simFlag) only after setting points; if so, we can't use it reliably
            return self.call(n, sim_flag)
        
    def sim_move_l(self, pose, sim_flag: int):
        # Protocol supports SimMoveL with simFlag=1/2/3
        if self.has("SimMoveL"):
            try:
                return self.call(
                    "SimMoveL",
                    desc_pos=pose,
                    tool=TOOL,
                    user=USER,
                    vel=MOVE_VEL,
                    acc=MOVE_ACC,
                    ovl=OVL,
                    blendR=BLEND_STOP,
                    simFlag=sim_flag
                )
            except TypeError:
                # some SDKs just take (pose, simFlag)
                return self.call("SimMoveL", pose, sim_flag)
        raise AttributeError("SimMoveL not found in SDK.")

def _errcode(retval):
    if isinstance(retval, (tuple, list)):
        return int(retval[0])
    return int(retval)

def dist_mm(a, b):
    return math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)



# ===================== MOVE_TO FUNCTION =====================
# def move_to(bot: RobotClient, x: float, y: float, zlift: float = SAFE_Z_LIFT):
#     """
#     Move robot to (x, y) while keeping current TCP Z, Rx, Ry, Rz
#     via a safe Z-lifted waypoint (MoveJ / PTP)
#     """
#     print("call")
#     try:
#         # Get current TCP
#         _, cur_tcp = bot.get_tcp()
#         cur_pose = cur_tcp  # [X,Y,Z,Rx,Ry,Rz]

#         # Target with current Z,Rx,Ry,Rz
#         target_pose = [x, y, cur_pose[2], cur_pose[3], cur_pose[4], cur_pose[5]]

#         # Waypoint C with lifted Z
#         via_pose = target_pose[:]
#         via_pose[2] += zlift

#         # Solve IK
#         ret_c, joints_c = bot.ik(via_pose)
#         ret_b, joints_b = bot.ik(target_pose)

#         if int(ret_c) != 0:
#             raise RuntimeError("Waypoint C not reachable. Reduce Z lift or adjust target.")
#         if int(ret_b) != 0:
#             raise RuntimeError("Target pose not reachable.")

#         # Optional SimMoveJ
#         if SIMULATE_BEFORE_MOVE and bot.has("SimMoveJ"):
#             e1 = _errcode(bot.sim_move_j(joints_c, 1))
#             e2 = _errcode(bot.sim_move_j(joints_b, 3))
#             if e1 != 0 or e2 != 0:
#                 raise RuntimeError(f"SimMoveJ failed: ({e1}, {e2})")

#         # Execute MoveJ
#         bot.move_j(joints_c)
#         time.sleep(0.05)
#         bot.move_j(joints_b)

#         print(f"Move to ({x},{y}) done via Z-lift waypoint.")
#         return True

#     except Exception as e:
#         print("move_to error:", e)
#         return False


def move_to(bot: RobotClient, x: float, y: float, job: str, zlift: float = 0):
    """
    Move robot to (x, y) relative to a home pose based on job (A01/B01),
    using a safe Z-lift waypoint (MoveJ / PTP).
    """
    try:
        # select home pose based on job
        home = HOME_2_POSE if job == "A01" else HOME_POSE
        print(f"[move_to] Using home pose for {job}: {home}")

        # Use home pose as base
        target_pose = [
            x,   # X
            y,   # Y
            home[2],       # Z
            home[3],       # Rx
            home[4],       # Ry
            home[5],       # Rz
        ]

        # Waypoint C with lifted Z
        via_pose = target_pose[:]
        via_pose[2] += zlift

        # Solve IK
        ret_c, joints_c = bot.ik(via_pose)
        ret_b, joints_b = bot.ik(target_pose)

        if int(ret_c) != 0:
            print(f"[move_to] Robot moved → Job:{job} X:{target_pose[0]:.2f} Y:{target_pose[1]:.2f}")

            raise RuntimeError("Waypoint C not reachable. Reduce Z lift or adjust target.")
        if int(ret_b) != 0:
            raise RuntimeError("Target pose not reachable.")

        # Optional simulation
        if SIMULATE_BEFORE_MOVE and bot.has("SimMoveJ"):
            e1 = _errcode(bot.sim_move_j(joints_c, 1))
            e2 = _errcode(bot.sim_move_j(joints_b, 3))
            if e1 != 0 or e2 != 0:
                raise RuntimeError(f"SimMoveJ failed: ({e1}, {e2})")

        # Execute MoveJ
        bot.move_j(joints_c)
        time.sleep(0.05)
        bot.move_j(joints_b)

        print(f"[move_to] Robot moved → Job:{job} X:{target_pose[0]:.2f} Y:{target_pose[1]:.2f}")
        return True

    except Exception as e:
        print("[move_to error]", e)
        return False


# ===================== UI APP =====================
class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("FR5 Safe Move (Cartesian input → MoveJ)")
        self.root.geometry("900x720")
        self.root.minsize(820, 650)
        self.root.configure(bg="#FFFFFF")

        self.bot = RobotClient(ROBOT_IP)

        self.status = tk.StringVar(value="Idle")
        self.sim_enabled = tk.IntVar(value=1)
        self.zlift = tk.DoubleVar(value=SAFE_Z_LIFT)

        self.mode_label = tk.StringVar(value="Mode: Unknown")
        self.enable_label = tk.StringVar(value="Robot: Unknown")

        self._build_ui()
        self._startup_init()
        self._schedule_refresh()

    # ---------- UI ----------
    def _build_ui(self):
        bg = "#FFFFFF"

        main = tk.Frame(self.root, bg=bg, padx=18, pady=14)
        main.pack(fill="both", expand=True)

        main.grid_columnconfigure(0, weight=1)
        main.grid_rowconfigure(4, weight=1)
        main.grid_rowconfigure(5, weight=1)

        inp = tk.Frame(main, bg=bg)
        inp.grid(row=0, column=0, sticky="ew")
        for c in range(4):
            inp.grid_columnconfigure(c, weight=1)

        self.entries = {}

        def add_entry(lbl, r, c):
            tk.Label(inp, text=lbl, bg=bg, font=("Arial", 14, "bold")).grid(row=r, column=c, sticky="w", pady=10)
            e = tk.Entry(inp, width=14, font=("Arial", 14))
            e.grid(row=r, column=c+1, sticky="w", padx=(10, 0))
            self.entries[lbl] = e

        add_entry("X", 0, 0)
        add_entry("Rx", 0, 2)
        add_entry("Y", 1, 0)
        add_entry("Ry", 1, 2)
        add_entry("Z", 2, 0)
        add_entry("Rz", 2, 2)

        btns = tk.Frame(main, bg=bg, pady=10)
        btns.grid(row=1, column=0, sticky="ew")
        btns.grid_columnconfigure(0, weight=1)
        btns.grid_columnconfigure(1, weight=1)

        tk.Button(
            btns,
            text="MOVE (PTP)",
            font=("Arial", 18, "bold"),
            bg="#1f5fbf",
            fg="white",
            height=2,
            command=self.on_move
        ).grid(row=0, column=0, sticky="w", padx=(0, 10))

        tk.Button(
            btns,
            text="GET",
            font=("Arial", 18, "bold"),
            bg="#8e44ad",
            fg="white",
            height=2,
            command=self.on_get_tcp
        ).grid(row=0, column=1, sticky="w", padx=(0, 14))

    
        tk.Button(btns, text="HOME-1", font=("Arial", 18, "bold"),
                bg="#55c06a", fg="white", height=2, command=self.on_home)\
            .grid(row=0, column=2, sticky="e", padx=(14, 0))
        
        tk.Button(btns, text="HOME-2", font=("Arial", 18, "bold"),
                bg="#55c06a", fg="white", height=2, command=self.on_home2)\
            .grid(row=0, column=3, sticky="e", padx=(14, 0))

        tk.Button(btns, text="Focus-1", font=("Arial", 18, "bold"),
                bg="#f39c12", fg="white", height=2, command=self.on_focus)\
            .grid(row=0, column=4, sticky="e", padx=(14, 0))

        tk.Button(btns, text="Focus-2", font=("Arial", 18, "bold"),
                bg="#f39c12", fg="white", height=2, command=self.on_focus_2)\
            .grid(row=0, column=5, sticky="e", padx=(14, 0))
        
        opt = tk.Frame(main, bg=bg, pady=6)
        opt.grid(row=2, column=0, sticky="ew")

        tk.Checkbutton(opt, text="Simulate before move (SimMoveJ if available)",
                       variable=self.sim_enabled, bg=bg, font=("Arial", 11)).grid(row=0, column=0, sticky="w")

        zrow = tk.Frame(opt, bg=bg)
        zrow.grid(row=1, column=0, sticky="w", pady=(8, 0))
        tk.Label(zrow, text="Z lift (mm):", bg=bg, font=("Arial", 11)).pack(side="left")
        tk.Entry(zrow, textvariable=self.zlift, width=8, font=("Arial", 11)).pack(side="left", padx=8)

        ctrl = tk.Frame(main, bg=bg, pady=10)
        ctrl.grid(row=3, column=0, sticky="ew")

        tk.Button(ctrl, text="STOP", bg="#e74c3c", fg="white",
                  font=("Arial", 11, "bold"), width=10, command=self.on_stop).pack(side="left", padx=(0, 8))

        tk.Button(ctrl, text="CLEAR ERR", bg="#3498db", fg="white",
                  font=("Arial", 11, "bold"), width=10, command=self.on_clear).pack(side="left", padx=(0, 8))

        tk.Button(ctrl, text="ENABLE", bg="#2ecc71", fg="white",
                  font=("Arial", 11, "bold"), width=10, command=self.on_enable).pack(side="left", padx=(0, 8))

        tk.Button(ctrl, text="DISABLE", bg="#7f8c8d", fg="white",
                  font=("Arial", 11, "bold"), width=10, command=self.on_disable).pack(side="left", padx=(0, 14))

        tk.Button(ctrl, text="AUTO MODE", bg="#111827", fg="white",
                  font=("Arial", 10, "bold"), width=12, command=lambda: self.on_mode(0)).pack(side="left", padx=(0, 8))

        tk.Button(ctrl, text="MANUAL (DRAG)", bg="#111827", fg="white",
                  font=("Arial", 10, "bold"), width=14, command=lambda: self.on_mode(1)).pack(side="left")
        
        pick_frame = tk.Frame(ctrl, bg=bg)
        pick_frame.pack(side="left", padx=(20, 0))  

        tk.Button(pick_frame,text="PICK / RELEASE",bg="#f39c12",fg="white",font=("Arial", 12, "bold"),width=14,command=self.pick_unpick).pack()

        right = tk.Frame(ctrl, bg=bg)
        right.pack(side="right")
        tk.Label(right, textvariable=self.enable_label, bg=bg, font=("Arial", 10)).pack(anchor="e")
        tk.Label(right, textvariable=self.mode_label, bg=bg, font=("Arial", 10)).pack(anchor="e")

        self.path_box = tk.LabelFrame(main, text="Planned Path (A→C→B) + Joint Targets", bg=bg,
                                      font=("Arial", 12, "bold"), padx=10, pady=8)
        self.path_box.grid(row=4, column=0, sticky="nsew", pady=(6, 10))
        self.path_box.grid_rowconfigure(0, weight=1)
        self.path_box.grid_columnconfigure(0, weight=1)

        self.path_text = tk.Text(self.path_box, height=8, font=("Consolas", 10), wrap="none")
        self.path_text.grid(row=0, column=0, sticky="nsew")

        tcp_box = tk.LabelFrame(main, text="Current TCP", bg=bg,
                                font=("Arial", 14, "bold"), padx=12, pady=10)
        tcp_box.grid(row=5, column=0, sticky="nsew")
        tcp_box.grid_rowconfigure(0, weight=1)
        tcp_box.grid_columnconfigure(0, weight=1)

        self.lbl_tcp = tk.Label(
            tcp_box,
            text="x:\ny:\nz:\nRx:\nRy:\nRz:",
            bg=bg,
            font=("Consolas", 16),
            justify="left",
            anchor="nw"
        )
        self.lbl_tcp.grid(row=0, column=0, sticky="nsew")

        st = tk.Frame(main, bg=bg, pady=10)
        st.grid(row=6, column=0, sticky="ew")
        tk.Label(st, text="Status:", bg=bg, font=("Arial", 11, "bold")).pack(side="left")
        tk.Label(st, textvariable=self.status, bg=bg, font=("Arial", 11), fg="green").pack(side="left", padx=10)

    def _startup_init(self):
        try:
            if self.bot.has("ResetAllError"):
                self.bot.reset_errors()
            self.status.set("Connected. Use ENABLE + AUTO MODE, then MOVE (PTP).")
        except Exception as e:
            messagebox.showerror("Init error", str(e))
            self.status.set("Init error.")

    def _schedule_refresh(self):
        self.refresh_live()
        self.root.after(UI_REFRESH_MS, self._schedule_refresh)

    def refresh_live(self):
        try:
            _, tcp = self.bot.get_tcp()
            self.lbl_tcp.config(
                text=(
                    f"x:  {tcp[0]:.2f}\n"
                    f"y:  {tcp[1]:.2f}\n"
                    f"z:  {tcp[2]:.2f}\n"
                    f"Rx: {tcp[3]:.2f}\n"
                    f"Ry: {tcp[4]:.2f}\n"
                    f"Rz: {tcp[5]:.2f}\n"
                )
            )
        except:
            pass

    def read_target(self):
        try:
            return [float(self.entries[k].get().strip()) for k in ("X", "Y", "Z", "Rx", "Ry", "Rz")]
        except:
            return None
    
    def on_get_tcp(self):
        try:
            _, tcp = self.bot.get_tcp()  # [X,Y,Z,Rx,Ry,Rz]

            keys = ["X", "Y", "Z", "Rx", "Ry", "Rz"]
            for i, k in enumerate(keys):
                entry = self.entries.get(k)
                if entry:
                    entry.delete(0, "end")
                    entry.insert(0, f"{tcp[i]:.2f}")

            self.status.set("Current TCP loaded into form.")

        except Exception as e:
            messagebox.showerror("Get TCP error", str(e))


    def set_plan_preview(self, a, c, b, j_c=None, j_b=None, sim_codes=None):
        self.path_text.delete("1.0", "end")
        self.path_text.insert("end", "A (current TCP): " + ", ".join(f"{v:.2f}" for v in a) + "\n")
        self.path_text.insert("end", "C (via TCP)    : " + ", ".join(f"{v:.2f}" for v in c) + "\n")
        self.path_text.insert("end", "B (target TCP) : " + ", ".join(f"{v:.2f}" for v in b) + "\n\n")
        self.path_text.insert("end", f"Dist A->C: {dist_mm(a,c):.1f} mm\n")
        self.path_text.insert("end", f"Dist C->B: {dist_mm(c,b):.1f} mm\n")
        self.path_text.insert("end", f"Total    : {dist_mm(a,c)+dist_mm(c,b):.1f} mm\n\n")
        if j_c is not None:
            self.path_text.insert("end", "IK joints for C: " + ", ".join(f"{x:.2f}" for x in j_c) + "\n")
        if j_b is not None:
            self.path_text.insert("end", "IK joints for B: " + ", ".join(f"{x:.2f}" for x in j_b) + "\n")
        if sim_codes is not None:
            self.path_text.insert("end", "\nSimMoveJ errcodes: " + str(sim_codes) + "\n")

    # ---- buttons ----
    def on_enable(self):
        try:
            self.bot.robot_enable(1)
            self.enable_label.set("Robot: Enabled")
            self.status.set("Robot enabled.")
        except Exception as e:
            messagebox.showerror("Enable error", str(e))

    def on_disable(self):
        try:
            self.bot.robot_enable(0)
            self.enable_label.set("Robot: Disabled")
            self.status.set("Robot disabled.")
        except Exception as e:
            messagebox.showerror("Disable error", str(e))

    def on_mode(self, mode: int):
        try:
            self.bot.set_mode(mode)
            self.mode_label.set("Mode: AUTO" if mode == 0 else "Mode: MANUAL")
            self.status.set("Mode set.")
        except Exception as e:
            messagebox.showerror("Mode error", str(e))

    def on_clear(self):
        try:
            self.bot.reset_errors()
            self.status.set("Errors cleared.")
        except Exception as e:
            messagebox.showerror("Clear error", str(e))

    def on_stop(self):
        try:
            self.bot.stop()
            self.status.set("STOP sent.")
        except Exception as e:
            messagebox.showerror("STOP error", str(e))
    
    def pick_unpick(self):
        try:
            # Read DO states
            error, (do_h, do_l) = self.bot.get_do()
            if error != 0:
                raise RuntimeError("GetDO failed")

            # Read DO0 (bit 0 of low word)
            current = (do_l >> 0) & 1

            # Toggle
            new = 1 if current == 0 else 0

            print(f" DO0 current = {current}")
            print(f" DO0 new     = {new}")

            # Write new state
            self.bot.set_do(0, new)

            # Optional verify
            time.sleep(0.05)
            _, (_, do_l_after) = self.bot.get_do()
            confirmed = (do_l_after >> 0) & 1

            print(f" DO0 after SetDO = {confirmed}")

            self.status.set(f"DO0 toggled: {current} → {confirmed}")

        except Exception as e:
            print(" ERROR:", e)
            messagebox.showerror("STOP error", str(e))




    def on_home(self):
        threading.Thread(target=self._move_ptp_worker, args=(HOME_POSE,), daemon=True).start()
    
    def on_home2(self):
        threading.Thread(target=self._move_ptp_worker, args=(HOME_2_POSE,), daemon=True).start()

    def on_focus(self):
        threading.Thread(target=self._move_ptp_worker, args=(FOCUS,), daemon=True).start()
    
    def on_focus_2(self):
        threading.Thread(target=self._move_ptp_worker, args=(FOCUS_2,), daemon=True).start()

    def on_move(self):
        target = self.read_target()
        if not target:
            messagebox.showerror("Input error", "Enter numeric X Y Z Rx Ry Rz")
            return
        threading.Thread(target=self._move_ptp_worker, args=(target,), daemon=True).start()

    # ---- core: Cartesian input -> IK -> MoveJ ----
    def _move_ptp_worker(self, target_pose):
        try:
            self.status.set("Reading current pose...")
            _, cur_pose = self.bot.get_tcp()

            via_pose = target_pose[:]
            via_pose[2] = via_pose[2] + float(self.zlift.get())

            # IK for C and B
            self.status.set("Solving IK for C and target...")
            ret_c, joints_c = self.bot.ik(via_pose)
            ret_b, joints_b = self.bot.ik(target_pose)

            if int(ret_c) != 0:
                messagebox.showerror("IK", "Waypoint C not reachable. Reduce Z lift or adjust target.")
                self.status.set("IK failed for C.")
                return
            if int(ret_b) != 0:
                messagebox.showerror("IK", "Target pose not reachable.")
                self.status.set("IK failed for target.")
                return

            self.set_plan_preview(cur_pose, via_pose, target_pose, j_c=joints_c, j_b=joints_b)

            # Optional SimMoveJ (if present)
            sim_codes = None
            if self.sim_enabled.get() == 1 and self.bot.has("SimMoveJ") and SIMULATE_BEFORE_MOVE:
                try:
                    self.status.set("Simulating joints (C then B)...")
                    e1 = _errcode(self.bot.sim_move_j(joints_c, 1))
                    e2 = _errcode(self.bot.sim_move_j(joints_b, 3))
                    sim_codes = (e1, e2)
                    self.set_plan_preview(cur_pose, via_pose, target_pose, j_c=joints_c, j_b=joints_b, sim_codes=sim_codes)

                    if e1 != 0 or e2 != 0:
                        messagebox.showerror("SimMoveJ failed", f"SimMoveJ errcodes: {sim_codes}")
                        self.status.set(f"SimMoveJ failed: {sim_codes}")
                        return
                except Exception:
                    # If SimMoveJ signature isn't compatible, skip simulation rather than crash
                    self.status.set("SimMoveJ not compatible; skipping sim.")
            else:
                if self.sim_enabled.get() == 1 and not self.bot.has("SimMoveJ"):
                    self.status.set("SimMoveJ not available; proceeding without sim.")

            # Execute MoveJ to C then MoveJ to B
            self.status.set("Executing MoveJ to C (PTP)...")
            self.bot.move_j(joints_c)
            time.sleep(0.05)

            self.status.set("Executing MoveJ to target (PTP)...")
            self.bot.move_j(joints_b)

            self.status.set("Done.")
        except Exception as e:
            self.status.set("Error during MoveJ.")
            messagebox.showerror("Move error", str(e))


if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
