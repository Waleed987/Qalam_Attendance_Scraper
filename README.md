# Qalam Attendance Scraper

A Node.js web scraping tool that automates attendance tracking from the NUST Qalam portal. This tool uses Puppeteer to scrape attendance data from multiple courses and exports it to both JSON and Excel formats.

## 🎯 Features

- **Automated Login**: Securely logs into the NUST Qalam portal using environment variables
- **Multi-Course Support**: Scrapes attendance data from all enrolled courses
- **Data Export**: Exports attendance data in both JSON and Excel formats
- **Incremental Updates**: Only processes new attendance records to avoid duplicates
- **Error Handling**: Robust error handling for network issues and data parsing
- **Visual Feedback**: Browser automation runs in non-headless mode for debugging

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Active NUST Qalam portal account

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Qalam_Attendance_Scraper.git
   cd Qalam_Attendance_Scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   NUST_USERNAME=your_nust_email@nust.edu.pk
   PASSWORD=your_qalam_password
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NUST_USERNAME` | Your NUST email address | Yes |
| `PASSWORD` | Your Qalam portal password | Yes |

### File Structure

The tool generates the following files:
- `course_data.json` - Course information and links
- `[CourseName]_attendance.json` - Raw attendance data for each course
- `[CourseName]_attendance.xlsx` - Excel export of attendance data

## 🎮 Usage

### Basic Usage

Run the scraper with:
```bash
node app.js
```

### What the Tool Does

1. **Login Process**
   - Opens a browser window
   - Navigates to `https://qalam.nust.edu.pk/web/login`
   - Automatically fills in credentials from environment variables
   - Submits the login form

2. **Course Discovery**
   - Scrapes all enrolled courses from the dashboard
   - Extracts course names, teacher information, and attendance page links
   - Saves course data to `course_data.json`

3. **Attendance Scraping**
   - For each course, navigates to the attendance page
   - Extracts attendance records (Serial Number, Date, Status)
   - Saves raw data to `[CourseName]_attendance.json`

4. **Excel Export**
   - Converts attendance data to Excel format
   - Creates `[CourseName]_attendance.xlsx` files
   - Includes all attendance records with proper formatting

5. **Incremental Updates**
   - Checks for existing attendance files
   - Only processes new attendance records
   - Updates files with new data only

## 📊 Output Format

### JSON Output
```json
[
  {
    "sr_no": "1",
    "date": "2024-01-15",
    "status": "Present"
  },
  {
    "sr_no": "2", 
    "date": "2024-01-16",
    "status": "Absent"
  }
]
```

### Excel Output
- Sheet name: "Attendance"
- Columns: Serial Number, Date, Status
- Formatted for easy reading and analysis

## 🔧 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer` | ^24.6.1 | Browser automation and web scraping |
| `xlsx` | ^0.18.5 | Excel file generation |
| `dotenv` | ^16.5.0 | Environment variable management |
| `fs` | ^0.0.1-security | File system operations |

## 🛠️ Development

### Project Structure
```
Qalam_Attendance_Scraper/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
├── README.md          # This documentation
└── LICENSE.md         # License information
```

### Key Functions

- **`toUnderscore(str)`**: Converts course names to file-safe format
- **Browser Automation**: Uses Puppeteer for web scraping
- **Data Processing**: Filters and formats attendance data
- **File Management**: Handles JSON and Excel file operations

## ⚠️ Important Notes

### Security
- **Never commit your `.env` file** to version control
- Keep your credentials secure and private

### Limitations
- Requires stable internet connection
- Only works with active NUST student accounts

## 🔄 Updates

The tool automatically handles incremental updates:
- Only processes new attendance records
- Preserves existing data
- Updates files efficiently

## 📈 Future Enhancements

Potential improvements:
- Email notifications for new attendance
- Scheduled automation
- Multiple export formats

---

**Disclaimer**: This tool is for educational and personal use only. Use responsibly and in accordance with NUST's terms of service.
