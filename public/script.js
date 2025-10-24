// --- DOM ELEMENTS ---
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score-display');
const quizContainer = document.getElementById('quiz-container');
const loading = document.getElementById('loading');
const topicSelectionDiv = document.getElementById('topic-selection');
const topicInput = document.getElementById('topic-input');
const submitTopicBtn = document.getElementById('submit-topic-btn');
const categorySelectionDiv = document.getElementById('category-selection');
const categoryButtons = document.querySelectorAll('.category-btn');

// --- LEADERBOARD & SUBMIT ELEMENTS ---
const submitScoreForm = document.getElementById('submit-score-form');
const submitScoreBtn = document.getElementById('submit-score-btn');
const playerNameInput = document.getElementById('player-name');
const leaderboardList = document.getElementById('leaderboard-list');

// --- GAME STATE ---
let currentScore = 0;
let questionDeck = [];
let currentQuestionIndex = 0;
let availableCategories = []; 
let gameStartTime = 0; // Timer variable

// --- EVENT LISTENERS ---
startBtn.addEventListener('click', startGame);
submitTopicBtn.addEventListener('click', handleTopicSubmit);
submitScoreBtn.addEventListener('click', handleScoreSubmit);
categoryButtons.forEach(button => {
    button.addEventListener('click', handleCategorySelect);
});

// --- Load leaderboard when page loads ---
document.addEventListener('DOMContentLoaded', fetchAndDisplayLeaderboard);


// --- GAME FLOW FUNCTIONS ---

function startGame() {
    // 1. Reset all state
    currentScore = 0;
    currentQuestionIndex = 0;
    questionDeck = [];
    scoreDisplay.textContent = currentScore;
    availableCategories = ['Sports', 'Movies', 'History', 'Science'];

    // 2. Hide all game elements
    startBtn.style.display = 'none';
    quizContainer.innerHTML = '';
    categorySelectionDiv.style.display = 'none';
    submitScoreForm.style.display = 'none'; // Hide submit form
    
    // 3. Show the first phase: Topic Input
    topicSelectionDiv.style.display = 'block';
    topicInput.value = '';
    
    // --- START THE TIMER! ---
    gameStartTime = Date.now();
}

function handleTopicSubmit() {
    const topic = topicInput.value;
    if (!topic) {
        alert("Please enter a topic to start!");
        return;
    }
    // Hide the topic input and fetch the first deck
    topicSelectionDiv.style.display = 'none';
    fetchNewDeck(topic, "Level 1 (1-10)");
}

function handleCategorySelect(event) {
    const topic = event.target.dataset.topic;
    
    // Remove topic from available list
    availableCategories = availableCategories.filter(cat => cat !== topic);
    
    // Hide buttons and fetch the new deck
    categorySelectionDiv.style.display = 'none';
    const levelName = `Level ${currentScore + 1}-${currentScore + 10}`;
    fetchNewDeck(topic, levelName);
}

async function fetchNewDeck(topic, levelName) {
    loading.textContent = `Generating ${levelName}...`;
    loading.style.display = 'block';
    quizContainer.innerHTML = '';

    // If the topic is null, it's general trivia
    const bodyPayload = topic ? { topic: topic } : {};

    try {
        const response = await fetch('/api/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
        });

        if (!response.ok) {
            // This gets the REAL error message from app.py
            const errData = await response.json(); 
            throw new Error(errData.error || 'Failed to fetch question deck.'); 
        }

        const data = await response.json();
        let jsonString = data.quiz_data.replace(/```json/g, '').replace(/```/g, '').trim();
        questionDeck = JSON.parse(jsonString);
        
        // Reset index for the new deck
        currentQuestionIndex = 0;
        loading.style.display = 'none';
        
        displayNextQuestion(); 

    } catch (error) {
        console.error(error);
        quizContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        endGame(true);
    }
}

