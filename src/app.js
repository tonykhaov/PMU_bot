import chalk from "chalk";
import dotenv from "dotenv";
import Puppeteer from "puppeteer";
import dayjs from "dayjs";
import "dayjs/locale/fr.js";
dotenv.config();
dayjs.locale("fr");

const { WEBSITE, ACCESS_CODE, PASSWORD, NODE_ENV } = process.env;

if (!WEBSITE || !ACCESS_CODE || !PASSWORD) {
  throw new Error("Website, Access code or Password missing.");
}

async function puppeteer() {
  const now = dayjs();
  const previousMonth = now.subtract(1, "month").format("MMMM");
  try {
    console.log(
      chalk.bold.underline.blue(
        `Bot fetching commission file for: ${previousMonth.toUpperCase()}`
      )
    );
    const browser = await Puppeteer.launch({ headless: NODE_ENV !== "demo" });
    const page = await browser.newPage();

    await page.setViewport({ width: 640, height: 480, isMobile: true });
    await page.goto(WEBSITE);
    await page.screenshot({ path: "./dist/screenshots/loginPage.png" });

    console.time("login page");
    console.log(chalk.underline("--> login page"));
    console.log("...logging in");

    await page.type("input#login.homeInput", ACCESS_CODE);
    await page.keyboard.press("Tab");
    await page.keyboard.type(PASSWORD);
    await page.click("td.button");
    await page.waitForSelector("img.clubAvantage");
    await page.screenshot({ path: "./dist/screenshots/portalPage.png" });

    console.timeEnd("login page");
    console.time("portal page");
    console.log(chalk.underline("--> portal page"));
    console.log("...going to home page");

    await page.click("img.clubAvantage");
    await page.setViewport({ width: 900, height: 798, isMobile: false });
    await page.waitForSelector("#menu_switch");
    await page.screenshot({ path: "./dist/screenshots/homePage.png" });

    console.timeEnd("portal page");
    console.time("home page");
    console.log(chalk.underline("--> home page"));
    console.log("...going to gestion page");

    await page.click("#menu_switch");
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    await page.screenshot({ path: "./dist/screenshots/gestionPage.png" });

    console.timeEnd("home page");
    console.time("gestion page");
    console.log(chalk.underline("--> gestion page"));
    console.log("...going to commission page");

    await page.click(".dropdown a");
    await page.click(".dropdown-content a");
    await page.setViewport({ width: 1366, height: 798, isMobile: false });
    await page.waitForSelector("tr.month");
    await page.screenshot({ path: "./dist/screenshots/commissionsPage.png" });

    console.timeEnd("gestion page");
    console.time("commission page");
    console.log(chalk.underline("--> commission page"));
    console.log(
      `...finding commission file for: ${previousMonth.toUpperCase()}`
    );

    const months = await page.$$eval("#fileContent tr.month", (monthRows) =>
      monthRows.map((month) => month.textContent)
    );
    const regexPreviousMonth = new RegExp(previousMonth, "i");
    const previousMonthIndex = months.findIndex((month) =>
      regexPreviousMonth.test(month)
    );
    const previousMonthHTML = await page.$(
      `#fileContent tr.month:nth-child(${previousMonthIndex + 1})`
    );

    await previousMonthHTML.click(".actionsMenu");
    await previousMonthHTML.click(".actionsdetails a.button.iconPrint");
    const previousMonthPDFLink = await previousMonthHTML.$eval(
      ".actionsdetails a.button.iconPrint",
      (a) => a.href
    );
    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: "./dist/pdf",
    });

    console.timeEnd("commission page");

    await page.goto(previousMonthPDFLink);

    await browser.close();
  } catch (err) {
    throw new Error(err);
  } finally {
    console.log(
      chalk.bold.green(
        `--> PDF commission file for ${previousMonth.toUpperCase()} downloaded`
      )
    );
    process.exit(0);
  }
}

puppeteer();
