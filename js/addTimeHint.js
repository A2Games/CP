// js/addTimeHint.js
// Gerencia o botão de adicionar tempo extra e implementa adição de 10 barras de tempo

// Atualiza habilitação e estilo do botão conforme recursos globais e locais
function updateAddTimeButton() {
  const btn = document.getElementById('addTimeBtn');
  const countDisplay = document.getElementById('addTimeCount');
  const bar = document.getElementById('timeBar');
  const grayCount = bar ? bar.querySelectorAll('span.dimmed').length : 0;
  const hasGlobal = window.addTimeLeft > 0;
  const hasLocal = grayCount >= 10;
  const enabled = hasGlobal && hasLocal;

  if (btn) {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.5';
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }
  if (countDisplay) {
    countDisplay.textContent = window.addTimeLeft;
  }
}

// Função para adicionar tempo extra
function addExtraTime() {
  if (window.addTimeLeft <= 0) return;
  const bar = document.getElementById('timeBar');
  const gray = bar ? Array.from(bar.querySelectorAll('span.dimmed')) : [];
  if (gray.length < 10) return;

  // Remove as primeiras 10 cinza e adiciona 10 extras
  gray.slice(0, 10).forEach(s => s.remove());
  for (let i = 0; i < 10; i++) {
    const extra = document.createElement('span');
    extra.classList.add('extra');
    bar.appendChild(extra);
  }

  // Ajusta índice do timer e decrementa usos globais
  currentIdx = Math.max(0, currentIdx - 10);
  window.addTimeLeft--;

  // Retoma o timer
  if (typeof resumeTimer === 'function') resumeTimer();

  // Atualiza estado do botão e contador
  updateAddTimeButton();
}

// Observa mudanças no timeBar (inclusão/remoção de barras ou mudanças de classe)
function observeTimeBar() {
  const bar = document.getElementById('timeBar');
  if (!bar || typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(() => updateAddTimeButton());
  observer.observe(bar, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Define valor inicial se necessário
  if (typeof window.addTimeLeft === 'undefined') window.addTimeLeft = 5;

  // Configura botão e contador
  updateAddTimeButton();
  observeTimeBar();

  // Vincula listener ao botão
  const btn = document.getElementById('addTimeBtn');
  if (btn) {
    btn.addEventListener('click', addExtraTime);
  }
});
