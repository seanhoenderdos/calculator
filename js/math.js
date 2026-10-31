// Nkheso: operations, decimal validation, rounding and division-by-zero errors.
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('cannot ÷ by 0');
  }

  return a / b;
}

export function operate(operator, a, b) {
  switch (operator) {
    case '+':
      return add(a, b);
    case '-':
      return subtract(a, b);
    case '*':
      return multiply(a, b);
    case '/':
      return divide(a, b);
    default:
      throw new Error(`Invalid operator: ${operator}`);
  }
}

export function formatResult(value) {
  if (!Number.isFinite(value)) {
    return value;
  }

  // Round to 4 decimal places, then strip trailing zeros via Number().
  return Number(value.toFixed(4));
}

export function canAddDecimal(currentInput) {
  return !String(currentInput).includes('.');
}
