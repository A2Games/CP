// js/script.js

// --- Configurações iniciais ---
const MAX_HINTS = { emoji: 5, letter: 5, text: 5 };
let hints = {
  emoji: MAX_HINTS.emoji,
  letter: MAX_HINTS.letter,
  text: MAX_HINTS.text,
  emojiUsed: 0,
  letterUsed: 0,
  textUsed: 0
};
let phase = 1;
let selectedCells = [];

// Índice da palavra ativa na fase
let currentIndex = 0;

// --- Helpers de seleção ---
const $ = s => document.querySelector(s);
const $all = s => document.querySelectorAll(s);

// --- Mapeamento de seletores do DOM ---
const DOM = {
  emojiCount    : '#emojiHintCount',
  letterCount   : '#letterHintCount',
  textCount     : '#textHintCount',
  phaseDisplay  : '#phase',
  remainingWords: '#remainingWords',
  hintsList     : '.hint',
  hintsDetail   : '.hint2',
  emojis        : '.emojis',
  grid          : '.grid',
  emojiBtn      : '#emojiHintBtn',
  letterBtn     : '#letterHintBtn',
  textBtn       : '#textHintBtn',
  addTimeBtn    : '#addTimeBtn'
};

// Função de alerta único (showAlertSingle)
function showAlertSingle(message) {
  const container = document.querySelector('.alert-container');
  if (!container) return;
  container.innerHTML = '';
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert');
  alertDiv.textContent = message;
  container.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 6000);
}

// Disponibiliza globalmente para os módulos de dica
window.hints         = hints;
window.MAX_HINTS     = MAX_HINTS;
window.DOM           = DOM;
window.currentIndex  = currentIndex;

// --- Atualiza contadores de dicas na UI e estado dos botões ---
function updateHintCounters() {
  const totalWords = window.currentWords?.length || 0;
  // Exibe o saldo global restante
  $(DOM.emojiCount).innerText  = hints.emoji;
  $(DOM.letterCount).innerText = hints.letter;
  $(DOM.textCount).innerText   = hints.text;

  // Calcula disponibilidade por fase e global
  const avail = {
    emoji: Math.min(hints.emoji,  totalWords - hints.emojiUsed),
    letter: Math.min(hints.letter, totalWords - hints.letterUsed),
    text:   Math.min(hints.text,   totalWords - hints.textUsed)
  };

  // Habilita/desabilita botões conforme disponibilidade
  [[DOM.emojiBtn, avail.emoji], [DOM.letterBtn, avail.letter], [DOM.textBtn, avail.text]]
    .forEach(([selector, count]) => {
      const btn = $(selector);
      if (!btn) return;
      btn.disabled = count <= 0;
      btn.style.opacity = count > 0 ? '1' : '0.5';
    });
}
window.updateHintCounters = updateHintCounters;

