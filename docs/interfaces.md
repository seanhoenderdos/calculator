# Proposed calculator interfaces

These conventions come from the team's proposal. The display and expression HTML
is in place, and the controller implements state, digit entry, operator selection,
equals, chained calculations, error handling, backspace and clear. The math module
is implemented. Decimal entry and the input module are still planned interfaces.

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
- `handleOperator(operator)`
- `handleEquals()`
- `backspace()`
- `clearCalculator()`

All handlers return an updated state snapshot. The initial state, also restored
by clear, is:

```json
{
  "currentInput": "0",
  "firstOperand": null,
  "operator": null,
  "waitingForNextOperand": false,
  "hasError": false
}
```

Digit entry accepts a single digit as a string or number, replaces the initial
zero and ignores invalid input. Snapshots can be read or modified by callers
without changing the controller's internal state. DOM updates will be connected
during integration.

Operator selection accepts `+`, `-`, `*` and `/`, stores the first operand as a
number and waits for the next operand. The next digit starts a fresh input.
Selecting another operator before entering that operand replaces the operator.
Selecting an operator after entering the second operand calculates the current
pair and uses the result as the next first operand. Chained calculations run from
left to right.

Equals completes a pending operation using the math module's `operate` and
`formatResult` functions. It leaves the current input unchanged when there is no
operator or no second operand yet. After a result, a digit starts a fresh entry,
while an operator continues with that result. Repeated equals leaves the result
unchanged.

Calculation errors return a snapshot with `hasError: true`, the error message in
`currentInput`, and no pending operand or operator. Division-by-zero messages come
from the math module; out-of-range calculations also produce an error message.
Clear, backspace or a valid digit recovers from the error. Other operators and
equals leave the error message visible until recovery.

Backspace removes the last digit from the current input, falling back to `'0'`.
While waiting for the next operand, it leaves the stored first operand unchanged.
It also leaves a completed result unchanged until a fresh entry starts.

Remaining planned controller functions:

- `handleDecimal()`

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

The math module exports the following functions:

- `add(a, b)`
- `subtract(a, b)`
- `multiply(a, b)`
- `divide(a, b)`
- `operate(operator, a, b)` returns the calculation result.
- `formatResult(value)` returns a number rounded to 10 significant digits.
- `canAddDecimal(currentInput)` returns `true` or `false`.

Division by zero throws an error for the controller to catch.

Math functions can be tested in the browser console using a dynamic module import
while serving the project over HTTP:

```js
const math = await import('./js/math.js');
math.add(2, 3);
```

### Shared: `js/main.js`

This is the module entry point loaded by `index.html`. Connect the implemented
modules here during integration. Keep the public function names coordinated;
additional internal helper functions are welcome.

During integration, pass the controller snapshot's `currentInput` to
`updateDisplay(value)`. The optional expression display's update interface still
needs to be coordinated.
