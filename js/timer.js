// js/timer.js

let timerIntervalId;
let currentIdx = 0;
let lastIntervalMs = 0;

// **Torna o contador global** para sincronizar com addTimeHint.js
window.addTimeLeft = 0;

// Inicializa contador de usos de “+tempo”
document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('addTimeCount');
  window.addTimeLeft = parseInt(countEl?.innerText, 10) || 0;
});

/**
 * Cria a barra de tempo com 20 segmentos.
 */
function createTimeBar() {
  const bar = document.getElementById('timeBar');
  bar.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    bar.appendChild(document.createElement('span'));
  }
}

/**
 * Inicia o cronômetro para cada fase.
 */
function startTimerForPhase(phase) {
  // limpa timer
  clearInterval(timerIntervalId);
  createTimeBar();

  const segments = Array.from(document.querySelectorAll('#timeBar span'));
  currentIdx = 0;
  segments.forEach(s => s.className = '');
  segments[0].classList.add('current');

  // calcula intervalo
  const diff = getDifficultySettings(phase);
  const extra = window.currentWords.filter(w => w.word.length >= 7).length * 5;
  const totalTime = 30 + diff.count * 10 + extra;
  lastIntervalMs = (totalTime / segments.length) * 1000;
  document.documentElement.style.setProperty('--last-interval', `${lastIntervalMs}ms`);

  timerIntervalId = setInterval(() => {
    segments[currentIdx].classList.remove('current', 'pulse');
    segments[currentIdx].classList.add('dimmed');

    currentIdx++;
    if (currentIdx === 15) window.dispatchEvent(new Event('lifeCritical'));
    if (currentIdx > 15)  window.dispatchEvent(new Event('lifeBeat'));

    if (segments[currentIdx]) {
      segments[currentIdx].classList.add('current');
      if (segments.length - currentIdx <= 5) segments[currentIdx].classList.add('pulse');
    } else {
      clearInterval(timerIntervalId);
      window.dispatchEvent(new Event('timerEnded'));
    }
  }, lastIntervalMs);
}

/**
 * Retoma o timer após dica de tempo.
 */
function resumeTimer() {
  clearInterval(timerIntervalId);
  const segments = Array.from(document.querySelectorAll('#timeBar span'));
  timerIntervalId = setInterval(() => {
    segments[currentIdx].classList.remove('current', 'pulse');
    segments[currentIdx].classList.add('dimmed');
    currentIdx++;
    if (segments[currentIdx]) {
      segments[currentIdx].classList.add('current');
      if (segments.length - currentIdx <= 5) segments[currentIdx].classList.add('pulse');
    } else {
      clearInterval(timerIntervalId);
      window.dispatchEvent(new Event('timerEnded'));
      document.dispatchEvent(new Event('timerEnded'));
    }
  }, lastIntervalMs);
}
