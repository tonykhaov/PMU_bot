import dotenv from "dotenv";
import Puppeteer from "puppeteer";
import dayjs from "dayjs";
import "dayjs/locale/fr.js";

dotenv.config();
dayjs.locale("fr");

const { WEBSITE, ACCESS_CODE, PASSWORD, NODE_ENV } = process.env;

async function puppeteer() {
  const now = dayjs();

  const browser = await Puppeteer.launch({ headless: NODE_ENV !== "demo" });
  const page = await browser.newPage();

  await page.setViewport({ width: 640, height: 480, isMobile: true });
  await page.goto(WEBSITE);
  await page.screenshot({ path: "./dist/screenshots/loginPage.png" });
  console.log("--> loginPage");

  await page.type("input#login.homeInput", ACCESS_CODE);
  await page.keyboard.press("Tab");
  await page.keyboard.type(PASSWORD);
  await page.click("td.button");
  await page.waitForSelector("img.clubAvantage");
  await page.screenshot({ path: "./dist/screenshots/portalPage.png" });
  console.log("--> portalPage");

  await page.click("img.clubAvantage");
  await page.setViewport({ width: 900, height: 798, isMobile: false });
  await page.waitForSelector("#menu_switch");
  await page.screenshot({ path: "./dist/screenshots/homePage.png" });
  console.log("--> homePage");

  await page.click("#menu_switch");
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "./dist/screenshots/gestionPage.png" });
  console.log("--> gestionPage");

  await page.click(".dropdown a");
  await page.click(".dropdown-content a");
  await page.waitForSelector("tr.month");
  await page.screenshot({ path: "./dist/screenshots/comissionsPage.png" });
  console.log("--> comissionPage");

  const months = await page.$$eval(".month a[href^='#']", (monthRows) =>
    monthRows.map((month) => month.textContent)
  );
  console.log("months:", months);

  const previousMonth = now.subtract(1, "month").format("MMMM");
  const regexPreviousMonth = new RegExp(previousMonth, "i");
  const previousMonthIndex = months.findIndex((month) =>
    regexPreviousMonth.test(month)
  );
  console.log("previousMonth:", previousMonth);

  await browser.close();
}

puppeteer();
