// js/letterHint.js
function letterHint() {
  const totalWords = window.currentWords.length;
  if (window.hints.letter <= 0) {
    showAlertSingle(`Você já usou todas as ${window.MAX_HINTS.letter} dicas de letra.`);
    return;
  }
  if (window.hints.letterUsed >= totalWords) {
    showAlertSingle(`Você já usou todas as ${totalWords} dicas de letra nesta fase.`);
    return;
  }

  window.hints.letterUsed++;
  window.hints.letter--;
  window.updateHintCounters();

  const firstLetters = window.currentWords.map(w => w.word.charAt(0).toUpperCase());
  document.querySelectorAll(`${window.DOM.grid} div`).forEach(cell => {
    if (firstLetters.includes(cell.innerText)) {
      cell.style.backgroundColor = 'rgba(255,255,0,0.5)';
      cell.style.borderRadius = '6px';
    }
  });
}
