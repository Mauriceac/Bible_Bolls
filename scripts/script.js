var dictionary = document.querySelector(".secondary-display");
const path = "http://localhost:3000";
let languages;
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

function getDefinition(strongNumber) {
  let definition = document.getElementById("definition");
  
  fetch(`${path}/dictionary-definition/BDBT/${strongNumber}/`)
    .then((response) => response.json())
    .then((data) => {
      
      let definitionHTML = data[0].definition;

      // Replace 'a href' tags with a call to getDefinition function
      definitionHTML = definitionHTML.replace(
        /<a href=S:(.+?)>/g,
        `<a href='#' onclick='getDefinition("$1")'>`
      );

      definition.innerHTML = definitionHTML;
      dictionary.classList.replace("close", "open");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  fetch(`${path}/static/bolls/app/views/languages`)
    .then((response) => response.json())
    .then((data) => {
      languages = data;
      const languageList = document.getElementById("languageList");
      languageList.innerHTML = "";
      const options = languages.map((lang, index) => ({
        value: index,
        text: lang.language,
      }));
      populateDropdown(languageList, options);
    });
});

document.getElementById("languageList").addEventListener("change", function () {
  let language = this.value;

  // reset translationList dropdown
  const translationList = document.getElementById("translationList");
  translationList.value = "";
  translationList.innerHTML = "";

  // Get available translations in the selected language and populate the translation dropdown
  let selectedLanguage = languages[language];
  const options = selectedLanguage.translations.map((translation) => ({
    value: translation.short_name,
    text: translation.full_name,
  }));
  populateDropdown(translationList, options);
});

document
  .getElementById("translationList")
  .addEventListener("change", function () {
    shortName = this.value;

    // Reset bookId and clear bookList dropdown
    const bookList = document.getElementById("bookList");
    bookList.value = "";
    bookList.innerHTML = "";

    // Fetch available books in the selected translation and populate the book dropdown
    fetch(`${path}/get-books/${shortName}/`)
      .then((response) => response.json())
      .then((data) => {
        books = data;
        const options = books.map((book) => ({
          value: book.bookid,
          text: book.name,
        }));
        populateDropdown(bookList, options);
      });
  });

// Event listener for book selection
document.getElementById("bookList").addEventListener("change", function () {
  bookId = this.value;

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
  chapterList.innerHTML = "";

  // Fetch available books in the selected translation
  const selectedBook = books.find((book) => book.bookid == bookId);
  if (selectedBook) {
    // Create an option for each chapter in the book
    const options = [];

    for (let i = 1; i <= selectedBook.chapters; i++) {
      options.push({
        value: i,
        text: `Chapter ${i}`,
      });
    }
    populateDropdown(chapterList, options);
  }
});

// Event listener for chapter selection
document.getElementById("chapterList").addEventListener("change", function () {
  chapterId = this.value;

  // Reset verseList dropdown
  const verseList = document.getElementById("verseList");
  verseList.value = "";
  verseList.innerHTML = "";

  // Fetch available verses in the selected chapter and populate the verse dropdown
  fetch(`${path}/get-text/${shortName}/${bookId}/${chapterId}/`)
    .then((response) => response.json())
    .then((data) => {
      chapter = data;
      const options = chapter.map((verses) => ({
        value: verses.verse,
        text: `Verse ${verses.verse}`,
      }));

      populateDropdown(verseList, options);
    });

  fetch(`${path}/get-text/${originalShortName}/${bookId}/${chapterId}/`)
    .then((response1) => response1.json())
    .then((data1) => {
      originalChapter = data1;
    });
});

// Event listener for verse selection
document.getElementById("verseList").addEventListener("change", function () {
  verseId = this.value;

  // Select verse and display it
  let verseText = document.getElementById("verseText");
  verseText.innerHTML = chapter[verseId - 1].text;

  // formats the orginal translation's strong numbers to span tags with ids to be used for dictionary lookup

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
        
        let wordVariant = document.getElementById("wordVariant");
        let strongNumberDisplay = document.getElementById("strongNumberDisplay")
        let strongNumber = this.id;
        
        strongNumberDisplay.innerHTML = strongNumber;
        wordVariant.innerHTML = word.textContent;

        getDefinition(strongNumber);
      });
    });
  } else {
    // If the original translation is LXX, the strong numbers are not available
    originalText = document.getElementById("originalText");
    originalText.innerHTML = originalChapter[verseId - 1].text;
  }
});
