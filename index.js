const createElements = (arr) => {
  if (!arr || arr.length === 0) return "No synonyms found";

  return arr
    .map((el) => `<span class="btn btn-sm btn-outline">${el}</span>`)
    .join(" ");
};

function pronounceWord(word) {
  if (!word) return;

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const manageSpinner = (status) => {
  const spinner = document.getElementById("spinner");
  const wordContainer = document.getElementById("word-container");

  if (status) {
    spinner.classList.remove("hidden");
    wordContainer.classList.add("hidden");
  } else {
    spinner.classList.add("hidden");
    wordContainer.classList.remove("hidden");
  }
};

const loadLessons = async () => {
  try {
    const res = await fetch(
      "https://openapi.programming-hero.com/api/levels/all"
    );

    const json = await res.json();

    displayLesson(json.data);
  } catch (error) {
    console.log("Lesson loading error", error);
  }
};

const removeActive = () => {
  const lessonButtons = document.querySelectorAll(".lesson-btn");

  lessonButtons.forEach((btn) => btn.classList.remove("active"));
};

const loadLevelWord = async (id) => {
  manageSpinner(true);

  const url = `https://openapi.programming-hero.com/api/level/${id}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    removeActive();

    const clickBtn = document.getElementById(`lesson-btn-${id}`);

    if (clickBtn) clickBtn.classList.add("active");

    displayLevelWord(data.data);
  } catch (error) {
    console.log("Word loading error", error);
  }
};

const loadWordDetail = async (id) => {
  try {
    const url = `https://openapi.programming-hero.com/api/word/${id}`;

    const res = await fetch(url);

    const details = await res.json();

    displayWordDetails(details.data);
  } catch (error) {
    console.log(error);
  }
};

const displayWordDetails = (word) => {
  const detailsBox = document.getElementById("details-container");

  detailsBox.innerHTML = `
    <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
        ${word.word}
        <button onclick="pronounceWord('${word.word}')">
        <i class="fa-solid fa-volume-high"></i>
        </button>
        </h2>
    </div>

    <div>
        <h2 class="font-bold">Meaning</h2>
        <p>${word.meaning || "No meaning available"}</p>
    </div>

    <div>
        <h2 class="font-bold">Example</h2>
        <p>${word.sentence || "No example found"}</p>
    </div>

    <div>
        <h2 class="font-bold">Synonyms</h2>
        <div class="flex flex-wrap gap-2">
        ${createElements(word.synonyms)}
        </div>
    </div>
  `;

  document.getElementById("word_modal").showModal();
};

const displayLevelWord = (words) => {
  const wordContainer = document.getElementById("word-container");

  wordContainer.innerHTML = "";

  if (words.length === 0) {
    wordContainer.innerHTML = `
    <div class="text-center col-span-full py-10 space-y-6 font-bangla">
        <img class="mx-auto w-24" src="./assets/alert-error.png"/>
        <p class="text-xl text-gray-400">
        এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।
        </p>
        <h2 class="font-bold text-4xl">নেক্সট Lesson এ যান</h2>
    </div>
    `;

    manageSpinner(false);
    return;
  }

  words.forEach((word) => {
    const card = document.createElement("div");

    card.innerHTML = `
      <div class="bg-white rounded-xl shadow-sm text-center py-10 px-5 space-y-4">
        <h2 class="font-bold text-2xl">
        ${word.word || "শব্দ পাওয়া যায়নি"}
        </h2>

        <p class="font-semibold text-gray-500">
        Meaning / Pronunciation
        </p>

        <div class="text-2xl font-medium font-bangla">
        "${word.meaning || "অর্থ পাওয়া যায়নি"} / ${
      word.pronunciation || "Pronunciation পাওয়া যায়নি"
    }"
        </div>

        <div class="flex justify-between items-center">

          <button onclick="loadWordDetail(${
            word.id
          })" class="btn bg-[#1A91FF10] hover:bg-[#1A91FF30]">
          <i class="fa-solid fa-circle-info"></i>
          </button>

          <button onclick="pronounceWord('${
            word.word
          }')" class="btn bg-[#1A91FF10] hover:bg-[#1A91FF30]">
          <i class="fa-solid fa-volume-high"></i>
          </button>

        </div>
      </div>
    `;

    wordContainer.append(card);
  });

  manageSpinner(false);
};

const displayLesson = (lessons) => {
  const levelContainer = document.getElementById("level-container");

  levelContainer.innerHTML = "";

  for (let lesson of lessons) {
    const btnDiv = document.createElement("div");

    btnDiv.innerHTML = `
        <button id="lesson-btn-${lesson.level_no}"
        onclick="loadLevelWord(${lesson.level_no})"
        class="btn btn-outline btn-primary lesson-btn">
        
        <i class="fa-solid fa-book-open"></i>
        Lesson - ${lesson.level_no}

        </button>
    `;

    levelContainer.append(btnDiv);
  }
};

loadLessons();

document.getElementById("btn-search").addEventListener("click", async () => {
  removeActive();

  const input = document.getElementById("input-search");

  const searchValue = input.value.trim().toLowerCase();

  if (!searchValue) return;

  manageSpinner(true);

  const res = await fetch(
    "https://openapi.programming-hero.com/api/words/all"
  );

  const data = await res.json();

  const allWords = data.data;

  const filterWords = allWords.filter((word) =>
    word.word.toLowerCase().includes(searchValue)
  );

  displayLevelWord(filterWords);

  input.value = "";
});