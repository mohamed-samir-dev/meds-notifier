# Medication Reminder 💊

A simple, responsive medication reminder web application with notifications and Google Calendar integration.

## Features

- ✅ **Medication Management**: Add medications with name, dosage, date, and time
- ✅ **Persistent Storage**: Uses LocalStorage to save medications across browser sessions
- ✅ **Smart Filtering**: View all, upcoming, or past medications
- ✅ **Web Notifications**: Browser notifications when medication time arrives
- ✅ **Google Calendar Integration**: One-click event creation in Google Calendar
- ✅ **Bilingual Support**: Arabic (RTL) and English (LTR) with toggle
- ✅ **Responsive Design**: Works perfectly on desktop and mobile devices
- ✅ **PWA Ready**: Installable as a Progressive Web App

## Demo

🔗 **Live Demo**: [GitHub Pages Link](https://meds-notifier.vercel.app/)

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: ES6+ features and classes
- **Web Notifications API**: Browser notifications
- **LocalStorage API**: Persistent data storage
- **Google Calendar API**: Event creation integration
- **Font Awesome**: Icons and visual elements

## Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/medication-reminder.git
   cd medication-reminder
   ```

2. **Open in browser**:

   - Simply open `index.html` in your web browser
   - Or serve using a local server:

     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js
     npx serve .
     ```

3. **Enable notifications**:
   - Click "Enable Notifications" when prompted
   - Allow notifications in your browser settings

## Usage

### Adding Medications

1. Fill in the medication form with:
   - Medication name
   - Dosage information
   - Date and time for reminder
2. Click "Add Medication"

### Managing Medications

- **View All**: See complete list of medications
- **Filter**: Use tabs to view upcoming or past medications
- **Google Calendar**: Click the calendar button to add events
- **Delete**: Remove medications you no longer need

### Notifications

- Notifications appear exactly at the scheduled time
- Works even when the browser tab is in the background
- Includes medication name, dosage, and time information

### Language Toggle

- Click the language toggle button (AR/EN) in the header
- Switches between Arabic (RTL) and English (LTR)
- All text and layout direction changes automatically

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for icons
- Google Calendar for integration
- Modern CSS techniques for responsive design

---

**Made with ❤️ for better medication management**