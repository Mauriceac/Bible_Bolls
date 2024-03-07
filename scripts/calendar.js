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
  var bookName = parts[0];
  var chapterAndVerses = parts[1].split(".");
  var chapter = chapterAndVerses[0];
  var verses = chapterAndVerses[1].split("-");

  document.getElementById("todaysGospel").innerHTML = gospel;
  console.log(
    "Today's Gospel: " +
      bookName +
      " " +
      chapter +
      ":" +
      verses[0] +
      "-" +
      verses[1]
  );

  document.getElementById("translationList").value = "NJB1985";
  var event = new Event("change");
  document.getElementById("translationList").dispatchEvent(event);

  // Get the bookList select element

  var bookList = document.getElementById("bookList");

  // Wait for the options to be filled
  while (bookList.options.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 100ms before checking again

    // Find the option with the text that matches the bookName
    var option = Array.from(bookList.options).find(
      (option) => option.text === bookName
    );

    // If the option was found, set the value of the bookList select element to the value of the option
    if (option) {
      bookList.value = option.value;
      bookList.dispatchEvent(event);
    }
  }

  while (chapterList.options.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 100ms before checking again

    // Find the option with the text that matches the bookName
    var option = Array.from(chapterList.options).find(
      (option) => option.value === chapter
    );

    // If the option was found, set the value of the bookList select element to the value of the option
    if (option) {
      chapterList.value = option.value;
      chapterList.dispatchEvent(event);
    }
  }

  while (verseList.options.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for 100ms before checking again
    console.log("verseList: " + document.getElementById("verseList").value);
    // Find the option with the text that matches the bookName
    var option = Array.from(verseList.options).find(
      (option) => option.value === verses[0]
    );

    // If the option was found, set the value of the bookList select element to the value of the option
    if (option) {
      verseList.value = option.value;
      verseList.dispatchEvent(event);
    }
  }
});
