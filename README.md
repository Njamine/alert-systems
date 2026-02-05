# Hope Foundation - NGO Website

A fully functional, responsive website for an NGO with user authentication and dashboard features. This website can be easily deployed to GitHub Pages.

## Features

- **Modern, Responsive Design**: Beautiful UI that works on all devices
- **User Authentication**: Login system with protected dashboard
- **Multiple Sections**: Home, About, Programs, Impact, and Contact
- **Interactive Dashboard**: User dashboard with stats, announcements, and quick actions
- **Smooth Animations**: Engaging user experience with smooth transitions
- **GitHub Pages Ready**: Easy deployment to GitHub Pages

## Demo Credentials

You can login with any of these accounts:

| Username | Password | Name |
|----------|----------|------|
| `admin` | `admin123` | Admin User |
| `user` | `user123` | John Doe |
| `volunteer` | `volunteer123` | Jane Smith |
| `demo@hopefoundation.org` | `demo123` | Demo User |

## Project Structure

```
ngo-website/
├── index.html          # Main homepage
├── login.html          # Login page
├── dashboard.html      # User dashboard (protected)
├── styles.css          # Main stylesheet
├── login.css           # Login page styles
├── dashboard.css       # Dashboard styles
├── script.js           # Main JavaScript
├── auth.js             # Authentication logic
├── dashboard.js        # Dashboard functionality
└── README.md           # This file
```

## Local Development

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No build process or dependencies required - it's pure HTML, CSS, and JavaScript!

## Deployment to GitHub Pages

### Method 1: Using GitHub Web Interface

1. Create a new repository on GitHub
2. Upload all files from the `ngo-website` folder to the repository
3. Go to **Settings** → **Pages**
4. Under **Source**, select the branch (usually `main` or `master`)
5. Select the folder (usually `/root`)
6. Click **Save**
7. Your site will be live at `https://yourusername.github.io/repository-name/`

### Method 2: Using Git Command Line

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: NGO website"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Then follow steps 3-7 from Method 1 to enable GitHub Pages.

## Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2c5f8d;    /* Main brand color */
    --secondary-color: #4a90a4;  /* Secondary color */
    --accent-color: #ff6b6b;     /* Accent/highlight color */
}
```

### Changing Content

- Edit `index.html` to modify homepage content
- Update organization name, mission, and programs
- Modify contact information in the contact section

### Adding More Users

Edit the `validUsers` array in `auth.js`:

```javascript
const validUsers = [
    { username: 'newuser', password: 'newpass123', name: 'New User' },
    // Add more users here
];
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Note

⚠️ **Important**: This is a demo website with client-side authentication. For a production website, you should:

- Implement server-side authentication
- Use secure password hashing
- Add HTTPS/SSL certificates
- Implement proper session management
- Add CSRF protection
- Use a secure database for user storage

## License

This project is open source and available for use.

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for making a difference**
