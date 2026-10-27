const initialState = {
  currentInput: '0',
  firstOperand: null,
  operator: null,
  waitingForNextOperand: false,
};

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
    calculatorState.currentInput === '0'
      ? digitText
      : calculatorState.currentInput + digitText;

  return getCalculatorState();
}

export function clearCalculator() {
  calculatorState = { ...initialState };
  return getCalculatorState();
}
