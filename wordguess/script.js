const WORDS = [
  { word: "javascript", category: "Technology", hint: "A popular programming language." },
  { word: "browser", category: "Technology", hint: "You use this to visit websites." },
  { word: "keyboard", category: "Technology", hint: "You type with this." },
  { word: "internet", category: "Technology", hint: "A global network connecting computers." },
  { word: "mountain", category: "Nature", hint: "A very tall natural elevation." },
  { word: "elephant", category: "Animals", hint: "The largest land animal." },
  { word: "penguin", category: "Animals", hint: "A flightless bird that loves cold climates." },
  { word: "dolphin", category: "Animals", hint: "A highly intelligent marine mammal." },
  { word: "guitar", category: "Music", hint: "A stringed musical instrument." },
  { word: "piano", category: "Music", hint: "An instrument with black and white keys." },
  { word: "football", category: "Sports", hint: "A sport played with a ball and two goals." },
  { word: "basketball", category: "Sports", hint: "A sport where players shoot into a hoop." },
  { word: "cricket", category: "Sports", hint: "A bat-and-ball game popular around the world." },
  { word: "chocolate", category: "Food", hint: "A sweet treat made from cocoa." },
  { word: "hamburger", category: "Food", hint: "A popular food served in a bun." },
  { word: "pizza", category: "Food", hint: "A round dish usually topped with cheese." },
  { word: "rainbow", category: "Nature", hint: "A colorful arc that can appear after rain." },
  { word: "sunflower", category: "Nature", hint: "A tall flower known for following the sun." },
  { word: "library", category: "Places", hint: "A place where you can borrow books." },
  { word: "airport", category: "Places", hint: "A place where planes take off and land." },
  { word: "castle", category: "Places", hint: "A large fortified building associated with royalty." },
  { word: "adventure", category: "General", hint: "An exciting or unusual experience." },
  { word: "treasure", category: "General", hint: "Valuable things hidden or discovered." },
  { word: "rocket", category: "Space", hint: "A vehicle designed to travel beyond Earth." },
  { word: "planet", category: "Space", hint: "A large celestial body orbiting a star." }
];

const MAX_TIME = 15;
const MIN_TIME = 7;
const TIME_DECREASE_EVERY = 5;

