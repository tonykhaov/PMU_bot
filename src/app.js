import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const { WEBSITE, ACCESS_CODE, PASSWORD } = process.env;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(WEBSITE);

  await page.type("input#login.homeInput", ACCESS_CODE);
  await page.keyboard.press("Tab");
  await page.keyboard.type(PASSWORD);
  await page.screenshot({ path: "./dist/screenshots/loginPage.png" });

  await page.click("td.button");
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.screenshot({ path: "./dist/screenshots/portalPage.png" });

  await browser.close();
})();
