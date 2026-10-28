// Nkheso: operations, decimal validation, rounding and division-by-zero errors.
// Implement and export the math functions documented in docs/interfaces.md.
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
    throw new Error("Nice try! You can't divide by zero.");
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

  return Number(value.toPrecision(10));
}

export function canAddDecimal(currentInput) {
  return !String(currentInput).includes('.');
}
