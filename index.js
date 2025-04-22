import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { login } from './lib/auth.js';
import { getCourseLinks } from './lib/coursedata.js';
import { processAttendance, compareAndUpdateAttendance } from './lib/attendance.js';

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Login to the portal
    await login(page);

    // Get course links
    const courseLinks = await getCourseLinks(page);

    // Process initial attendance data
    const attendanceFiles = await processAttendance(page, courseLinks);

    // Compare with existing data and update
    await compareAndUpdateAttendance(page, courseLinks, attendanceFiles);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close();
  }
})();