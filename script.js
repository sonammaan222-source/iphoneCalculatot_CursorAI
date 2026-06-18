const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const buttons = document.querySelectorAll(".btn");

let currentValue = "0";
let previousValue = "";
let operator = null;
let shouldResetDisplay = false;
let lastOperator = null;

function updateDisplay() {
  displayEl.textContent = formatDisplay(currentValue);
  expressionEl.textContent = previousValue && operator
    ? `${formatDisplay(previousValue)} ${getOperatorSymbol(operator)}`
    : "";

  const len = currentValue.replace(".", "").replace("-", "").length;
  displayEl.classList.remove("small", "smaller");
  if (len > 9) displayEl.classList.add("smaller");
  else if (len > 6) displayEl.classList.add("small");
}

function formatDisplay(value) {
  if (value === "Error") return value;
  if (value.includes("e")) return value;

  const num = parseFloat(value);
  if (isNaN(num)) return "0";

  const parts = value.split(".");
  if (parts.length === 2) {
    const intPart = formatInteger(parts[0]);
    return `${intPart}.${parts[1]}`;
  }

  return formatInteger(value);
}

function formatInteger(value) {
  const negative = value.startsWith("-");
  const abs = negative ? value.slice(1) : value;
  const formatted = abs.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? `-${formatted}` : formatted;
}

function getOperatorSymbol(op) {
  const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  return symbols[op] || op;
}

function setOperatorActive(activeOp) {
  document.querySelectorAll(".btn-operator[data-action='operator']").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === activeOp);
  });
}

function inputNumber(digit) {
  if (shouldResetDisplay) {
    currentValue = digit;
    shouldResetDisplay = false;
  } else {
    if (currentValue === "0" && digit !== "0") {
      currentValue = digit;
    } else if (currentValue !== "0") {
      if (currentValue.replace(".", "").length >= 9) return;
      currentValue += digit;
    }
  }
  updateDisplay();
}

function inputDecimal() {
  if (shouldResetDisplay) {
    currentValue = "0.";
    shouldResetDisplay = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function handleOperator(op) {
  if (operator && !shouldResetDisplay) {
    calculate();
  }

  previousValue = currentValue;
  operator = op;
  shouldResetDisplay = true;
  setOperatorActive(op);
  updateDisplay();
}

function calculate() {
  if (!operator || previousValue === "") return;

  const prev = parseFloat(previousValue);
  const curr = parseFloat(currentValue);
  let result;

  switch (operator) {
    case "+": result = prev + curr; break;
    case "-": result = prev - curr; break;
    case "*": result = prev * curr; break;
    case "/":
      if (curr === 0) {
        currentValue = "Error";
        reset();
        updateDisplay();
        return;
      }
      result = prev / curr;
      break;
    default: return;
  }

  result = Math.round(result * 1e10) / 1e10;
  currentValue = String(result);
  lastOperator = operator;
  operator = null;
  previousValue = "";
  shouldResetDisplay = true;
  setOperatorActive(null);
  updateDisplay();
}

function reset() {
  operator = null;
  previousValue = "";
  shouldResetDisplay = true;
  setOperatorActive(null);
}

function clear() {
  currentValue = "0";
  reset();
  updateDisplay();
}

function toggleSign() {
  if (currentValue === "0" || currentValue === "Error") return;
  currentValue = currentValue.startsWith("-")
    ? currentValue.slice(1)
    : `-${currentValue}`;
  updateDisplay();
}

function percent() {
  if (currentValue === "Error") return;
  currentValue = String(parseFloat(currentValue) / 100);
  updateDisplay();
}

function handleAction(action, value) {
  switch (action) {
    case "number": inputNumber(value); break;
    case "decimal": inputDecimal(); break;
    case "operator": handleOperator(value); break;
    case "equals": calculate(); break;
    case "clear": clear(); break;
    case "toggle-sign": toggleSign(); break;
    case "percent": percent(); break;
  }
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    handleAction(btn.dataset.action, btn.dataset.value);
  });
});

document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key >= "0" && key <= "9") handleAction("number", key);
  else if (key === ".") handleAction("decimal");
  else if (key === "+") handleAction("operator", "+");
  else if (key === "-") handleAction("operator", "-");
  else if (key === "*") handleAction("operator", "*");
  else if (key === "/") { e.preventDefault(); handleAction("operator", "/"); }
  else if (key === "Enter" || key === "=") handleAction("equals");
  else if (key === "Escape") handleAction("clear");
  else if (key === "Backspace") {
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = "0";
    }
    updateDisplay();
  }
});

updateDisplay();
