/* Nourhan: button events, keyboard input and DOM display updates. */

export function updateDisplay(value) {
  const display = document.getElementById('calculator-display');

  if (!display) {
    return;
  }

  display.textContent = String(value);
}

export function setupCalculatorInput(handlers) {
  function updateFromState(state) {
    if (state && 'currentInput' in state) {
      updateDisplay(state.currentInput);
    }
  }

  function runHandler(action, value) {
    const handlerMap = {
      digit: () => handlers.handleDigit?.(value),
      operator: () => handlers.handleOperator?.(value),
      equals: () => handlers.handleEquals?.(),
      decimal: () => handlers.handleDecimal?.(),
      clear: () => handlers.clearCalculator?.(),
      backspace: () => handlers.backspace?.(),
    };

    const handler = handlerMap[action];

    if (!handler) {
      return;
    }

    const state = handler();
    updateFromState(state);
  }

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest('button[data-action]');

    if (!button) {
      return;
    }

    runHandler(button.dataset.action, button.dataset.value);
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;

    if (
      !(target instanceof Element) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
      target.closest('button')
    ) {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      runHandler('digit', event.key);
      return;
    }

    const keyboardActions = {
      '+': ['operator', '+'],
      '-': ['operator', '-'],
      '*': ['operator', '*'],
      '/': ['operator', '/'],
      Enter: ['equals'],
      '=': ['equals'],
      '.': ['decimal'],
      ',': ['decimal'],
      Backspace: ['backspace'],
      Escape: ['clear'],
    };

    const action = keyboardActions[event.key];

    if (!action) {
      return;
    }

    event.preventDefault();
    runHandler(action[0], action[1]);
  });
}
