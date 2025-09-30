from flask import Flask, request, jsonify
import pyautogui
import subprocess
import time

# --- This is the "Tool" or "Action" our agent can perform ---
def draw_and_fill_rectangle():
    """
    The reliable drawing function we built.
    """
    try:
        print(">>> ACTION: Received 'draw' command. Starting process...")
        print("Opening MS Paint...")
        subprocess.Popen(["mspaint.exe"])
        time.sleep(4)
        start_x, start_y = 600, 400
        side_length = 300
        print(f"Moving to starting point ({start_x}, {start_y}) and focusing.")
        pyautogui.moveTo(start_x, start_y, duration=0.5)
        pyautogui.click()
        time.sleep(1)
        print("Drawing rectangle...")
        pyautogui.dragRel(side_length, 0, duration=0.5)
        pyautogui.dragRel(0, side_length, duration=0.5)
        pyautogui.dragRel(-side_length, 0, duration=0.5)
        pyautogui.dragRel(0, -side_length, duration=0.5)
        print("Rectangle drawing complete!")
        time.sleep(1)
        print("Now, filling the rectangle...")
        try:
            fill_icon_location = pyautogui.locateCenterOnScreen('fill_icon.png', confidence=0.8)
            if fill_icon_location is None: raise Exception("Fill icon not found.")
            pyautogui.click(fill_icon_location)
            print("Paint bucket selected.")
            time.sleep(0.5)
        except Exception:
            print("WARNING: Could not find 'fill_icon.png'. Skipping the fill step.")
            return {"status": "success", "message": "Drew rectangle, but could not find fill icon."}
        center_x = start_x + (side_length / 2)
        center_y = start_y + (side_length / 2)
        pyautogui.moveTo(center_x, center_y, duration=0.2)
        time.sleep(0.5)
        pyautogui.dragRel(1, 0, duration=0.2)
        print("Fill complete!")
        return {"status": "success", "message": "Rectangle drawn and filled."}
    except Exception as e:
        print(f"An error occurred during drawing: {e}")
        return {"status": "error", "message": str(e)}

# --- This is the Flask Server that listens for commands ---
app = Flask(__name__)

# --- THIS ENTIRE SECTION WAS MISSING ---
# This block defines the API endpoint. Without it, the server doesn't know
# what to do when it receives a command from the client.aq
@app.route('/draw_rectangle', methods=['POST'])
def draw_rectangle():
    result = draw_and_fill_rectangle()
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000)