const elements = {
  score: document.getElementById("score"),
  streak: document.getElementById("streak"),
  timer: document.getElementById("timer"),
  round: document.getElementById("round"),
  bestStreak: document.getElementById("bestStreak"),
  category: document.getElementById("category"),
  scrambledWord: document.getElementById("scrambledWord"),
  hint: document.getElementById("hint"),
  progressBar: document.getElementById("progressBar"),
  guessForm: document.getElementById("guessForm"),
  guessInput: document.getElementById("guessInput"),
  message: document.getElementById("message"),
  keyboard: document.getElementById("keyboard"),
  restartButton: document.getElementById("restartButton")
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

let currentWord = null;
let score = 0;
let streak = 0;
let bestStreak = Number(localStorage.getItem("wordGameBestStreak")) || 0;
let round = 1;
let timeLeft = MAX_TIME;
let timerId = null;
let acceptingInput = true;
let usedWords = new Set();

function shuffleWord(word) {
  let shuffled = word;

  while (shuffled === word && word.length > 1) {
    shuffled = word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  return shuffled;
}

function getRoundTime() {
  // Difficulty increases every five rounds, down to a seven-second minimum.
  const level = Math.floor((round - 1) / TIME_DECREASE_EVERY);
  return Math.max(MIN_TIME, MAX_TIME - level);
}

function getRandomWord() {
  const available = WORDS.filter(({ word }) => !usedWords.has(word));

  if (available.length === 0) {
    usedWords.clear();
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

function updateStats() {
  elements.score.textContent = score;
  elements.streak.textContent = streak;
  elements.round.textContent = round;
  elements.bestStreak.textContent = bestStreak;
}

function setMessage(text, type = "") {
  elements.message.textContent = text;
  elements.message.className = `message${type ? ` ${type}` : ""}`;
}

function updateTimerDisplay() {
  elements.timer.textContent = Math.ceil(timeLeft);
  elements.timer.classList.remove("warning", "danger");

  if (timeLeft <= 5) {
    elements.timer.classList.add("danger");
  } else if (timeLeft <= 8) {
    elements.timer.classList.add("warning");
  }

  const percentage = Math.max(0, Math.min(100, (timeLeft / getRoundTime()) * 100));
  elements.progressBar.style.width = `${percentage}%`;
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();

  const startedAt = performance.now();

  timerId = setInterval(() => {
    const elapsed = (performance.now() - startedAt) / 1000;
    timeLeft = Math.max(0, getRoundTime() - elapsed);

    updateTimerDisplay();

    if (timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 50);
}

function createKeyboard() {
  elements.keyboard.innerHTML = "";

  alphabet.forEach((letter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "key";
    button.textContent = letter;
    button.dataset.letter = letter.toLowerCase();
    button.addEventListener("click", () => {
      if (!acceptingInput) return;
      elements.guessInput.value += letter.toLowerCase();
      elements.guessInput.focus();
    });

    elements.keyboard.appendChild(button);
  });
}

function setKeyboardDisabled(disabled) {
  elements.keyboard.querySelectorAll(".key").forEach((button) => {
    button.disabled = disabled;
  });
}

function markKeyboardAnswer(answer) {
  elements.keyboard.querySelectorAll(".key").forEach((button) => {
    if (answer.includes(button.dataset.letter)) {
      button.disabled = true;
    }
  });
}

function loadRound() {
  stopTimer();

  currentWord = getRandomWord();
  usedWords.add(currentWord.word);

  timeLeft = getRoundTime();
  acceptingInput = true;

  elements.category.textContent = currentWord.category;
  elements.scrambledWord.textContent = shuffleWord(currentWord.word);
  elements.hint.textContent = currentWord.hint;
  elements.guessInput.value = "";

  setKeyboardDisabled(false);
  updateTimerDisplay();
  setMessage("");

  requestAnimationFrame(() => {
    elements.scrambledWord.classList.remove("pop");
    void elements.scrambledWord.offsetWidth;
    elements.scrambledWord.classList.add("pop");
  });

  elements.guessInput.focus();
  startTimer();
}

function calculatePoints() {
  const timeBonus = Math.ceil(timeLeft);
  const streakBonus = Math.min(streak * 5, 50);
  return 100 + (timeBonus * 5) + streakBonus;
}

function handleCorrectGuess() {
  stopTimer();
  acceptingInput = false;

  const points = calculatePoints();

  score += points;
  streak += 1;

  if (streak > bestStreak) {
    bestStreak = streak;
    localStorage.setItem("wordGameBestStreak", String(bestStreak));
  }

  updateStats();
  markKeyboardAnswer(currentWord.word);
  setMessage(`Correct! +${points} points`, "success");

  elements.scrambledWord.classList.add("pop");

  setTimeout(() => {
    round += 1;
    updateStats();
    loadRound();
  }, 850);
}

function handleWrongGuess() {
  streak = 0;
  updateStats();

  elements.guessForm.classList.remove("shake");
  void elements.guessForm.offsetWidth;
  elements.guessForm.classList.add("shake");

  setMessage("Not quite. Try again!", "error");
}

function handleTimeout() {
  if (!acceptingInput) return;

  acceptingInput = false;
  streak = 0;
  updateStats();
  setKeyboardDisabled(true);

  setMessage(`Time's up! The word was "${currentWord.word}".`, "error");

  setTimeout(() => {
    round += 1;
    updateStats();
    loadRound();
  }, 1200);
}

function submitGuess() {
  if (!acceptingInput || !currentWord) return;

  const guess = elements.guessInput.value.trim().toLowerCase();

  if (!guess) {
    setMessage("Enter a word first.", "info");
    elements.guessInput.focus();
    return;
  }

  if (guess === currentWord.word) {
    handleCorrectGuess();
  } else {
    handleWrongGuess();
    elements.guessInput.select();
  }
}

function restartGame() {
  stopTimer();

  score = 0;
  streak = 0;
  round = 1;
  timeLeft = MAX_TIME;
  acceptingInput = true;
  usedWords.clear();

  updateStats();
  loadRound();
}

elements.guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitGuess();
});

elements.restartButton.addEventListener("click", restartGame);

elements.guessInput.addEventListener("input", () => {
  elements.guessInput.value = elements.guessInput.value
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
});

document.addEventListener("keydown", (event) => {
  if (!acceptingInput) return;

  if (event.key === "Escape") {
    elements.guessInput.value = "";
    elements.guessInput.focus();
  }
});

createKeyboard();
updateStats();
loadRound();
