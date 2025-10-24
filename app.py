import os
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')

# 1. SERVE THE FRONTEND
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)


# 2. SERVE THE BACKEND API
@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        # Check if a topic was provided in the request
        topic = data.get('topic') 

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({"error": "API key not configured"}), 500
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')# Using latest for stability

        # --- DYNAMIC PROMPT ---
        if topic:
            # If we get a topic, use it
            topic_string = f"about this topic: {topic}"
        else:
            # If topic is None, ask for general knowledge
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
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)