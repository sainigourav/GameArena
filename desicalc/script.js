const principalInput = document.getElementById("principal");
const rateInput = document.getElementById("rate");

const monthlyMode = document.getElementById("monthlyMode");
const dateMode = document.getElementById("dateMode");

const monthlyFields = document.getElementById("monthlyFields");
const dateFields = document.getElementById("dateFields");

const durationInput = document.getElementById("duration");
const durationUnit = document.getElementById("durationUnit");

const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");
const toggleScheduleButton = document.getElementById("toggleSchedule");

const totalInterestElement = document.getElementById("totalInterest");
const interestPercentageElement =
  document.getElementById("interestPercentage");

const resultPrincipalElement =
  document.getElementById("resultPrincipal");

const monthlyInterestElement =
  document.getElementById("monthlyInterest");

const dailyInterestElement =
  document.getElementById("dailyInterest");

const resultDurationElement =
  document.getElementById("resultDuration");

const durationLabel =
  document.getElementById("durationLabel");

const totalRepaymentElement =
  document.getElementById("totalRepayment");

const scheduleContainer =
  document.getElementById("scheduleContainer");

const scheduleBody =
  document.getElementById("scheduleBody");

const periodHeader =
  document.getElementById("periodHeader");

const scheduleDescription =
  document.getElementById("scheduleDescription");

const calculationFooter =
  document.getElementById("calculationFooter");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(value);
}

function getSelectedMode() {
  const selectedMode = document.querySelector(
    'input[name="calculationType"]:checked'
  );

  return selectedMode ? selectedMode.value : "date";
}

function getBaseValues() {
  return {
    principal: Number(principalInput.value),
    rate: Number(rateInput.value)
  };
}

function isValidBaseValues(principal, rate) {
  return (
    Number.isFinite(principal) &&
    Number.isFinite(rate) &&
    principal > 0 &&
    rate >= 0
  );
}

function calculateMonthly() {
  const { principal, rate } = getBaseValues();
  const duration = Number(durationInput.value);

  if (
    !isValidBaseValues(principal, rate) ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    showInvalidState();
    return;
  }

  let months = duration;

  if (durationUnit.value === "years") {
    months = duration * 12;
  }

  const monthlyInterest =
    (principal / 100) * rate;

  const dailyInterest =
    monthlyInterest / 30;

  const totalInterest =
    monthlyInterest * months;

  const totalRepayment =
    principal + totalInterest;

  const interestPercentage =
    (totalInterest / principal) * 100;

  totalInterestElement.textContent =
    formatCurrency(totalInterest);

  interestPercentageElement.textContent =
    `${formatNumber(interestPercentage)}%`;

  resultPrincipalElement.textContent =
    formatCurrency(principal);

  monthlyInterestElement.textContent =
    formatCurrency(monthlyInterest);

  dailyInterestElement.textContent =
    formatCurrency(dailyInterest);

  durationLabel.textContent =
    "Duration";

  resultDurationElement.textContent =
    `${formatNumber(months)} ${
      months === 1 ? "Month" : "Months"
    }`;

  totalRepaymentElement.textContent =
    formatCurrency(totalRepayment);

  periodHeader.textContent = "Month";

  scheduleDescription.textContent =
    "Monthly interest and principal repayment";

  calculationFooter.textContent =
    "Non-compounding interest • Monthly calculation";

  buildMonthlySchedule(
    principal,
    monthlyInterest,
    months
  );
}

function calculateDateRange() {
  const { principal, rate } = getBaseValues();

  const startDateValue =
    startDateInput.value;

  const endDateValue =
    endDateInput.value;

  if (
    !isValidBaseValues(principal, rate) ||
    !startDateValue ||
    !endDateValue
  ) {
    showInvalidState();
    return;
  }

  const startParts =
    startDateValue.split("-").map(Number);

  const endParts =
    endDateValue.split("-").map(Number);

  const start = new Date(
    startParts[0],
    startParts[1] - 1,
    startParts[2]
  );

  const end = new Date(
    endParts[0],
    endParts[1] - 1,
    endParts[2]
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    showInvalidState();
    return;
  }

  if (end < start) {
    showInvalidState();
    return;
  }

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  /*
   * Both dates are inclusive.
   *
   * 01-Jan -> 01-Jan = 1 day
   * 01-Jan -> 02-Jan = 2 days
   */
  const days =
    Math.floor(
      (end.getTime() - start.getTime()) /
      millisecondsPerDay
    ) + 1;

  /*
   * ₹2 per ₹100 per month.
   *
   * One month is treated as exactly 30 days
   * for the daily calculation.
   */
  const monthlyInterest =
    (principal / 100) * rate;

  const dailyInterest =
    monthlyInterest / 30;

  const totalInterest =
    dailyInterest * days;

  const totalRepayment =
    principal + totalInterest;

  const interestPercentage =
    (totalInterest / principal) * 100;

  totalInterestElement.textContent =
    formatCurrency(totalInterest);

  interestPercentageElement.textContent =
    `${formatNumber(interestPercentage)}%`;

  resultPrincipalElement.textContent =
    formatCurrency(principal);

  monthlyInterestElement.textContent =
    formatCurrency(monthlyInterest);

  dailyInterestElement.textContent =
    formatCurrency(dailyInterest);

  durationLabel.textContent =
    "Total Days";

  resultDurationElement.textContent =
    `${formatNumber(days)} ${
      days === 1 ? "Day" : "Days"
    }`;

  totalRepaymentElement.textContent =
    formatCurrency(totalRepayment);

  periodHeader.textContent = "Date";

  scheduleDescription.textContent =
    "Daily interest • Both dates included";

  calculationFooter.textContent =
    "Non-compounding interest • 30 days = 1 month";

  buildDateSchedule(
    principal,
    dailyInterest,
    days,
    start
  );
}

