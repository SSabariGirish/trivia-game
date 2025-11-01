import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv() 

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: 'GEMINI_API_KEY' not found in your .env file.")
else:
    try:
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel('gemini-2.5-flash')

        response = model.generate_content('''
                                        Generate 3 multiple-choice quiz questions about a basic cybersecurity topic (like phishing, strong passwords, or MFA).
                                        Respond ONLY with a valid JSON array. Each object in the array must have this exact structure:
                                            - "question": The question text.
                                            - "options": An array of 4 strings (the potential answers).
                                            - "answer": The string of the *correct* answer from the options list.
                                        Do not include any text before or after the JSON array, such as ```json.
        ''')

        print(response.text)

    except Exception as e:
        print(f"An error occurred: {e}")
