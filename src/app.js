import dotenv from "dotenv";
import puppeteer from "puppeteer";
import dayjs from "dayjs";
import "dayjs/locale/fr.js";

dotenv.config();
dayjs.locale("fr");

const { WEBSITE, ACCESS_CODE, PASSWORD, NODE_ENV } = process.env;

(async () => {
  const now = dayjs();
  const browser = await puppeteer.launch({ headless: NODE_ENV !== "demo" });
  const page = await browser.newPage();
  await page.goto(WEBSITE);
  await page.setViewport({ width: 640, height: 480, isMobile: true });

  await page.type("input#login.homeInput", ACCESS_CODE);
  await page.keyboard.press("Tab");
  await page.keyboard.type(PASSWORD);
  await page.screenshot({ path: "./dist/screenshots/loginPage.png" });
  await page.click("td.button");

  await page.waitForSelector("img.clubAvantage");
  await page.screenshot({ path: "./dist/screenshots/portalPage.png" });
  console.log("loginPage passed");

  await page.click("img.clubAvantage");
  console.log("portalPage passed");

  await page.setViewport({ width: 900, height: 798, isMobile: false });
  await page.screenshot({ path: "./dist/screenshots/homePage.png" });
  await page.waitForSelector("#menu_switch");
  await page.click("#menu_switch");
  console.log("homePage passed");

  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "./dist/screenshots/gestionPage.png" });
  console.log("gestionPage passed");

  await page.click(".dropdown a");
  await page.click(".dropdown-content a");
  await page.waitForSelector("tr.month");
  await page.screenshot({ path: "./dist/screenshots/comissionsPage.png" });
  console.log("comissionPage passed");

  const months = await page.$$eval(".month a[href^='#']", (monthRows) =>
    monthRows.map((month) => month.textContent)
  );
  console.log("months:", months);

  const previousMonth = now.subtract(1, "month").format("MMMM");
  const regexPreviousMonth = new RegExp(previousMonth, "i");
  const previousMonthIndex = months.findIndex((month) =>
    month.match(regexPreviousMonth)
  );

  console.log("previousMonth", previousMonth);
  console.log("previousMonthIndex", previousMonthIndex);

  await browser.close();
})();
