/* Nourhan: button events, keyboard input and DOM display updates. */

export function updateDisplay(state) {
  const display = document.getElementById('calculator-display');
  const expressionEl = document.getElementById('calculator-expression');

  if (!display) {
    return;
  }

  if (expressionEl) {
    expressionEl.textContent = state.expressionHistory ?? '';
  }

  // While the user is actively building an expression, show it in the main
  // display. After equals (or on error) fall back to currentInput.
  const showExpression =
    !state.hasError && state.expression && state.expression.trim() !== '';

  const text = showExpression
    ? state.expression.trim()
    : String(state.currentInput);

  display.textContent = text;

  // Always start at max size, then shrink proportionally only if the text
  // overflows the container — so text fills as much width as possible.
  display.style.fontSize = '2rem';
  if (display.scrollWidth > display.clientWidth) {
    const scale = display.clientWidth / display.scrollWidth;
    display.style.fontSize = `${(2 * scale).toFixed(3)}rem`;
  }
}

export function setupCalculatorInput(handlers) {
  function updateFromState(state) {
    if (state && 'currentInput' in state) {
      updateDisplay(state);
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
