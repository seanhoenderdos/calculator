import { operate, formatResult, canAddDecimal } from './math.js';

const initialState = {
  currentInput: '0',
  firstOperand: null,
  operator: null,
  waitingForNextOperand: false,
  hasError: false,
};

const validOperators = ['+', '-', '*', '/'];
const rangeErrorMessage = 'That number is too big. Try something smaller.';

let calculatorState = { ...initialState };

function calculatePendingOperation() {
  try {
    const secondOperand = Number(calculatorState.currentInput);

    if (
      !Number.isFinite(calculatorState.firstOperand) ||
      !Number.isFinite(secondOperand)
    ) {
      throw new Error(rangeErrorMessage);
    }

    const result = formatResult(
      operate(
        calculatorState.operator,
        calculatorState.firstOperand,
        secondOperand,
      ),
    );

    if (!Number.isFinite(result)) {
      throw new Error(rangeErrorMessage);
    }

    calculatorState.currentInput = String(result);
    return true;
  } catch (error) {
    calculatorState = {
      ...initialState,
      currentInput:
        error instanceof Error
          ? error.message
          : 'That calculation went sideways. Clear and try again.',
      hasError: true,
    };
    return false;
  }
}

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

  if (calculatorState.hasError) {
    clearCalculator();
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

export function handleDecimal() {
  if (calculatorState.hasError) {
    clearCalculator();
  }

  if (calculatorState.waitingForNextOperand) {
    calculatorState.currentInput = '0';
    calculatorState.waitingForNextOperand = false;
  }

  if (canAddDecimal(calculatorState.currentInput)) {
    calculatorState.currentInput += '.';
  }

  return getCalculatorState();
}

export function handleOperator(operator) {
  if (!validOperators.includes(operator) || calculatorState.hasError) {
    return getCalculatorState();
  }

  if (
    calculatorState.operator !== null &&
    !calculatorState.waitingForNextOperand
  ) {
    if (!calculatePendingOperation()) {
      return getCalculatorState();
    }
  }

  calculatorState.firstOperand = Number(calculatorState.currentInput);
  calculatorState.operator = operator;
  calculatorState.waitingForNextOperand = true;
  return getCalculatorState();
}

export function handleEquals() {
  if (
    calculatorState.hasError ||
    calculatorState.operator === null ||
    calculatorState.waitingForNextOperand
  ) {
    return getCalculatorState();
  }

  if (calculatePendingOperation()) {
    calculatorState.firstOperand = null;
    calculatorState.operator = null;
    calculatorState.waitingForNextOperand = true;
  }

  return getCalculatorState();
}

export function backspace() {
  if (calculatorState.hasError) {
    return clearCalculator();
  }

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
