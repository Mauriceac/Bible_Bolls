var dictionary = document.querySelector(".secondary-display");
const path = "http://localhost:3000";
let shortName;
let bookId;
let books;
let chapterId;
let chapter;
let verseId;
let originalShortName;
let originalChapter;
let originalVerse;
let originalText;

// Function to populate a dropdown menu with options
function populateDropdown(dropdown, options) {
  const defaultOption = document.createElement("option");
  const list = `${dropdown.id}`.replace(/List$/, "");
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = `Select a ${list}`;
  dropdown.appendChild(defaultOption);
  options.forEach((option) => {
    const newOption = document.createElement("option");
    newOption.value = option.value;
    newOption.text = option.text;
    dropdown.appendChild(newOption);
  });
}

// manual selection of translation, book, chapter, and verse
document.addEventListener("DOMContentLoaded", function () {
  // Fetch available translations and populate the translation dropdown
  fetch(`${path}/static/bolls/app/views/languages`)
    .then((response) => response.json())
    .then((data) => {
      const translationList = document.getElementById("translationList");
      const options = [];
      data.forEach((language) => {
        language.translations.forEach((translation) => {
          options.push({
            value: translation.short_name,
            text: translation.full_name,
          });
        });
      });
      populateDropdown(translationList, options);
      console.log(`Translations loaded:` + translationList.length);
    });

  // Event listener for translation selection

  document
    .getElementById("translationList")
    .addEventListener("change", function () {
      shortName = this.value;
      console.log(`Translation selected: ${shortName}`);

      // Reset bookId and clear bookList dropdown
      const bookList = document.getElementById("bookList");
      bookList.value = "";
      while (bookList.firstChild) {
        bookList.removeChild(bookList.firstChild);
      }

      // Fetch available books in the selected translation and populate the book dropdown
      fetch(`${path}/get-books/${shortName}/`)
        .then((response) => response.json())
        .then((data) => {
          const options = [];
          books = data;
          books.forEach((book) => {
            options.push({ value: book.bookid, text: book.name });
          });
          populateDropdown(bookList, options);
        });
    });
});

// Event listener for book selection
document.getElementById("bookList").addEventListener("change", function () {
  bookId = this.value;

  console.log(`Book selected: ${bookId}`);

  if (bookId >= 40 && bookId <= 66) {
    originalShortName = "TISCH";
  }
  if (bookId >= 1 && bookId <= 39) {
    originalShortName = "WLCa";
  }
  if (bookId >= 67) {
    originalShortName = "LXX";
  }
  if (shortName === "LXXE") {
    originalShortName = "LXX";
  }

  // Reset chapterList dropdown
  let chapterList = document.getElementById("chapterList");
  chapterList.value = "";
  while (chapterList.firstChild) {
    chapterList.removeChild(chapterList.firstChild);
  }

  // Fetch available books in the selected translation
  const selectedBook = books.find((book) => book.bookid == bookId);
  if (selectedBook) {
    // Create an option for each chapter in the book
    const options = [];
    for (let i = 1; i <= selectedBook.chapters; i++) {
      options.push({ value: i, text: `Chapter ${i}` });
    }
    populateDropdown(chapterList, options);
  }
  console.log(`Chapters loaded:` + chapterList.length);
});

// Event listener for chapter selection
document.getElementById("chapterList").addEventListener("change", function () {
  chapterId = this.value;
  console.log(`Chapter selected: ${chapterId}`);

  // Reset verseList dropdown
  const verseList = document.getElementById("verseList");
  verseList.value = "";
  while (verseList.firstChild) {
    verseList.removeChild(verseList.firstChild);
  }

  // Fetch available verses in the selected chapter and populate the verse dropdown
  fetch(`${path}/get-text/${shortName}/${bookId}/${chapterId}/`)
    .then((response) => response.json())
    .then((data) => {
      chapter = data;
      const options = [];
      for (let i = 1; i <= chapter.length; i++) {
        options.push({ value: i, text: `Verse ${i}` });
      }
      populateDropdown(verseList, options);
      console.log(`Verses loaded:` + verseList.length);
    });

  fetch(`${path}/get-text/${originalShortName}/${bookId}/${chapterId}/`)
    .then((response1) => response1.json())
    .then((data1) => {
      originalChapter = data1;
    });
});

// Event listener for verse selection
document
  .getElementById("verseList")
  .addEventListener("change", function () {
    verseId = this.value;
    console.log(`Verse selected: ${verseId}`);

    // Select verse and display it
    let verseText = document.getElementById("verseText");
    verseText.innerHTML = chapter[verseId - 1].text;

    getOriginalVerse();

    function getOriginalVerse() {
      originalVerse = originalChapter[verseId - 1].text;
      if (originalShortName === "TISCH" || originalShortName === "WLCa") {
        const verseWithStrong = originalVerse;
        const strongNumbers = verseWithStrong
          .match(/<S>(\d+)<\/S>/g)
          .map((s) => s.replace(/<\/?S>/g, ""));
        const words = verseWithStrong
          .split(/<S>\d+<\/S>/g)
          .filter((s) => s.length > 0);
        const wordsWithSpans = words
          .filter((s) => s.trim().length > 0)
          .map((word, i) => {
            const strongNumber = strongNumbers[i];
            if (originalShortName === "TISCH") {
              return `<span id="G${strongNumber}">${word.trim()}</span>`;
            }
            if (originalShortName === "WLCa") {
              return `<span id="H${strongNumber}">${word.trim()}</span>`;
            }
          });

        originalText = document.getElementById("originalText");
        originalText.innerHTML = wordsWithSpans.join(" ");

        let verseWords = document.querySelectorAll("span");
        verseWords.forEach((word) => {
          word.addEventListener("click", function () {
            if (dictionary.classList.contains("open")) {
              dictionary.classList.replace("open", "close");
            }
            let definition = document.getElementById("definition");
            let wordVariant = document.getElementById("wordVariant");
            let strongNumber = this.id;
            console.log(`Strong number clicked: ${strongNumber}`);
            fetch(`${path}/dictionary-definition/BDBT/${strongNumber}/`)
              .then((response) => response.json())
              .then((data) => {
                console.log(data);

                wordVariant.innerHTML = word.textContent;
                definition.innerHTML = data[0].definition;

                dictionary.classList.replace("close", "open");
              });
          });
        });
      } else {
        originalText = document.getElementById("originalText");
        originalText.innerHTML = originalChapter[verseId - 1].text;
      }
    }
  });
