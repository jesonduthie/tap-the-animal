const animals = [
  { name: "cow", emoji: "🐮", sound: "moo" },
  { name: "duck", emoji: "🦆", sound: "quack" },
  { name: "dog", emoji: "🐶", sound: "woof" },
  { name: "cat", emoji: "🐱", sound: "meow" },
  { name: "pig", emoji: "🐷", sound: "oink" },
  { name: "frog", emoji: "🐸", sound: "ribbit" },
  { name: "lion", emoji: "🦁", sound: "roar" },
  { name: "monkey", emoji: "🐵", sound: "oo oo" },
];

const grid = document.querySelector("#animalGrid");
const prompt = document.querySelector("#prompt");
const feedbackText = document.querySelector("#feedbackText");
const feedbackFace = document.querySelector("#feedbackFace");
const repeatButton = document.querySelector("#repeatButton");

let target = animals[0];
let currentChoices = [];
let locked = false;

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

function makeRound() {
  locked = false;
  target = animals[Math.floor(Math.random() * animals.length)];
  const otherAnimals = shuffle(animals.filter((animal) => animal.name !== target.name)).slice(0, 3);
  currentChoices = shuffle([target, ...otherAnimals]);

  prompt.textContent = `Find the ${target.name}`;
  feedbackFace.textContent = "🙂";
  feedbackText.textContent = "Tap the animal you hear.";
  renderChoices();

  window.setTimeout(() => speak(`Find the ${target.name}`), 350);
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
    speak(`Yes! ${target.name} says ${target.sound}.`);
    window.setTimeout(makeRound, 2100);
    return;
  }

  card.classList.add("missed");
  feedbackFace.textContent = "🙂";
  feedbackText.textContent = `Try again. Find the ${target.name}.`;
  speak(`Try again. Find the ${target.name}.`);
  window.setTimeout(() => card.classList.remove("missed"), 700);
}

repeatButton.addEventListener("click", () => speak(`Find the ${target.name}`));

makeRound();