function calculate() {
  const mode = getSelectedMode();

  if (mode === "date") {
    calculateDateRange();
    return;
  }

  calculateMonthly();
}

function buildMonthlySchedule(
  principal,
  monthlyInterest,
  months
) {
  scheduleBody.innerHTML = "";

  const safeMonths =
    Math.min(Math.floor(months), 600);

  for (
    let month = 1;
    month <= safeMonths;
    month += 1
  ) {
    const isFinalMonth =
      month === safeMonths;

    const principalPayment =
      isFinalMonth ? principal : 0;

    const payment =
      monthlyInterest + principalPayment;

    const balance =
      Math.max(
        0,
        principal - principalPayment
      );

    const row =
      document.createElement("tr");

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
    addScheduleLimitMessage(
      600,
      "months"
    );
  }

  showSchedule();
}

function buildDateSchedule(
  principal,
  dailyInterest,
  days,
  start
) {
  scheduleBody.innerHTML = "";

  const safeDays =
    Math.min(days, 600);

  for (
    let index = 0;
    index < safeDays;
    index += 1
  ) {
    const currentDate =
      new Date(start);

    currentDate.setDate(
      start.getDate() + index
    );

    const isFinalDay =
      index === days - 1;

    const principalPayment =
      isFinalDay ? principal : 0;

    const payment =
      dailyInterest + principalPayment;

    const balance =
      Math.max(
        0,
        principal - principalPayment
      );

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${formatDate(currentDate)}</td>
      <td>${formatCurrency(dailyInterest)}</td>
      <td>${formatCurrency(principalPayment)}</td>
      <td>${formatCurrency(payment)}</td>
      <td>${formatCurrency(balance)}</td>
    `;

    scheduleBody.appendChild(row);
  }

  if (days > 600) {
    addScheduleLimitMessage(
      600,
      "days"
    );
  }

  showSchedule();
}

function addScheduleLimitMessage(
  limit,
  unit
) {
  const row =
    document.createElement("tr");

  row.innerHTML = `
    <td colspan="5">
      Schedule limited to the first
      ${limit} ${unit}.
    </td>
  `;

  scheduleBody.appendChild(row);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function showSchedule() {
  scheduleContainer.classList.remove(
    "hidden"
  );

  toggleScheduleButton.textContent =
    "Hide Schedule";
}

function showInvalidState() {
  totalInterestElement.textContent =
    "₹0.00";

  interestPercentageElement.textContent =
    "0%";

  resultPrincipalElement.textContent =
    "₹0.00";

  monthlyInterestElement.textContent =
    "₹0.00";

  dailyInterestElement.textContent =
    "₹0.00";

  resultDurationElement.textContent =
    "—";

  totalRepaymentElement.textContent =
    "₹0.00";

  scheduleBody.innerHTML = "";

  scheduleContainer.classList.add(
    "hidden"
  );

  toggleScheduleButton.textContent =
    "Show Schedule";
}

function updateCalculationMode() {
  const mode = getSelectedMode();

  if (mode === "date") {
    monthlyFields.classList.add("hidden");
    dateFields.classList.remove("hidden");
  } else {
    monthlyFields.classList.remove("hidden");
    dateFields.classList.add("hidden");
  }
}

function setDefaultDates() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  const todayValue =
    `${year}-${month}-${day}`;

  startDateInput.value =
    todayValue;

  endDateInput.value =
    todayValue;
}

function resetCalculator() {
  principalInput.value =
    "100000";

  rateInput.value =
    "2";

  durationInput.value =
    "12";

  durationUnit.value =
    "months";

  dateMode.checked =
    true;

  monthlyMode.checked =
    false;

  setDefaultDates();

  updateCalculationMode();
}

calculateButton.addEventListener(
  "click",
  calculate
);

resetButton.addEventListener(
  "click",
  resetCalculator
);

toggleScheduleButton.addEventListener("click", () => {
  const isHidden =
    scheduleContainer.classList.contains("hidden");

  scheduleContainer.classList.toggle("hidden", !isHidden);

  toggleScheduleButton.textContent = isHidden
    ? "Hide Schedule"
    : "Show Schedule";
});

monthlyMode.addEventListener(
  "change",
  updateCalculationMode
);

dateMode.addEventListener(
  "change",
  updateCalculationMode
);

durationUnit.addEventListener(
  "change",
  () => {
    // Only update the visible duration unit.
    // Calculation happens only after clicking Calculate.
  }
);

setDefaultDates();

/*
 * Start with the currently selected mode.
 */
updateCalculationMode();