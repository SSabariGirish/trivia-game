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


### 2. Set Up the Environment
Create and activate a virtual environment:

Bash

# For Mac/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate

