const initialState = {
  currentInput: '0',
  firstOperand: null,
  operator: null,
  waitingForNextOperand: false,
};

const validOperators = ['+', '-', '*', '/'];

let calculatorState = { ...initialState };

export function getCalculatorState() {
  // Return a copy so callers cannot change the controller's internal state.
  return { ...calculatorState };
}

export function handleDigit(digit) {
  if (typeof digit !== 'string' && typeof digit !== 'number') {
    return getCalculatorState();
  }

  const digitText = String(digit);

  if (digitText.length !== 1 || !/^[0-9]$/.test(digitText)) {
    return getCalculatorState();
  }

  // Keep input as text to preserve digits until a calculation is requested.
  calculatorState.currentInput =
    calculatorState.waitingForNextOperand ||
    calculatorState.currentInput === '0'
      ? digitText
      : calculatorState.currentInput + digitText;
  calculatorState.waitingForNextOperand = false;

  return getCalculatorState();
}

export function handleOperator(operator) {
  if (!validOperators.includes(operator)) {
    return getCalculatorState();
  }

  if (
    calculatorState.operator !== null &&
    !calculatorState.waitingForNextOperand
  ) {
    // Preserve the pending calculation until chained calculations are added.
    return getCalculatorState();
  }

  if (!calculatorState.waitingForNextOperand) {
    calculatorState.firstOperand = Number(calculatorState.currentInput);
  }

  calculatorState.operator = operator;
  calculatorState.waitingForNextOperand = true;
  return getCalculatorState();
}

export function backspace() {
  if (calculatorState.waitingForNextOperand) {
    return getCalculatorState();
  }

  calculatorState.currentInput =
    calculatorState.currentInput.slice(0, -1) || '0';
  return getCalculatorState();
}

export function clearCalculator() {
  calculatorState = { ...initialState };
  return getCalculatorState();
}
