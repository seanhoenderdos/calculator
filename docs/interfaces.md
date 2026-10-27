# Proposed calculator interfaces

These conventions come from the team's proposal. The display and expression HTML
is in place, and the controller implements state, digit entry and clear. The
remaining controller functions and the input and math modules are still planned
interfaces.

## HTML hooks

| ID                      | Purpose                                       | Owner   |
| ----------------------- | --------------------------------------------- | ------- |
| `calculator-display`    | Current displayed value                       | Sean    |
| `calculator-expression` | Previous number/operator display, if included | Sean    |
| `number-pad`            | Number button container                       | Nourhan |
| `operator-pad`          | Operator and utility button container         | Nkheso  |

Use `data-action` and, where needed, `data-value` on buttons:

| Button                | `data-action` | `data-value`         |
| --------------------- | ------------- | -------------------- |
| Number, for example 7 | `digit`       | `7`                  |
| Operator              | `operator`    | `+`, `-`, `*` or `/` |
| Equals                | `equals`      | Not needed           |
| Decimal               | `decimal`     | Not needed           |
| Clear                 | `clear`       | Not needed           |
| Backspace             | `backspace`   | Not needed           |

Use the literal `+`, `-`, `*` and `/` values consistently, even if the button label
uses a different visual symbol. Calculator CSS classes use the `calc-` prefix.

## JavaScript modules

### Sean: `js/calculator.js`

Implemented controller functions:

- `getCalculatorState()` returns a copy of the current state.
- `handleDigit(digit)`
- `clearCalculator()`

Both handlers return an updated state snapshot. The initial state, also restored
by clear, is:

```json
{
  "currentInput": "0",
  "firstOperand": null,
  "operator": null,
  "waitingForNextOperand": false
}
```

Digit entry accepts a single digit as a string or number, replaces the initial
zero and ignores invalid input. Snapshots can be read or modified by callers
without changing the controller's internal state. DOM updates will be connected
during integration.

Remaining planned controller functions:

- `handleOperator(operator)`
- `handleEquals()`
- `handleDecimal()`
- `backspace()`

Own calculator state, operands, operators, chained calculations, equals, clear
and backspace logic. Catch division-by-zero errors and display a snarky error
message without crashing the calculator.

### Nourhan: `js/input.js`

Export the following input functions:

- `setupCalculatorInput(handlers)` connects button and keyboard events to the
  controller functions passed in by the integration code.
- `updateDisplay(value)` updates `calculator-display`.

The proposed `handlers` object uses the controller function names above as its
keys: `handleDigit`, `handleOperator`, `handleEquals`, `handleDecimal`,
`clearCalculator` and `backspace`.

### Nkheso: `js/math.js`

Export the following mathematical functions:

- `add(a, b)`
- `subtract(a, b)`
- `multiply(a, b)`
- `divide(a, b)`
- `operate(operator, a, b)` returns the calculation result.
- `formatResult(value)` formats long decimal results.
- `canAddDecimal(currentInput)` returns `true` or `false`.

Division by zero throws an error for the controller to catch.

Math functions can be tested in the browser console using a dynamic module import
once implemented (while serving the project over HTTP):

```js
const math = await import('./js/math.js');
math.add(2, 3);
```

### Shared: `js/main.js`

This is the module entry point loaded by `index.html`. Connect the implemented
modules here during integration. Keep the public function names coordinated;
additional internal helper functions are welcome.

Before integration, agree on the remaining details, including the return type of
`formatResult`, how controller state reaches `updateDisplay`, and how the optional
expression display is updated.
