var dictionary = document.querySelector(".secondary-display");
const path = "http://localhost:3000";

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
      const shortName = this.value;
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
          data.forEach((book) => {
            options.push({ value: book.bookid, text: book.name });
          });
          populateDropdown(bookList, options);
        });
    });
});

// Event listener for book selection
document.getElementById("bookList").addEventListener("change", function () {
  const shortName = document.getElementById("translationList").value;
  const bookId = this.value;
  console.log(`Book selected: ${bookId}`);

  // Reset chapterList dropdown
  const chapterList = document.getElementById("chapterList");
  chapterList.value = "";
  while (chapterList.firstChild) {
    chapterList.removeChild(chapterList.firstChild);
  }

  // Fetch available books in the selected translation
  fetch(`${path}/get-books/${shortName}/`)
    .then((response) => response.json())
    .then((data) => {
      // Find the selected book
      const selectedBook = data.find((book) => book.bookid == bookId);
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
});

// Event listener for chapter selection
document.getElementById("chapterList").addEventListener("change", function () {
  const shortName = document.getElementById("translationList").value;
  const bookId = document.getElementById("bookList").value;
  const chapterId = this.value;
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
      const options = [];
      for (let i = 1; i <= data.length; i++) {
        options.push({ value: i, text: `Verse ${i}` });
      }
      populateDropdown(verseList, options);

      console.log(`Verses loaded:` + verseList.length);
    });
});

// Event listener for verse selection
document
  .getElementById("verseList")
  .addEventListener("change", async function () {
    const shortName = document.getElementById("translationList").value;
    const bookId = document.getElementById("bookList").value;
    const chapterNumber = document.getElementById("chapterList").value;
    const verseNumber = this.value;
    console.log(`Verse selected: ${verseNumber}`);

    // Fetch the selected verse and display it
    await fetch(
      `${path}/get-verse/${shortName}/${bookId}/${chapterNumber}/${verseNumber}/`
    )
      .then((response) => response.json())
      .then((data) => {
        const verseText = document.getElementById("verseText");
        verseText.innerHTML = data.text;
      });

    // Fetch the Greek or Hebrew text and display it. If the the bookId is equal or greater than 40 and equal or less than 66, then it is the New Testament and the Greek text is displayed. If the bookId is other than that range, then it is the Old Testament and the Hebrew text is displayed.

    let originalShortName; // Declare originalShortName here

    if (bookId >= 40 && bookId <= 66) {
      originalShortName = "TISCH"; // Assign a value here
    }
    if (bookId >= 1 && bookId <= 39) {
      originalShortName = "WLCa"; // Assign a value here
    }
    if (bookId >= 67) {
      originalShortName = "LXX"; // Assign a value here
    }

    fetch(
      `${path}/get-verse/${originalShortName}/${bookId}/${chapterNumber}/${verseNumber}/`
    )
      .then((response) => response.json())
      .then((data) => {
        if (originalShortName === "TISCH" || originalShortName === "WLCa") {
          const verseWithStrong = data.text;
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
          const result = wordsWithSpans.map((word, i) => ({
            word,
            strongNumber: strongNumbers[i],
          }));
          const originalText = document.getElementById("originalText");
          originalText.innerHTML = wordsWithSpans.join(" ");
          console.log(result);

          // add event listeners to each word and display the strong number when clicked
          const verseWords = document.querySelectorAll("span");
          verseWords.forEach((word) => {
            word.addEventListener("click", function () {
              if (dictionary.classList.contains("open")) {
                dictionary.classList.replace("open", "close");
              }
              const definition = document.getElementById("definition");
              const wordVariant = document.getElementById("wordVariant");
              const strongNumber = this.id;
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
          const originalText = document.getElementById("originalText");
          originalText.innerHTML = data.text;
        }
      });
  });

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
