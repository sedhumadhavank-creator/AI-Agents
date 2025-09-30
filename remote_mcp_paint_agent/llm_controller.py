# First, import all the necessary libraries
import google.generativeai as genai
import pyautogui
import subprocess
import time
import os
import requests

# --- PART 1: LLM AND AGENT CONFIGURATION ---

# IMPORTANT: Paste your API Key here
API_KEY ='' #"AIzaSyDKpomlI5HJSdOnTugHCsCRGpdp_DyJq3o"

# Configure the Gemini API
genai.configure(api_key=API_KEY)

# --- THIS IS THE ONLY LINE THAT HAS CHANGED ---
# We are using a newer, more available model name.
model = genai.GenerativeModel('models/gemini-flash-latest')
# --- END OF CHANGE ---

# This is the instruction we give to the LLM. It's the "brain" of our decision maker.
SYSTEM_PROMPT = """
You are an assistant that decides if a user wants to draw something in MS Paint.
Your only job is to respond with a single word and nothing else:
- Respond with 'DRAW' if the user's request is about drawing, creating, or making a shape, square, or rectangle.
- Respond with 'IGNORE' if the user asks a question, wants to chat, or wants to do anything else.
- Respond with 'QUIT' if the user wants to exit.
"""

# --- PART 2: THE "TOOL" OR "ACTION" CODE (Our drawing function) ---

def draw_and_fill_rectangle():
    """
    This is the function we built. It opens MS Paint, draws a rectangle,
    and fills it with the default color.
    """
    REMOTE_MCP_URL = "https://92f430a68ddb0f096c0141f0783b6f15.serveo.net"
    try:
        print("\n>>> ACTION: Starting the drawing process...")
        # (The rest of this function is the same reliable code we already built)
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
            return
        center_x = start_x + (side_length / 2)
        center_y = start_y + (side_length / 2)
        pyautogui.moveTo(center_x, center_y, duration=0.2)
        time.sleep(0.5)
        pyautogui.dragRel(1, 0, duration=0.2)
        print("Fill complete!")
        print(">>> ACTION: Drawing process finished.\n")
    except Exception as e:
        print(f"An error occurred during drawing: {e}")


# --- PART 3: THE MAIN CONTROLLER LOOP ---

if __name__ == '__main__':
    print("LLM Paint Agent is running.")
    print("Enter a prompt, or type 'quit' to exit.")

    # Start a chat session with the LLM, giving it the system instructions
    chat = model.start_chat(history=[
        {'role': 'user', 'parts': [SYSTEM_PROMPT]},
        {'role': 'model', 'parts': ["OK"]}
    ])

    while True:
        # 1. Get prompt from the user
        user_prompt = input("YOU: ")

        # 2. Send the prompt to the LLM and get its decision
        response = chat.send_message(user_prompt)
        decision = response.text.strip().upper()
        print(f"LLM DECISION: {decision}")

        # 3. Act based on the LLM's decision
        if "DRAW" in decision:
            draw_and_fill_rectangle()
        elif "QUIT" in decision:
            print("LLM decided to quit. Exiting.")
            break
        else: # IGNORE
            print("Okay, I will not draw anything.\n")