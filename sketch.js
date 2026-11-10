const clockArea = document.getElementById("clock");
const timeText = document.getElementById("digital-time");
const ampmText = document.getElementById("ampm");
const zoneText = document.getElementById("timezone");
const placeText = document.getElementById("current-place");
const placeButtons = document.querySelectorAll(".place");

let selectedZone = "America/New_York";
let selectedName = "NEW YORK";
let selectedOcean = "ATLANTIC OCEAN";
let lastSecond = -1;
let lastMinute = -1;
let clockSize = 430;
let currentHour = 0;
let currentMinute = 0;
let currentSecond = 0;

function setup() {
  clockSize = clockArea.clientWidth;
  const canvas = createCanvas(clockSize, clockSize);
  canvas.parent(clockArea);
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  angleMode(RADIANS);

  placeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedZone = button.dataset.zone;
      selectedName = button.querySelector(".place-name").textContent.toUpperCase();
      selectedOcean = button.querySelector(".ocean").textContent;
      lastSecond = -1;

      placeButtons.forEach((place) => {
        const isSelected = place === button;
        place.classList.toggle("selected", isSelected);
        place.setAttribute("aria-pressed", isSelected);
      });
    });
  });
}

function draw() {
  clear();
  updateTime();
  drawClock();
}

function updateTime() {
  const now = new Date();
  if (now.getSeconds() === lastSecond) return;
  lastSecond = now.getSeconds();

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: selectedZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).formatToParts(now);

  const hour = Number(timeParts.find((part) => part.type === "hour").value);
  currentMinute = Number(timeParts.find((part) => part.type === "minute").value);
  currentSecond = Number(timeParts.find((part) => part.type === "second").value);
  currentHour = hour % 12;

  timeText.textContent = `${String(hour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}:${String(currentSecond).padStart(2, "0")}`;
  ampmText.textContent = timeParts.find((part) => part.type === "dayPeriod").value;

  const zone = new Intl.DateTimeFormat("en-US", {
    timeZone: selectedZone,
    timeZoneName: "short"
  }).formatToParts(now).find((part) => part.type === "timeZoneName").value;
  zoneText.textContent = zone.toUpperCase();
  placeText.innerHTML = `${selectedName} <span>·</span> ${selectedOcean}`;

  if (currentMinute !== lastMinute) {
    console.log("Minute:", currentMinute);
    lastMinute = currentMinute;
  }
}

function drawClock() {
  const radius = width * 0.41;
  translate(width / 2, height / 2);

  noStroke();
  fill(54, 171, 224, 18);
  circle(0, 0, radius * 2.2);
  fill(255, 255, 255, 130);
  circle(0, 0, radius * 2.06);
  fill(180, 236, 255);
  circle(0, 0, radius * 1.94);

  drawWaves(radius * 0.78);
  drawNumbers(radius);
  drawHands(radius);

  noStroke();
  fill("#f28a62");
  circle(0, 0, 10);
  fill("#ffffff");
  circle(0, 0, 4);
}

function drawWaves(radius) {
  for (let wave = 0; wave < 3; wave++) {
    noFill();
    stroke(14, 122 + wave * 20, 191 + wave * 15, 190);
    strokeWeight(wave === 0 ? 2 : 1.5);
    beginShape();

    for (let x = -radius * 0.75; x <= radius * 0.75; x += 5) {
      const y = radius * (0.25 + wave * 0.2)
        + sin(x / 28 + millis() / 1200 + wave) * 7;
      vertex(x, y);
    }

    endShape();
  }
}

function drawNumbers(radius) {
  textAlign(CENTER, CENTER);
  textSize(radius * 0.1);
  noStroke();
  fill("#155a83");

  for (let number = 1; number <= 12; number++) {
    const angle = number / 12 * TWO_PI - HALF_PI;
    const distance = radius * 0.8;
    text(number, cos(angle) * distance, sin(angle) * distance);
  }
}

function drawHands(radius) {
  const minutePosition = currentMinute + currentSecond / 60;
  const hourAngle = (currentHour + minutePosition / 60) / 12 * TWO_PI;
  const minuteAngle = minutePosition / 60 * TWO_PI;
  const secondAngle = currentSecond / 60 * TWO_PI;

  drawHand(hourAngle, radius * 0.48, 5, "#155a83");
  drawHand(minuteAngle, radius * 0.7, 3, "#0787c5");
  drawHand(secondAngle, radius * 0.82, 1.5, "#f28a62");
}

function drawHand(angle, length, weight, handColor) {
  push();
  rotate(angle - HALF_PI);
  stroke(handColor);
  strokeWeight(weight);
  strokeCap(ROUND);
  line(-length * 0.14, 0, length, 0);
  pop();
}

function windowResized() {
  const newSize = clockArea.clientWidth;
  if (newSize !== clockSize) {
    clockSize = newSize;
    resizeCanvas(clockSize, clockSize);
  }
}
