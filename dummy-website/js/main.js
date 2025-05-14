// Main JavaScript for the dummy website

document.addEventListener('DOMContentLoaded', function() {
    // Form submission handling
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // In a real site, this would send the form data to a server
            // For our dummy site, just show an alert
            alert(`Thank you ${name} for your message! We'll contact you at ${email} soon.`);
            contactForm.reset();
        });
    }

    // Adding smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a, footer a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only process links that point to an ID on this page
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70, // Offset for the fixed header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // CTA button interaction
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Scroll to services section when CTA is clicked
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                window.scrollTo({
                    top: servicesSection.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Adding a simple animation for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        window.addEventListener('scroll', function() {
            serviceCards.forEach(card => {
                const cardTop = card.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (cardTop < windowHeight - 100) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        });
        
        // Initial opacity for animation
        serviceCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
    }
});
