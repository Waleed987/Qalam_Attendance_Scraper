import fs from 'fs';
import * as xlsx from 'xlsx';
import { toUnderscore } from './utils.js';

/**
 * Scrapes attendance data for a course
 */
export async function scrapeAttendance(page, courseUrl) {
  await page.goto(courseUrl.replace('info', 'attendance'), {
    waitUntil: 'domcontentloaded', 
    waitUntil: 'networkidle0', 
    timeout: 60000
  });

  const attendance = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    
    return rows.map((row) => {
      const columns = row.querySelectorAll('td');
      return {
        sr_no: columns[0]?.innerText.trim(),
        date: columns[1]?.innerText.trim(),
        status: columns[2]?.innerText.trim()
      };
    });
  });

  return attendance;
}

/**
 * Initial processing of attendance data
 */
export async function processAttendance(page, courseLinks) {
  const listOfRecords = [];
  let count = 0;

  for (const link of courseLinks) {
    await page.goto(link.href.replace('info', 'attendance'), {
      waitUntil: 'domcontentloaded', 
      waitUntil: 'networkidle0', 
      timeout: 60000
    });

    let courseText = await page.$eval('li.md-color-blue-grey-900 > span', el => el.textContent.trim());
    let courseText2 = toUnderscore(courseText);
    listOfRecords.push(courseText2);

    if (!fs.existsSync(listOfRecords[count])) {
      const attendance = await scrapeAttendance(page, link.href);
      console.log(attendance);
      
      await saveAttendanceToFile(listOfRecords[count], attendance);
    } else {
      console.log(`${listOfRecords[count]} FILE ALREADY EXISTS`);
    }

    count++;
  }
  console.log(listOfRecords);
  return listOfRecords;
}

/**
 * Compare and update attendance data
 */
export async function compareAndUpdateAttendance(page, courseLinks, listOfRecords) {
  let count = 0;

  for (const link2 of courseLinks) {
    // Read existing data
    const oldAttendance = readAttendanceFile(listOfRecords[count]);
    
    // Get new attendance data
    await page.goto(link2.href.replace('info', 'attendance'), {
      waitUntil: 'domcontentloaded', 
      waitUntil: 'networkidle0', 
      timeout: 60000
    });

    const newAttendance = await scrapeAttendance(page, link2.href);
    console.log(`${listOfRecords[count]}`);
    console.log(newAttendance);

    // Create Excel file
    saveAttendanceToExcel(newAttendance, `${listOfRecords[count]}.xlsx`);

    // Find new entries
    const newEntries = findNewAttendance(oldAttendance, newAttendance);

    if (newEntries.length === 0) {
      console.log("\nNo new data");
    } else {
      console.log("New entries:", newEntries);
      await saveAttendanceToFile(listOfRecords[count], newAttendance);
    }

    count++;
  }
}

/**
 * Save attendance data to file
 */
function saveAttendanceToFile(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data), (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`${filename} Attendance Scrapped Successfully`);
        resolve();
      }
    });
  });
}

/**
 * Read attendance data from file
 */
function readAttendanceFile(filePath) {
  try {
    const rawdata = fs.readFileSync(filePath, 'utf-8');
    if (rawdata.trim().length > 0) {
      return JSON.parse(rawdata);
    } else {
      console.log("File is empty, treating as no previous attendance data.");
      return [];
    }
  } catch (err) {
    console.error(`Error reading or parsing ${filePath}:`, err.message);
    return [];
  }
}

/**
 * Find new attendance entries
 */
function findNewAttendance(oldAttendance, newAttendance) {
  return newAttendance.filter(newItem => 
    !oldAttendance.some(oldItem =>
      oldItem.sr_no === newItem.sr_no &&
      oldItem.date === newItem.date &&
      oldItem.status === newItem.status
    )
  );
}

/**
 * Save attendance data to Excel file
 */
function saveAttendanceToExcel(data, filename) {
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Attendance");
  xlsx.writeFile(wb, filename);
}