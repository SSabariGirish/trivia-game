import os
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

# --- App & Database Setup ---
load_dotenv()
app = Flask(__name__, static_folder='public', static_url_path='')

# --- SMART DATABASE CONFIGURATION ---
# Check if we are on Render (it sets a DATABASE_URL)
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # We are on Render, use Postgres
    # Render's URL starts with 'postgres://', SQLAlchemy needs 'postgresql://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # We are local, use a simple SQLite file
    # This will create a file named 'local_db.sqlite' in your project folder
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_db.sqlite'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
# --- END OF NEW CONFIG ---

# --- Database Model (Our 'Score' Table) ---
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    time = db.Column(db.Float, nullable=False)  # Time in seconds

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'score': self.score,
            'time': round(self.time, 2) # Round the time for display
        }

# --- Frontend Routes ---
@app.route('/')
def serve_index():
    # This function now also creates the database if it doesn't exist
    with app.app_context():
        db.create_all()
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# --- API Routes ---

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        topic = data.get('topic') 

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({"error": "API key not configured"}), 500
            
        genai.configure(api_key=api_key)
        # Using gemini-pro for stability
        model = genai.GenerativeModel('gemini-2.5-flash')

        if topic:
            topic_string = f"about this topic: {topic}"
        else:
            topic_string = "of random general knowledge trivia"

        # Ask for 10 questions
        prompt = f"""
        Generate 10 multiple-choice quiz questions {topic_string}.
        Respond ONLY with a valid JSON array. Do not include any other text.
        Each object in the array should have:
        - "question": The question text.
        - "options": An array of 4 strings (the potential answers).
        - "answer": The string of the *correct* answer from the options list.
        """

        response = model.generate_content(prompt)
        return jsonify({"quiz_data": response.text})

    except Exception as e:
        print(f"Error in /api/generate-quiz: {e}")
        return jsonify({"error": str(e)}), 500

# --- LEADERBOARD ENDPOINTS ---

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        top_scores = Score.query.order_by(
            Score.score.desc(),
            Score.time.asc()
        ).limit(10).all()
        
        return jsonify([s.to_dict() for s in top_scores])
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return jsonify({"error": "Could not fetch leaderboard"}), 500

@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    try:
        data = request.json
        name = data.get('name')
        score = data.get('score')
        time = data.get('time')

        if not name or score is None or time is None:
            return jsonify({"error": "Missing name, score, or time"}), 400

        new_score = Score(name=name, score=score, time=time)
        db.session.add(new_score)
        db.session.commit()
        
        return jsonify({"message": "Score submitted successfully!"}), 201
    except Exception as e:
        print(f"Error submitting score: {e}")
        return jsonify({"error": "Could not submit score"}), 500

# --- Main (for local testing) ---
if __name__ == '__main__':
    # This command creates the table if it doesn't exist
    # Moved to the '/' route to ensure context
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)