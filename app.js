import puppeteer from 'puppeteer';
import fs from 'fs';
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();


(async () => {
  const browser = await puppeteer.launch({ headless: false });
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


  await page.goto('https://qalam.nust.edu.pk/student/course/attendance/1901777',{waitUntil:'domcontentloaded'});


  if(!fs.existsSync('COAL_attendance.json')){
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

  fs.writeFile('COAL_attendance.json',JSON.stringify(attendaced),(err)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log("Attendance Scrapped Successfully");
      
    }
  });
}
else{
  console.log("COAL ATTENDANCE FILE ALREADY EXISTS");
  
}
  
let coal_oa = [];

try {
  const rawdata = fs.readFileSync('COAL_attendance.json', 'utf-8');
  if (rawdata.trim().length > 0) {
    coal_oa = JSON.parse(rawdata);
  } else {
    console.log("File is empty, treating as no previous attendance data.");
  }
} catch (err) {
  console.error("Error reading or parsing COAL_attendance.json:", err.message);
}

  await page.goto('https://qalam.nust.edu.pk/student/course/attendance/1901777',{waitUntil:'domcontentloaded'});


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
  return !coal_oa.some(oldItem =>
    oldItem.sr_no === newItem.sr_no &&
    oldItem.date === newItem.date &&
    oldItem.status === newItem.status
  );
});


console.log(newAttendance);

if (newcomp.length === 0) {
  console.log("\nNo new data");
} else {
  console.log("New entries:", newcomp);
  fs.writeFile('COAL_attendance.json',JSON.stringify(newAttendance),(err)=>{
    if(err){
      console.log(err);
    }
    else{
      console.log("Attendance written successfully");
      
    }
  });
}
  


  

})();