// --- Configurações de fase e dificuldade ---
function getGridSize(p) {
  return Math.min(4 + Math.floor((p - 1) / 5), 15);
}
function getDifficultySettings(p) {
  if (p < 10)  return { count: 1, sets: [2] };
  if (p < 20)  return { count: 1, sets: [2, 3] };
  if (p < 30)  return { count: 2, sets: [3, 4] };
  if (p < 40)  return { count: 2, sets: [4, 5] };
  if (p < 50)  return { count: 3, sets: [5, 6] };
  if (p < 60)  return { count: 3, sets: [6, 7] };
  if (p < 70)  return { count: 4, sets: [7, 8] };
  if (p < 80)  return { count: 4, sets: [8, 9] };
  if (p < 90)  return { count: 5, sets: [9, 10] };
  if (p < 100) return { count: 5, sets: [10] };
  return { count: 5, sets: [10] };
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
function getWordsForPhase(p) {
  const { count, sets } = getDifficultySettings(p);
  const pool = sets.flatMap(len => wordDatabase[len] || []);
  return shuffle(pool).slice(0, count);
}

// --- Geração e renderização do grid ---
function generateGrid(size, words) {
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  function canPlace(w, r, c, dx, dy) {
    return [...w].every((ch, i) => {
      const rr = r + i * dy, cc = c + i * dx;
      return rr < size && cc < size && (!grid[rr][cc] || grid[rr][cc] === ch);
    });
  }
  function placeWord(obj) {
    const w = obj.word.toUpperCase();
    for (let i = 0; i < 100; i++) {
      const [dx, dy] = [[1,0],[0,1]][Math.random() < 0.5 ? 0 : 1];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (canPlace(w, r, c, dx, dy)) {
        [...w].forEach((ch, idx) => grid[r + idx*dy][c + idx*dx] = ch);
        break;
      }
    }
  }
  words.forEach(placeWord);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return grid.map(row => row.map(cell => cell || alphabet[Math.floor(Math.random()*26)]));
}
function renderGrid(gridData) {
  const container = $(DOM.grid);
  container.style.setProperty('--grid-size', gridData.length);
  container.innerHTML = '';
  gridData.forEach((row, i) => row.forEach((ch, j) => {
    const cell = document.createElement('div');
    cell.innerText = ch;
    cell.dataset.row = i;
    cell.dataset.col = j;
    container.appendChild(cell);
  }));
}

// --- Seleção de células e validação de palavras ---
function attachSelection() {
  selectedCells = [];
  const maxLen = Math.max(...window.currentWords.map(o => o.word.length));
  $all(`${DOM.grid} div`).forEach(cell => {
    cell.classList.remove('selected');
    cell.onclick = () => {
      if (cell.classList.contains('selected')) return;
      cell.classList.add('selected');
      selectedCells.push(cell);
      const formed = selectedCells.map(c => c.innerText).join('');
      const rev = formed.split('').reverse().join('');
      const found = window.currentWords.find(o =>
        o.word.toUpperCase() === formed || o.word.toUpperCase() === rev
      );
      if (found) return onWordFound(found.word);
      if (formed.length >= maxLen) {
        selectedCells.forEach(c => c.classList.remove('selected'));
        selectedCells = [];
        loseLife();
      }
    };
  });
}

// --- Ação ao encontrar palavra ---
function onWordFound(word) {
  showAlertSingle(`Você encontrou a palavra ${word}!`);
  window.currentIndex++;
  const remaining = window.currentWords.length - window.currentIndex;
  $(DOM.remainingWords).innerText = remaining;

  selectedCells.forEach(c => c.classList.remove('selected'));
  selectedCells = [];

  if (window.currentIndex < window.currentWords.length) {
    // resetar usos de dica para nova palavra
    hints.emojiUsed  = 0;
    hints.letterUsed = 0;
    hints.textUsed   = 0;

    updateHintCounters();

    // Atualiza a dica da palavra ativa
    const nextWord = window.currentWords[window.currentIndex];
    $(DOM.hintsList).innerHTML = `💬 ${nextWord.hint}`;
    $(DOM.emojis).classList.remove('active');
    $(DOM.emojis).innerHTML = '';
    $(DOM.hintsDetail).innerHTML = '';

    // Renderiza apenas próxima palavra
    renderGrid(generateGrid(getGridSize(phase), [nextWord]));
    attachSelection();
  } else {
    loadPhase(++phase);
  }
}

// --- Carregamento de fase ---
function loadPhase(p) {
  const words = getWordsForPhase(p);
  window.currentWords = words;
  window.currentIndex = 0;

  hints.emojiUsed = 0;
  hints.letterUsed = 0;
  hints.textUsed   = 0;

  $(DOM.phaseDisplay).innerText     = p;
  $(DOM.remainingWords).innerText   = words.length;

  // Renderiza apenas dica da primeira palavra
  $(DOM.hintsList).innerHTML        = `💬 ${words[0].hint}`;

  $(DOM.emojis).classList.remove('active');
  $(DOM.emojis).innerHTML           = '';
  $(DOM.hintsDetail).innerHTML      = '';

  updateHintCounters();
  renderGrid(generateGrid(getGridSize(p), [words[0]]));
  attachSelection();
  createTimeBar();
  startTimerForPhase(p);
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  updateLivesDisplay();
  document.querySelector(DOM.emojiBtn)?.addEventListener('click', emojiHint);
  document.querySelector(DOM.letterBtn)?.addEventListener('click', letterHint);
  document.querySelector(DOM.textBtn)?.addEventListener('click', textHint);
  document.querySelector(DOM.addTimeBtn)?.addEventListener('click', addExtraTime);
  loadPhase(phase);
});
