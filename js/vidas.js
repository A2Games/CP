// js/vidas.js

let lives = 3;
const maxLives = 3;
let lifeCriticalFired = false;

/** Atualiza visualização das vidas:
 * ❤️ vida disponível
 * 💔 vida crítica após 15 barrinhas
 * 🤍 vida perdida
 */
function updateLivesDisplay() {
  const container = document.getElementById('livesContainer');
  container.innerHTML = '';
  for (let i = 0; i < maxLives; i++) {
    const span = document.createElement('span');
    span.classList.add('life');
    span.classList.remove('critical');
    if (i < lives) {
      // vida atual
      if (lifeCriticalFired && i === lives - 1) {
        span.textContent = '💔';
        span.classList.add('critical');
      } else {
        span.textContent = '❤️';
      }
    } else {
      span.textContent = '🤍';
    }
    container.appendChild(span);
  }
}

/** Marca vida crítica ao atingir 15 segmentos */
function markLifeCritical() {
  lifeCriticalFired = true;
  updateLivesDisplay();
}

/** Perde uma vida ou finaliza jogo */
function loseLife() {
  // Para o timer atual
  if (typeof timerIntervalId !== 'undefined') clearInterval(timerIntervalId);
  // Reseta indicador de vida crítica
  lifeCriticalFired = false;
  // Decrementa vida
  lives = Math.max(0, lives - 1);
  updateLivesDisplay();

  if (lives > 0) {
    showAlertSingle(`Você perdeu uma vida! Continuando na fase ${phase}.`);
    // Reinicia a fase atual
    if (typeof loadPhase === 'function') loadPhase(phase);
  } else {
    // Game over: reinicia jogo completo automaticamente
    showAlertSingle('Game Over! Reiniciando...');
    resetGame();
  }
}

/** Restaura jogo para estado inicial e carrega fase 1 */
function resetGame() {
  // Para qualquer timer existente
  if (typeof timerIntervalId !== 'undefined') clearInterval(timerIntervalId);
  // Recarrega página para reiniciar tudo
  window.location.reload();
}

// Eventos vinculados

window.addEventListener('timerEnded', loseLife);
document.addEventListener('timerEnded', loseLife);
document.addEventListener('DOMContentLoaded', updateLivesDisplay);
window.addEventListener('lifeCritical', markLifeCritical);
// assegura listener para lifeBeat, se existir
if (typeof pulseLife === 'function') {
  window.addEventListener('lifeBeat', pulseLife);
}
