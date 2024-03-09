// Gospel reading of the day

document.getElementById("today").addEventListener("click", async function () {
  // Add async keyword here

  const result = await fetch(`${path}/api/gregorian`).then((response) =>
    response.text()
  ); // Use await here
  const data = JSON.parse(result);
  const gospel = data.readings[1].display;

  // Split the gospel string into book, chapter, and verses
  var parts = gospel.split(" ");
  let bookName = parts[0];
  switch (bookName) {
    case "Matthew":
      bookId = 40;
      break;
    case "Mark":
      bookId = 41;
      break;
    case "Luke":
      bookId = 42;
      break;
    case "John":
      bookId = 43;
      break;
    default:
      console.log("Book not found");
      break;
  }

  var chapterAndVerses = parts[1].split(".");
  var chapter = chapterAndVerses[0];
  var match = chapterAndVerses[1].match(/\d+/);
  let verse;
  if (match) {
    verse = parseInt(match[0], 10);
  }

  if (
    document.getElementById("translationList").value === "Select a translation"
  ) {
    alert("Please select a translation first.");
  } else if (books.find((book) => book.bookid == bookId) === undefined) {
    alert("Please select a translation that includes the New Testament.");
  } else {
    // Display the gospel citation
    document.getElementById("todaysGospel").innerHTML = gospel;
    // Get the passage
    async function setOptions(menu, value) {
      var menu = document.getElementById(menu);
      while (menu.length <= 1) {
        await new Promise((r) => setTimeout(r, 5000));
      }
      menu.value = value;
      menu.dispatchEvent(new Event("change"));
    }

    setOptions("bookList", bookId);
    setOptions("chapterList", chapter);
    setOptions("verseList", verse);
  }

});