function displayNextQuestion() {
    // --- MAIN GAME LOOP CHECK ---
    // Check if we've finished the current 10-question deck
    if (currentQuestionIndex >= questionDeck.length) {
        checkGamePhase(); // Move to the next phase
        return;
    }
    
    // Clear container and get the next question
    quizContainer.innerHTML = '';
    const item = questionDeck[currentQuestionIndex];

    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    const questionEl = document.createElement('h3');
    questionEl.textContent = item.question;
    questionBlock.appendChild(questionEl);

    const optionsList = document.createElement('ul');
    const feedbackEl = document.createElement('p');
    feedbackEl.className = 'feedback';

    item.options.forEach(opt => {
        const optionEl = document.createElement('li');
        optionEl.textContent = opt;

        optionEl.addEventListener('click', () => {
            optionsList.querySelectorAll('li').forEach(li => li.style.pointerEvents = 'none');

            if (opt === item.answer) {
                // --- CORRECT ---
                feedbackEl.textContent = "Correct!";
                feedbackEl.className = 'feedback correct';
                optionEl.classList.add('answered-correct');
                
                currentScore++;
                scoreDisplay.textContent = currentScore;
                currentQuestionIndex++;
                
                setTimeout(displayNextQuestion, 1000);
                
            } else {
                // --- INCORRECT ---
                feedbackEl.innerHTML = `Game Over!<br>The correct answer was: ${item.answer}`; 
                feedbackEl.className = 'feedback incorrect';
                optionEl.classList.add('answered-incorrect');
                endGame(false);
            }
        });
        
        optionsList.appendChild(optionEl);
    });

    questionBlock.appendChild(optionsList);
    questionBlock.appendChild(feedbackEl);
    quizContainer.appendChild(questionBlock);
}

function checkGamePhase() {
    quizContainer.innerHTML = `<h2 style="color: green;">LEVEL COMPLETE!</h2>`;

    // Wait 2 seconds before showing the next phase
    setTimeout(() => {
        // Score 10, 20, 30 -> Show categories
        if (currentScore === 10 || currentScore === 20 || currentScore === 30) {
            showCategorySelector();
        } 
        // Score 40 -> Auto-select last category
        else if (currentScore === 40) {
            const lastTopic = availableCategories[0];
            quizContainer.innerHTML += `<p>Final specialist round: ${lastTopic}!</p>`;
            setTimeout(() => fetchNewDeck(lastTopic, "Final Level (41-50)"), 1500);
        } 
        // Score 50+ -> General Trivia
        else if (currentScore >= 50) {
            quizContainer.innerHTML += `<p>Switching to General Trivia!</p>`;
            setTimeout(() => fetchNewDeck(null, `Level ${currentScore + 1}-${currentScore + 10}`), 1500);
        }
    }, 2000);
}

function showCategorySelector() {
    // Show the category div
    categorySelectionDiv.style.display = 'block';
    
    // Hide/Show buttons based on what's left
    categoryButtons.forEach(button => {
        if (availableCategories.includes(button.dataset.topic)) {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }
    });
}

function endGame(isError) {
    if (!isError) {
        // Stop the timer and calculate time in seconds
        const gameEndTime = Date.now();
        const totalTimeInSeconds = (gameEndTime - gameStartTime) / 1000.0;
        
        // Show the submit score form
        submitScoreForm.style.display = 'block';
        
        // Store time on the button itself so we can get it on submit
        submitScoreBtn.dataset.time = totalTimeInSeconds;
        
    } else {
        quizContainer.innerHTML += `<h2 class="incorrect">Game Over!</h2>`;
        // On error, just show the play again button
        startBtn.textContent = 'Play Again?';
        startBtn.style.display = 'block';
    }
    
    loading.style.display = 'none';
    topicSelectionDiv.style.display = 'none';
    categorySelectionDiv.style.display = 'none';
}

async function handleScoreSubmit() {
    const name = playerNameInput.value;
    const time = parseFloat(submitScoreBtn.dataset.time);
    const score = currentScore;

    if (!name) {
        alert("Please enter a name!");
        return;
    }

    try {
        // Send data to our new backend endpoint
        const response = await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, score: score, time: time })
        });

        if (!response.ok) {
            throw new Error("Failed to submit score.");
        }
        
        // Score submitted! Hide the form
        submitScoreForm.style.display = 'none';
        playerNameInput.value = '';
        
        // Show the 'Play Again' button
        startBtn.textContent = 'Play Again?';
        startBtn.style.display = 'block';
        
        // Refresh the leaderboard to show the new score
        fetchAndDisplayLeaderboard();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function fetchAndDisplayLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
            throw new Error("Could not load leaderboard.");
        }
        
        const scores = await response.json();
        
        // Clear old list
        leaderboardList.innerHTML = '';
        
        if (scores.length === 0) {
            leaderboardList.innerHTML = "<li>No scores yet. Be the first!</li>";
            return;
        }

        // Build the new list
        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${entry.name}</strong> - 
                Score: ${entry.score} (Time: ${entry.time.toFixed(2)}s)
            `;
            leaderboardList.appendChild(li);
        });
        
    } catch (error) {
        console.error(error);
        leaderboardList.innerHTML = `<li>Error loading leaderboard.</li>`;
    }
}