// Authentication JavaScript

// Toggle Password Visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePassword.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
}

// Login Form Submission
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Hide previous error messages
        if (errorMessage) {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }
        
        // Validation
        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }
        
        // Simple authentication (for demo purposes)
        // In a real application, this would be handled by a backend server
        const validUsers = [
            { username: 'admin', password: 'admin123', name: 'Admin User' },
            { username: 'user', password: 'user123', name: 'John Doe' },
            { username: 'volunteer', password: 'volunteer123', name: 'Jane Smith' },
            { username: 'demo@hopefoundation.org', password: 'demo123', name: 'Demo User' }
        ];
        
        const user = validUsers.find(u => 
            (u.username === username || u.username === username.toLowerCase()) && 
            u.password === password
        );
        
        if (user) {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', user.username);
            localStorage.setItem('userName', user.name);
            
            if (rememberMe) {
                // Store for longer session (7 days)
                const expiry = new Date();
                expiry.setTime(expiry.getTime() + (7 * 24 * 60 * 60 * 1000));
                localStorage.setItem('loginExpiry', expiry.getTime());
            } else {
                // Session only (until browser closes)
                localStorage.removeItem('loginExpiry');
            }
            
            // Show success message briefly
            if (errorMessage) {
                errorMessage.style.background = '#dfd';
                errorMessage.style.color = '#3a3';
                errorMessage.style.borderLeftColor = '#3a3';
                errorMessage.textContent = 'Login successful! Redirecting...';
                errorMessage.classList.add('show');
            }
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            showError('Invalid username or password. Please try again.');
        }
    });
}

// Show error message
function showError(message) {
    if (errorMessage) {
        errorMessage.style.background = '#fee';
        errorMessage.style.color = '#c33';
        errorMessage.style.borderLeftColor = '#c33';
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Clear error after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// Check login status on page load
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginExpiry = localStorage.getItem('loginExpiry');
    const currentPage = window.location.pathname;
    
    // Check if login has expired
    if (loginExpiry) {
        const expiryTime = parseInt(loginExpiry);
        if (new Date().getTime() > expiryTime) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('userName');
            localStorage.removeItem('loginExpiry');
        }
    }
    
    // Redirect logic
    if (isLoggedIn === 'true' && currentPage.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
    
    if (isLoggedIn !== 'true' && currentPage.includes('dashboard.html')) {
        window.location.href = 'login.html';
    }
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear all stored data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userName');
        localStorage.removeItem('loginExpiry');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}
