# Survival Trivia Game

A dynamic, infinitely-progressing quiz game built with Python, Flask, and the Gemini API. Test your knowledge in a "survival mode" where the game ends on your first wrong answer.

This project uses a Python backend to securely call the Google Gemini API for real-time question generation and a vanilla JavaScript frontend to create an interactive, stateful game.

---

## Features

* **Dynamic Content:** Questions are generated in real-time by Google's Gemini API, so you never get the same quiz twice.
* **Survival Mode:** The game continues as long as you keep answering correctly. Your final score is the number of questions you survived.
* **Progressive Game Phases:** The game gets more specific as you advance:
    * **Level 1-10:** You choose any topic you want to start.
    * **Level 11-40:** The game switches to category mode. You'll pick from Sports, Movies, History, and Science. Each category is eliminated after you complete its 10-question round.
    * **Level 51+:** The game switches to endless general knowledge trivia.
* **Instant Feedback:** Get immediate correct/incorrect feedback on every answer.

---

## Tech Stack

* **Backend:** Python, Flask
* **Frontend:** HTML, CSS, Vanilla JavaScript (no frameworks)
* **API:** Google Gemini (`google-generativeai`)
* **Server:** Gunicorn (for production)
* **Deployment:** Render

---

## Getting Started

You can run this project on your local machine for development and testing.

### Prerequisites

* Python 3.7+
* A Google Gemini API Key

### 1. Clone the Repository
```bash
# Replace with your own repository URL
git clone [https://github.com/SSabariGirish/trivia-game.git](https://github.com/SSabariGirish/trivia-game.git)
cd trivia-game
```

### 2. Set Up the Environment
Create and activate a virtual environment:

Bash

# For Mac/Linux
```bash
python3 -m venv venv
source venv/bin/activate
```

# For Windows
```bash
python -m venv venv
.\venv\Scripts\activate
```

# Install the Required Packages
```bash
pip install -r requirements.txt
```

### 3. Configure Your API Key

This project uses a .env file to keep your API key secret.
Create a file named .env in the root of the project:
```bash
touch .env
```

Open the .env file and add your API key:
```bash
GEMINI_API_KEY=your_secret_api_key_goes_here
```
(The .gitignore file is already set up to ignore this file, so your key will not be committed to GitHub.)


### 4. Run the App

Start the local Flask server
```bash
python app.py
```
Open your browser and go to http://127.0.0.1:5001 to play!