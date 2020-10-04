import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const { WEBSITE, ACCESS_CODE, PASSWORD, NODE_ENV } = process.env;

(async () => {
  const browser = await puppeteer.launch({ headless: NODE_ENV !== "demo" });
  const page = await browser.newPage();
  await page.setViewport({ width: 640, height: 480, isMobile: true });
  await page.goto(WEBSITE);

  await page.type("input#login.homeInput", ACCESS_CODE);
  await page.keyboard.press("Tab");
  await page.keyboard.type(PASSWORD);
  await page.screenshot({ path: "./dist/screenshots/loginPage.png" });

  await page.click("td.button");
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "./dist/screenshots/portalPage.png" });

  await Promise.all([
    page.waitForSelector("img.clubAvantage"),
    await page.click("img.clubAvantage"),
    page.setViewport({ width: 1366, height: 798, isMobile: false }),
  ]);

  await page.waitForSelector(".dropdown-content");
  await page.screenshot({ path: "./dist/screenshots/homePage.png" });
  await page.click("a#menu_switch");

  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "./dist/screenshots/gestionPage.png" });

  await browser.close();
})();
