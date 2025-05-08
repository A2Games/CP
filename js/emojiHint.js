// js/emojiHint.js
function emojiHint() {
  const totalWords = window.currentWords.length;
  // Bloqueia se acabou o saldo global
  if (window.hints.emoji <= 0) {
    showAlertSingle(`Você já usou todas as ${window.MAX_HINTS.emoji} dicas de emoji.`);
    return;
  }
  // Bloqueia se já usou todas as dicas desta fase
  if (window.hints.emojiUsed >= totalWords) {
    showAlertSingle(`Você já usou todas as ${totalWords} dicas de emoji nesta fase.`);
    return;
  }

  // Usa uma vez (globais e por fase)
  const idx = window.hints.emojiUsed;
  window.hints.emojiUsed++;
  window.hints.emoji--;
  window.updateHintCounters();

  const emojis = window.currentWords[idx % window.currentWords.length].emojis.join(' ');
  const container = document.querySelector(window.DOM.emojis);
  container.classList.add('active');
  container.innerHTML = `✨ ${emojis}<br>`;
}
