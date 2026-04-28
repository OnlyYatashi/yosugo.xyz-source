document.addEventListener('DOMContentLoaded', () => {
    console.log('Elite Resells - Website Loaded');
    
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Hover effect for cards to add a slight glow
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.2)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
        });
    });
});
