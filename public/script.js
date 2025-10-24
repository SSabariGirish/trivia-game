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

// --- GAME STATE ---
let currentScore = 0;
let questionDeck = [];
let currentQuestionIndex = 0;
// We'll reset this list at the start of each new game
let availableCategories = []; 

// --- EVENT LISTENERS ---
startBtn.addEventListener('click', startGame);
submitTopicBtn.addEventListener('click', handleTopicSubmit);
categoryButtons.forEach(button => {
    button.addEventListener('click', handleCategorySelect);
});

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
    
    // 3. Show the first phase: Topic Input
    topicSelectionDiv.style.display = 'block';
    topicInput.value = '';
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

        if (!response.ok) { throw new Error('Failed to fetch question deck.'); }

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
                optionEl.style.backgroundColor = '#d4edda';
                
                currentScore++;
                scoreDisplay.textContent = currentScore;
                currentQuestionIndex++;
                
                setTimeout(displayNextQuestion, 1000);
                
            } else {
                // --- INCORRECT ---
                feedbackEl.textContent = `Game Over! The correct answer was: ${item.answer}`;
                feedbackEl.className = 'feedback incorrect';
                optionEl.style.backgroundColor = '#f8d7da';
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
        // "Game Over" message is already shown
    } else {
        quizContainer.innerHTML += `<h2 class="incorrect">Game Over!</h2>`;
    }
    
    // Reset and show the "Play Again" button
    startBtn.textContent = 'Play Again?';
    startBtn.style.display = 'block';
    loading.style.display = 'none';
    topicSelectionDiv.style.display = 'none';
    categorySelectionDiv.style.display = 'none';
}