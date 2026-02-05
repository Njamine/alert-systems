// Dashboard JavaScript

// Set user name on dashboard load
window.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('userName') || 'User';
    const userNameElement = document.getElementById('userName');
    
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // Animate impact bars on load
    animateImpactBars();
});

// Animate impact progress bars
function animateImpactBars() {
    const impactBars = document.querySelectorAll('.impact-fill');
    
    impactBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Handle event registration buttons
document.querySelectorAll('.event-item .btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const eventName = button.closest('.event-item').querySelector('h4').textContent;
        alert(`Thank you for registering for "${eventName}"! We'll send you a confirmation email shortly.`);
    });
});

// Handle quick action buttons
document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const actionText = button.querySelector('span').textContent;
        
        if (actionText.includes('Donation')) {
            alert('Redirecting to donation page...');
            // In a real app, this would redirect to a payment page
        } else if (actionText.includes('Event')) {
            alert('Redirecting to events page...');
        } else if (actionText.includes('Invite')) {
            const inviteLink = window.location.origin + '/index.html';
            if (navigator.clipboard) {
                navigator.clipboard.writeText(inviteLink).then(() => {
                    alert('Invite link copied to clipboard!');
                });
            } else {
                alert(`Share this link: ${inviteLink}`);
            }
        } else if (actionText.includes('Reports')) {
            alert('Redirecting to reports page...');
        }
    });
});

// Add smooth scroll animations for dashboard cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe dashboard cards
document.querySelectorAll('.dashboard-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});
