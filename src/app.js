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
  try {
    const now = dayjs();
    const previousMonth = now.subtract(1, "month").format("MMMM");
    console.log(
      `Recherche du fichier des commissions pour le mois de: ${previousMonth.toUpperCase()}`
    );

    const browser = await Puppeteer.launch({ headless: NODE_ENV !== "demo" });
    const page = await browser.newPage();

    await page.setViewport({ width: 640, height: 480, isMobile: true });
    await page.goto(WEBSITE);
    await page.screenshot({ path: "./dist/screenshots/loginPage.png" });
    console.log("--> login page");

    await page.type("input#login.homeInput", ACCESS_CODE);
    await page.keyboard.press("Tab");
    await page.keyboard.type(PASSWORD);
    await page.click("td.button");
    await page.waitForSelector("img.clubAvantage");
    await page.screenshot({ path: "./dist/screenshots/portalPage.png" });
    console.log("--> portal page");

    await page.click("img.clubAvantage");
    await page.setViewport({ width: 900, height: 798, isMobile: false });
    await page.waitForSelector("#menu_switch");
    await page.screenshot({ path: "./dist/screenshots/homePage.png" });
    console.log("--> home page");

    await page.click("#menu_switch");
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });
    await page.screenshot({ path: "./dist/screenshots/gestionPage.png" });
    console.log("--> gestion page");

    await page.click(".dropdown a");
    await page.click(".dropdown-content a");
    await page.setViewport({ width: 1366, height: 798, isMobile: false });
    await page.waitForSelector("tr.month");
    await page.screenshot({ path: "./dist/screenshots/commissionsPage.png" });
    console.log("--> commission page");

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
    await page.goto(previousMonthPDFLink);

    await browser.close();
  } catch (err) {
    throw new Error(err);
  } finally {
    console.log("--> PDF downloaded");
    process.exit();
  }
}

puppeteer();
