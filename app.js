const passages = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "In the middle of difficulty lies opportunity."
];

const passageDisplay = document.getElementById('text-passage');
const textarea = document.getElementById('user-input');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartButton = document.getElementById('restart-button');

let currentPassage = '';
let startTime = null;
let timerInterval = null;
let isFinished = false;
let elapsedAtStop = null;

function initTest() {
    currentPassage = pickRandomPassage();
    textarea.value = '';
    textarea.disabled = false;
    textarea.focus();
    isFinished = false;
    startTime = null;
    elapsedAtStop = null;
    clearInterval(timerInterval);
    timerInterval = null;
    updateTimerDisplay(0);
    updateWpmDisplay(0);
    updateAccuracyDisplay(100);
    renderPassage('');
}

function pickRandomPassage() {
    const index = Math.floor(Math.random() * passages.length);
    return passages[index];
}

function updateTimerDisplay(seconds) {
    timerDisplay.textContent = `Time: ${seconds.toFixed(1)}s`;
}

function updateWpmDisplay(wpm) {
    const safeWpm = Number.isFinite(wpm) && wpm >= 0 ? Math.round(wpm) : 0;
    wpmDisplay.textContent = `WPM: ${safeWpm}`;
}

function updateAccuracyDisplay(accuracy) {
    const bounded = Math.max(0, Math.min(accuracy, 100));
    accuracyDisplay.textContent = `Accuracy: ${Math.round(bounded)}%`;
}

function startTimer() {
    startTime = performance.now();
    elapsedAtStop = null;
    timerInterval = setInterval(() => {
        const elapsedSeconds = getElapsedSeconds();
        updateTimerDisplay(elapsedSeconds);
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (startTime) {
        if (elapsedAtStop === null) {
            elapsedAtStop = (performance.now() - startTime) / 1000;
        }
        updateTimerDisplay(elapsedAtStop);
    }
}

function getElapsedSeconds() {
    if (elapsedAtStop !== null) {
        return elapsedAtStop;
    }
    if (!startTime) {
        return 0;
    }
    return (performance.now() - startTime) / 1000;
}

function handleInput() {
    const userText = textarea.value;

    if (!isFinished && !startTime) {
        startTimer();
    }

    renderPassage(userText);
    updateStats(userText);

    if (!isFinished && userText.length >= currentPassage.length) {
        isFinished = true;
        stopTimer();
    }
}

function updateStats(userText) {
    const elapsedSeconds = getElapsedSeconds();
    const passageChars = currentPassage.split('');
    const inputChars = userText.split('');

    const correctChars = passageChars.reduce((total, char, index) => {
        return total + (inputChars[index] === char ? 1 : 0);
    }, 0);

    const accuracy = passageChars.length === 0 ? 100 : (correctChars / passageChars.length) * 100;
    updateAccuracyDisplay(accuracy);

    const minutes = elapsedSeconds / 60;
    const wordsTyped = correctChars / 5;
    const wpm = minutes > 0 ? wordsTyped / minutes : 0;
    updateWpmDisplay(wpm);
}

function renderPassage(userText) {
    const passageChars = currentPassage.split('');
    const inputChars = userText.split('');

    const highlighted = passageChars.map((char, index) => {
        let className = 'remaining';

        if (inputChars[index] !== undefined) {
            className = inputChars[index] === char ? 'correct' : 'wrong';
        }

        const safeChar = char === ' ' ? '&nbsp;' : char;
        return `<span class="${className}">${safeChar}</span>`;
    }).join('');

    let extras = '';
    if (inputChars.length > passageChars.length) {
        extras = inputChars.slice(passageChars.length)
            .map(char => {
                const safeChar = char === ' ' ? '&nbsp;' : char;
                return `<span class="wrong">${safeChar}</span>`;
            })
            .join('');
    }

    passageDisplay.innerHTML = highlighted + extras;
}

textarea.addEventListener('input', handleInput);
restartButton.addEventListener('click', initTest);

initTest();
