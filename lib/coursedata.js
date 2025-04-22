import fs from 'fs';

/**
 * Extracts course links and information from the dashboard
 */
export async function getCourseLinks(page) {
  // Wait until course cards are visible
  await page.waitForSelector('a[href^="/student/course/info/"]');

  // Get object containing all link tags that have this href
  const courseLinks = await page.$$eval('a[href^="/student/course/info/"]', els =>
    els.map(el => ({
      href: el.href,
      title: el.querySelector('span')?.innerText.trim(),
      teacher: el.querySelector('.card-title')?.innerText.trim()
    }))
  );

  console.log(courseLinks);

  fs.writeFile('course_data.json', JSON.stringify(courseLinks), (err) => {
    if (err) {
      console.log('Unable to get course links');
    } else {
      console.log('Course data grabbed successfully');
    }
  });

  return courseLinks;
}