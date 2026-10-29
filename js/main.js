import {
  backspace,
  clearCalculator,
  handleDecimal,
  handleDigit,
  handleEquals,
  handleOperator,
} from './calculator.js';
import { setupCalculatorInput } from './input.js';

setupCalculatorInput({
  handleDigit,
  handleOperator,
  handleEquals,
  handleDecimal,
  clearCalculator,
  backspace,
});
