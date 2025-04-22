export async function login(page) {
    await page.goto('https://qalam.nust.edu.pk/web/login', { waitUntil: 'domcontentloaded' });
  
    // Get password and username from env file
    const username = process.env.NUST_USERNAME;
    const password = process.env.PASSWORD;
    
    // Type email and password 
    await page.type('#login', username);
    await page.type('#password', password);
  
    await Promise.all([
      page.waitForNavigation(), // wait for the page to load after login
      page.click('button[type="submit"]') // use generic selector for the login button
    ]);
    
    console.log('Login successful');
  }