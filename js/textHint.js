// js/textHint.js
function textHint() {
  const totalWords = window.currentWords.length;
  if (window.hints.text > 0 && window.hints.textUsed < totalWords) {
    const idx = window.hints.textUsed;
    window.hints.textUsed++;
    window.hints.text--;
    window.updateHintCounters();

    const hintDetail = window.currentWords[idx].hint2;
    const container = document.querySelector(window.DOM.hintsDetail);
    container.classList.add('active');
    container.innerHTML += `💬 ${hintDetail}<br>`;
  } else if (window.hints.text === 0) {
    alert(`Você já usou todas as ${window.MAX_HINTS.text} dicas de texto.`);
  } else {
    alert('Sem mais dicas para esta fase.');
  }
}
