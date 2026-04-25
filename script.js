const animals = [
  { name: "cow", emoji: "🐮", sound: "moo", pattern: "cow" },
  { name: "duck", emoji: "🦆", sound: "quack", pattern: "duck" },
  { name: "dog", emoji: "🐶", sound: "woof", pattern: "dog" },
  { name: "cat", emoji: "🐱", sound: "meow", pattern: "cat" },
  { name: "pig", emoji: "🐷", sound: "oink", pattern: "pig" },
  { name: "frog", emoji: "🐸", sound: "ribbit", pattern: "frog" },
  { name: "lion", emoji: "🦁", sound: "roar", pattern: "lion" },
  { name: "monkey", emoji: "🐵", sound: "oo oo", pattern: "monkey" },
];

const grid = document.querySelector("#animalGrid");
const prompt = document.querySelector("#prompt");
const feedbackText = document.querySelector("#feedbackText");
const feedbackFace = document.querySelector("#feedbackFace");
const repeatButton = document.querySelector("#repeatButton");
const celebration = document.querySelector("#celebration");

let target = animals[0];
let currentChoices = [];
let locked = false;
let audioContext;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.78;
  utterance.pitch = 1.15;
  window.speechSynthesis.speak(utterance);
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(start, duration, frequency, type = "sine", gain = 0.12) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime + start);
  volume.gain.setValueAtTime(0.001, context.currentTime + start);
  volume.gain.exponentialRampToValueAtTime(gain, context.currentTime + start + 0.03);
  volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + start + duration);

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(context.currentTime + start);
  oscillator.stop(context.currentTime + start + duration + 0.04);
}

function playAnimalSound(animal) {
  if (!window.AudioContext && !window.webkitAudioContext) {
    speak(animal.sound);
    return;
  }

  const patterns = {
    cow: () => {
      playTone(0, 0.42, 150, "sawtooth", 0.13);
      playTone(0.1, 0.42, 105, "sine", 0.11);
    },
    duck: () => {
      playTone(0, 0.12, 520, "square", 0.09);
      playTone(0.16, 0.12, 470, "square", 0.09);
    },
    dog: () => {
      playTone(0, 0.16, 210, "square", 0.12);
      playTone(0.2, 0.18, 170, "square", 0.12);
    },
    cat: () => {
      playTone(0, 0.22, 520, "triangle", 0.08);
      playTone(0.16, 0.28, 760, "sine", 0.07);
    },
    pig: () => {
      playTone(0, 0.13, 260, "sawtooth", 0.1);
      playTone(0.16, 0.16, 220, "sawtooth", 0.1);
    },
    frog: () => {
      playTone(0, 0.18, 130, "square", 0.13);
      playTone(0.2, 0.16, 170, "square", 0.12);
    },
    lion: () => {
      playTone(0, 0.55, 95, "sawtooth", 0.14);
      playTone(0.08, 0.5, 70, "square", 0.08);
    },
    monkey: () => {
      playTone(0, 0.11, 640, "triangle", 0.09);
      playTone(0.15, 0.11, 760, "triangle", 0.09);
      playTone(0.3, 0.12, 600, "triangle", 0.09);
    },
  };

  patterns[animal.pattern]();
}

function celebrate() {
  const pieces = ["★", "●", "◆", "♥"];
  const colors = ["#4eaa6f", "#4c8ed9", "#ef767a", "#f2b84b"];

  for (let index = 0; index < 14; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = pieces[index % pieces.length];
    sparkle.style.setProperty("--x", `${18 + Math.random() * 64}%`);
    sparkle.style.setProperty("--y", `${34 + Math.random() * 30}%`);
    sparkle.style.setProperty("--color", colors[index % colors.length]);
    celebration.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove());
  }
}

function makeRound() {
  locked = false;
  target = animals[Math.floor(Math.random() * animals.length)];
  const otherAnimals = shuffle(animals.filter((animal) => animal.name !== target.name)).slice(0, 1);
  currentChoices = shuffle([target, ...otherAnimals]);

  prompt.textContent = `Find the ${target.name}`;
  feedbackFace.textContent = "🙂";
  feedbackText.textContent = "Listen, then tap.";
  renderChoices();

  window.setTimeout(() => {
    speak(`Find the ${target.name}`);
    window.setTimeout(() => playAnimalSound(target), 900);
  }, 350);
}

function renderChoices() {
  grid.innerHTML = "";

  currentChoices.forEach((animal) => {
    const card = document.createElement("button");
    card.className = "animal-card";
    card.type = "button";
    card.setAttribute("aria-label", animal.name);
    card.innerHTML = `
      <span class="animal-emoji" aria-hidden="true">${animal.emoji}</span>
      <span class="animal-name">${animal.name}</span>
    `;
    card.addEventListener("click", () => chooseAnimal(animal, card));
    grid.appendChild(card);
  });
}

function chooseAnimal(animal, card) {
  if (locked) return;

  if (animal.name === target.name) {
    locked = true;
    card.classList.add("correct");
    feedbackFace.textContent = "😀";
    feedbackText.textContent = `Yes! ${target.name} says ${target.sound}.`;
    celebrate();
    playAnimalSound(target);
    speak(`Yes! ${target.name} says ${target.sound}.`);
    window.setTimeout(makeRound, 2400);
    return;
  }

  card.classList.add("missed");
  feedbackFace.textContent = "🙂";
  feedbackText.textContent = `Try again. Find the ${target.name}.`;
  speak(`Try again. Find the ${target.name}.`);
  window.setTimeout(() => card.classList.remove("missed"), 700);
}

repeatButton.addEventListener("click", () => speak(`Find the ${target.name}`));
repeatButton.addEventListener("click", () => window.setTimeout(() => playAnimalSound(target), 850));

makeRound();
