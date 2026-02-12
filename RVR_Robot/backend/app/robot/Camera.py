import socket
import time
# SOPAS framing
STX = b"\x02"
ETX = b"\x03"

CAMERA_IP = "192.168.58.67"
CAMERA_PORT = 2114   # SOPAS command port


class SickCamera:
    def __init__(self, ip, port=2114):
        self.ip = ip
        self.port = port
        self.sock = None
        self.last_z = None
        self.z_threshold = 5.0
        self.z_tolerance = 150

    def connect(self):
        """Connect to the camera."""
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.ip, self.port))
        print("[CAMERA] Connected")

    def _send(self, cmd: str):
        """Send SOPAS command and wait for ACK."""
        msg = STX + cmd.encode("utf-8") + ETX
        self.sock.sendall(msg)

        # Read ACK (until ETX)
        data = b""
        while True:
            chunk = self.sock.recv(4096)
            data += chunk
            if ETX in chunk:
                break

        return data.replace(STX, b"").replace(ETX, b"")
    
    def ping(self, timeout: float = 1.0) -> bool:
        """
        Ping camera using Command Channel 'echo'.
        Returns True if camera is reachable and responsive.
        """
        if not self.sock:
            return False

        try:
            self.sock.settimeout(timeout)

            msg = STX + b'echo "ping"' + ETX
            self.sock.sendall(msg)

            data = b""
            while True:
                chunk = self.sock.recv(4096)
                data += chunk
                if ETX in chunk:
                    break

            # Remove framing
            reply = data.replace(STX, b"").replace(ETX, b"")

            return reply.strip() == b"ping"

        except Exception:
            return False

    def trigger_with_autosetup(self, current_z: float):
        if not self.sock:
            raise RuntimeError("Camera not connected")

        if self.last_z is None or abs(current_z - self.last_z) >= self.z_tolerance:

            print(f"[CAMERA] Z changed significantly ({self.last_z} → {current_z}), running AutoSetup")

            self._send("call ImageProviderV2D:0 AutoSetup")
            time.sleep(15)

            self.last_z = current_z

        else:
            print(f"[CAMERA] Z within ±{self.z_tolerance}, skipping AutoSetup")

        self._send("trigger")
        print("[CAMERA] Trigger sent")

        
    def run_autosetup(self):
        """
        Run camera AutoSetup explicitly.
        """
        if not self.sock:
            raise RuntimeError("Camera not connected")

        print("[CAMERA] Running AutoSetup")
        self._send("call ImageProviderV2D:0 AutoSetup")
        time.sleep(15)  # Allow AutoSetup to complete
        print("[CAMERA] AutoSetup completed")

    def trigger(self):
        """
        Trigger camera image capture (no AutoSetup, no Z check)
        """
        if not self.sock:
            raise RuntimeError("Camera not connected")

        self._send("trigger")
        print("[CAMERA] Trigger sent")

    def close(self):
        if self.sock:
            self.sock.close()
            self.sock = None
            print("[CAMERA] Disconnected")
