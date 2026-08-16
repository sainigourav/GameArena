const principalInput = document.getElementById("principal");
const rateInput = document.getElementById("rate");
const durationInput = document.getElementById("duration");
const durationUnit = document.getElementById("durationUnit");

const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");
const toggleScheduleButton = document.getElementById("toggleSchedule");

const totalInterestElement = document.getElementById("totalInterest");
const interestPercentageElement = document.getElementById("interestPercentage");
const resultPrincipalElement = document.getElementById("resultPrincipal");
const monthlyInterestElement = document.getElementById("monthlyInterest");
const resultDurationElement = document.getElementById("resultDuration");
const totalRepaymentElement = document.getElementById("totalRepayment");
const scheduleContainer = document.getElementById("scheduleContainer");
const scheduleBody = document.getElementById("scheduleBody");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function getValues() {
  const principal = Number(principalInput.value);
  const rate = Number(rateInput.value);
  const duration = Number(durationInput.value);

  let months = duration;

  if (durationUnit.value === "years") {
    months = duration * 12;
  }

  return {
    principal,
    rate,
    duration,
    months
  };
}

function calculate() {
  const { principal, rate, duration, months } = getValues();

  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(rate) ||
    !Number.isFinite(duration) ||
    principal <= 0 ||
    rate < 0 ||
    duration <= 0
  ) {
    showInvalidState();
    return;
  }

  const monthlyInterest = (principal / 100) * rate;

  // This is intentionally non-compounding: every month uses the original principal.
  const totalInterest = monthlyInterest * months;
  const totalRepayment = principal + totalInterest;
  const interestPercentage = (totalInterest / principal) * 100;

  totalInterestElement.textContent = formatCurrency(totalInterest);
  interestPercentageElement.textContent =
    `${formatNumber(interestPercentage)}%`;

  resultPrincipalElement.textContent = formatCurrency(principal);
  monthlyInterestElement.textContent = formatCurrency(monthlyInterest);

  resultDurationElement.textContent =
    `${formatNumber(months)} ${months === 1 ? "Month" : "Months"}`;

  totalRepaymentElement.textContent = formatCurrency(totalRepayment);

  buildSchedule(principal, monthlyInterest, months);

  scheduleContainer.classList.remove("hidden");
  toggleScheduleButton.textContent = "Hide Schedule";
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(value);
}

function buildSchedule(principal, monthlyInterest, months) {
  scheduleBody.innerHTML = "";

  const safeMonths = Math.min(Math.floor(months), 600);

  for (let month = 1; month <= safeMonths; month += 1) {
    const isFinalMonth = month === safeMonths;
    const principalPayment = isFinalMonth ? principal : 0;
    const payment = monthlyInterest + principalPayment;
    const balance = Math.max(0, principal - principalPayment);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>Month ${month}</td>
      <td>${formatCurrency(monthlyInterest)}</td>
      <td>${formatCurrency(principalPayment)}</td>
      <td>${formatCurrency(payment)}</td>
      <td>${formatCurrency(balance)}</td>
    `;

    scheduleBody.appendChild(row);
  }

  if (months > 600) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td colspan="5">
        Schedule limited to the first 600 months.
      </td>
    `;

    scheduleBody.appendChild(row);
  }
}

function showInvalidState() {
  totalInterestElement.textContent = "₹0.00";
  interestPercentageElement.textContent = "0%";
  resultPrincipalElement.textContent = "₹0.00";
  monthlyInterestElement.textContent = "₹0.00";
  resultDurationElement.textContent = "—";
  totalRepaymentElement.textContent = "₹0.00";
  scheduleBody.innerHTML = "";
  scheduleContainer.classList.add("hidden");
  toggleScheduleButton.textContent = "Show Schedule";
}

function resetCalculator() {
  principalInput.value = "100000";
  rateInput.value = "2";
  durationInput.value = "12";
  durationUnit.value = "months";

  calculate();
}

function handleDurationChange() {
  const currentValue = Number(durationInput.value);

  if (!Number.isFinite(currentValue) || currentValue <= 0) {
    return;
  }

  calculate();
}

calculateButton.addEventListener("click", calculate);

resetButton.addEventListener("click", resetCalculator);

toggleScheduleButton.addEventListener("click", () => {
  const isHidden = scheduleContainer.classList.contains("hidden");

  scheduleContainer.classList.toggle("hidden", !isHidden);
  toggleScheduleButton.textContent = isHidden
    ? "Hide Schedule"
    : "Show Schedule";
});

durationUnit.addEventListener("change", handleDurationChange);

[principalInput, rateInput, durationInput].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      calculate();
    }
  });
});

calculate();
