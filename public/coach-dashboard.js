// Simple navigation script for the coach dashboard
document.addEventListener('DOMContentLoaded', function() {
  const navItems = document.querySelectorAll('.nav-item');
  const contentSections = document.querySelectorAll('.content-section');

  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));

      // Add active class to clicked item
      this.classList.add('active');

      // Hide all content sections
      contentSections.forEach(section => section.classList.remove('active'));

      // Show the corresponding content section
      const sectionId = this.getAttribute('data-section');
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add('active');
      }
    });
  });

  // Mobile menu toggle (if needed)
  // This can be expanded for mobile responsiveness
});