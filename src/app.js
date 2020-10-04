import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const { WEBSITE, ACCESS_CODE, PASSWORD } = process.env;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(WEBSITE);
  await page.screenshot({ path: "./dist/screenshots/loginPage.png" });

  await browser.close();
})();
