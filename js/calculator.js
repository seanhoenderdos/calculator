import { operate, formatResult, canAddDecimal } from './math.js';

const initialState = {
  currentInput: '0',
  firstOperand: null,
  operator: null,
  waitingForNextOperand: false,
  hasError: false,
  expression: '',
  expressionHistory: '',
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
    // Preserve the expression that caused the error so it shows above the message.
    const failedExpression = calculatorState.expression
      ? calculatorState.expression.trim()
      : '';
    calculatorState = {
      ...initialState,
      currentInput:
        error instanceof Error
          ? error.message
          : 'That calculation went sideways. Clear and try again.',
      hasError: true,
      expressionHistory: failedExpression,
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
  const startingFresh =
    calculatorState.waitingForNextOperand ||
    calculatorState.currentInput === '0';

  calculatorState.currentInput = startingFresh
    ? digitText
    : calculatorState.currentInput + digitText;
  calculatorState.waitingForNextOperand = false;

  // Build live expression: replace trailing number segment with updated input.
  if (startingFresh) {
    calculatorState.expression = (calculatorState.expression || '') + digitText;
  } else {
    // Replace the last number in the expression with the grown input.
    calculatorState.expression = calculatorState.expression.replace(
      /[0-9.]+$/,
      calculatorState.currentInput,
    );
  }
  calculatorState.expressionHistory = '';

  return getCalculatorState();
}

export function handleDecimal() {
  if (calculatorState.hasError) {
    clearCalculator();
  }

  if (calculatorState.waitingForNextOperand) {
    calculatorState.currentInput = '0';
    calculatorState.waitingForNextOperand = false;
    calculatorState.expression += '0';
  }

  if (canAddDecimal(calculatorState.currentInput)) {
    calculatorState.currentInput += '.';
    calculatorState.expression += '.';
  }
  calculatorState.expressionHistory = '';

  return getCalculatorState();
}

/** Maps internal operator chars to the display symbol shown in the expression. */
function operatorSymbol(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] ?? op;
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
    // After chaining (e.g. 2+3*), update expression to reflect mid-result.
    calculatorState.expression = calculatorState.currentInput;
  }

  // Append the operator symbol to the expression (replace last operator if
  // the user changes their mind before typing the next operand).
  if (
    calculatorState.waitingForNextOperand &&
    calculatorState.operator !== null
  ) {
    // Replace the trailing operator symbol.
    calculatorState.expression = calculatorState.expression.replace(
      /\s*[+\-×÷]\s*$/,
      ` ${operatorSymbol(operator)} `,
    );
  } else {
    // If expression is empty (e.g. chaining after equals), seed it with the
    // current result so the full expression "11 + 6" is visible.
    if (!calculatorState.expression) {
      calculatorState.expression = calculatorState.currentInput;
    }
    calculatorState.expression += ` ${operatorSymbol(operator)} `;
  }
  calculatorState.expressionHistory = '';

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

  // Snapshot the full expression (e.g. "2 + 3") before computing.
  const completedExpression = calculatorState.expression.trim();

  if (calculatePendingOperation()) {
    calculatorState.expressionHistory = completedExpression + ' =';
    calculatorState.expression = '';
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

  const shortenedInput = calculatorState.currentInput.slice(0, -1);
  calculatorState.currentInput =
    shortenedInput === '' || shortenedInput === '-' ? '0' : shortenedInput;

  // Keep the live expression in sync.
  if (calculatorState.expression.length > 0) {
    calculatorState.expression = calculatorState.expression.slice(0, -1);
  }

  return getCalculatorState();
}

export function clearCalculator() {
  calculatorState = { ...initialState };
  return getCalculatorState();
}
