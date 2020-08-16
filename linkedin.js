require("chromedriver");
let swd = require("selenium-webdriver");
let { username, password } = require("./credentials.json");
const { Driver } = require("selenium-webdriver/chrome");
let browser = new swd.Builder();
let tab = browser.forBrowser("chrome").build();
let tabWillBeOpenedPromise = tab.get(
  "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin"
);

let company = "Amazon";
let maxPages = 2;
let maxRequests = 90;
let requestCount = 0;
let profilesUrls = [];
let myMessage = `
Hi Sir/Mam,
I am Rohit Jain. I am pursuing computer science engineering at the Ambedkar institute of advanced communication technologies and research. I have several months of experience in software engineering and have done several projects and internships in machine learning, Software development, and teaching. I have a good grasp of Data structures and algorithms and I am decent in competitive programming.

Can you refer me to your company? My resume: https://drive.google.com/file/d/1CeBhEIAmZF71W8DSX6NumUx4vYEp_EAg/view?usp=sharing
`;

tabWillBeOpenedPromise
  .then(function () {
    let findTimeOut = tab.manage().setTimeouts({
      implicit: 10000,
    });
    return findTimeOut;
  })
  .then(async function () {
    await login();
    await tab.get(
      'https://www.linkedin.com/search/results/people/?facetNetwork=%5B"F"%5D&keywords=' +
      company +
      "&origin=FACETED_SEARCH"
    );
    //search-results__total
    let resText = await (await tab.findElement(
      swd.By.css(".search-results__total")
    )).getText();
    let results = resText.split(" ")[0];
    results = results.replace(",", "");
    results = parseInt(results);
    maxPages = Math.ceil(results / 10);
    for (let i = 1; i <= maxPages; i++) {
      await tab.get(
        'https://www.linkedin.com/search/results/people/?facetNetwork=%5B"F"%5D&keywords=' +
        company +
        "&origin=FACETED_SEARCH&page=" +
        i
      );

      await tab.executeScript("window.scroll(0,1000)");

      await tab.sleep(1000);
      await tab;
      let people = await tab.findElements(
        swd.By.css("a[data-control-name='search_srp_result']")
      );

      let count = 0;

      console.log(people.length);

      for (let index = 0; index < people.length; index++) {
        let element = people[index];
        let profileUrl = await (await element).getAttribute("href");
        if (count % 2 == 0) profilesUrls.push(profileUrl);
        count++;
      }
    }
    console.log(profilesUrls);

    for (let index = 0; index < profilesUrls.length; index++) {
      await message(profilesUrls[index]);
      await tab.sleep(1000);
    }
 
    return undefined;
  })
  .catch(function (err) {
    console.log(err);
  });

async function login() {
  return new Promise(async function (resolve, reject) {
    let inputUserBoxPromise = tab.findElement(swd.By.css("#username"));
    let inputPassBoxPromise = tab.findElement(swd.By.css("#password"));
    let pArr = await Promise.all([inputUserBoxPromise, inputPassBoxPromise]);

    let inputUserBox = pArr[0];
    let inputPassBox = pArr[1];
    let inputUserBoxWillBeFilledP = inputUserBox.sendKeys(username);
    let inputPassBoxWillBeFilledP = inputPassBox.sendKeys(password);

    let willBeFilledArr = await Promise.all([
      inputUserBoxWillBeFilledP,
      inputPassBoxWillBeFilledP,
    ]);

    await click("button[data-litms-control-urn='login-submit']");

    resolve();
  });
}
async function click(selector) {
  return new Promise(async function (resolve, reject) {
    let sendBtn = await tab.findElement(
      swd.By.css(
        selector
      )
    );
    console.log(sendBtn);
    await sendBtn.click();
    console.log("btn clicked");
    await tab;
    resolve();
  })
}
async function fill(selector, input) {
  return new Promise(async function (resolve, reject) {
    let inputBox = await tab.findElement(
      swd.By.css(
        selector
      )
    );
    await inputBox.sendKeys(input);
    await tab;
    resolve();
  })
}

async function message(url) {
  return new Promise(async function (resolve, reject) {
    let getProfilePage = await tab.get(url);
    let nameli = await tab.findElement(
      swd.By.css(".t-24.t-black.t-normal.break-words")
    );
    let name = await nameli.getText();
    await click(".message-anywhere-button");
    await fill(".msg-form__contenteditable", myMessage);
    await tab.sleep(1000);
    await click(".msg-form__send-button");
    await tab.sleep(1000);
    await click("[data-control-name='overlay.close_conversation_window']");

    resolve();
  });
}
