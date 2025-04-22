import puppeteer from 'puppeteer';
import fs from 'fs';
import dotenv from 'dotenv';
import { log } from 'console';

import * as xlsx from 'xlsx';

dotenv.config();



(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();


  await page.goto('https://qalam.nust.edu.pk/web/login', { waitUntil: 'domcontentloaded' });


  //GET PASSWORD AND USERNAME FROM ENV FILE
  const username = process.env.NUST_USERNAME;
  const password = process.env.PASSWORD;
  
  //TYPE  EMAIL AND PASSWORD 
  await page.type('#login', username);
  await page.type('#password', password);

  await Promise.all([
    page.waitForNavigation(), // wait for the page to load after login
    page.click('button[type="submit"]') // use generic selector for the login button
  ]);


  // Wait until course cards are visible
  await page.waitForSelector('a[href^="/student/course/info/"]');


  //EVAL RETURNS OBJECT CONTAINING ALL LINK TAGS THAT HAVE THIS HREF , ALL THESE ARE COURSES, SO THIS PROVIDES US WITH OBJECT CONTAINING THE COURSES INFO
  const courseLinks = await page.$$eval('a[href^="/student/course/info/"]', els =>
    els.map(el => ({
      href: el.href,
      title: el.querySelector('span')?.innerText.trim(),
      teacher: el.querySelector('.card-title')?.innerText.trim()
    }))
  );

  console.log(courseLinks);

  fs.writeFile('course_data.json', JSON.stringify(courseLinks),(err)=>{
    if(err){
        console.log('Unable to get course Links');
    }
    else{
        console.log('Course data grabed successfully');
    }
  });

  function toUnderscore(str) {
    return str.trim().replace(/\s+/g, '_');
  }

  let count=0;

  //let listofrecords = ["COAL_attendance.json","Expo_attendance.json","Web_attendance.json","Auto_attendance.json","ADBMS_attendance.json","AP_attendance.json"];
  let listofrecords = [];
  for(const link of courseLinks){
    await page.goto(link.href.replace('info','attendance'),{waitUntil:'domcontentloaded'});

    let courseText = await page.$eval('li.md-color-blue-grey-900 > span',el=>el.textContent.trim());
    let courseText2 = toUnderscore(courseText);
    listofrecords.push(courseText2);

    if(!fs.existsSync(listofrecords[count])){
  const attendaced = await page.evaluate(()=>{
  
   const rows = Array.from(document.querySelectorAll('table tbody tr'));
  
   return rows.map((row)=>{
     const columns = row.querySelectorAll('td');
     return {
       sr_no: columns[0]?.innerText.trim(),
       date: columns[1]?.innerText.trim(),
       status: columns[2]?.innerText.trim()
     };
   });
  });
  
 
  console.log(attendaced);
  
    fs.writeFile(listofrecords[count],JSON.stringify(attendaced),(err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log(`${listofrecords[count]} Attendance Scrapped Successfully`);
        
      }
    });
  }
  else{
    console.log(`${listofrecords[count]} FILE ALREADY EXISTS`);
  }


  count++;
  }
  console.log(listofrecords);
  
  count=0;

for(const link2 of courseLinks){
let coal_oa = [];
let ap_oa = [];
let auto_oa = [];
let adbms_oa = [];
let expo_oa = [];
let web_oa = [];

try {
  const rawdata = fs.readFileSync(listofrecords[count], 'utf-8');
  if (rawdata.trim().length > 0) {
    if(count === 0){
      coal_oa = JSON.parse(rawdata);
    }
    else if(count === 1){
      expo_oa = JSON.parse(rawdata);
    }
    else if(count === 2){
      web_oa = JSON.parse(rawdata);
    }
    else if(count === 3){
      auto_oa = JSON.parse(rawdata);
    }
    else if(count === 4){
      adbms_oa = JSON.parse(rawdata);
    }
    else if(count === 5){
      ap_oa = JSON.parse(rawdata);
    }
  } else {
    console.log("File is empty, treating as no previous attendance data.");
  }
} catch (err) {
  console.error("Error reading or parsing COAL_attendance.json:", err.message);
}

  await page.goto(link2.href.replace('info','attendance'),{waitUntil:'domcontentloaded'});


  const newAttendance = await page.evaluate(()=>{
    const rows = Array.from(document.querySelectorAll('table tbody tr'));

    return rows.map((row)=>{
      const columns = row.querySelectorAll('td');
      return {
        sr_no: columns[0]?.innerText.trim(),
        date: columns[1]?.innerText.trim(),
        status: columns[2]?.innerText.trim()
      };
    });
  });

 // Filter new entries not in old attendance
const newcomp = newAttendance.filter(newItem => {
  const old_array = [coal_oa,expo_oa,web_oa,auto_oa,adbms_oa,ap_oa];
  const targetarray = old_array[count];
  return !targetarray.some(oldItem =>
    oldItem.sr_no === newItem.sr_no &&
    oldItem.date === newItem.date &&
    oldItem.status === newItem.status
  );
});

console.log(`${listofrecords[count]}`);

console.log(newAttendance);

  // Create workbook and sheet
  const ws = xlsx.utils.json_to_sheet(newAttendance);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Attendance");

// Write file to desktop
  xlsx.writeFile(wb, `${listofrecords[count]}.xlsx`);


if (newcomp.length === 0) {
  console.log("\nNo new data");
} else {
  console.log("New entries:", newcomp);
  fs.writeFile(listofrecords[count],JSON.stringify(newAttendance),(err)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log("Attendance written successfully");
      
    }
  });
}

count++;
};


await browser.close();

})();