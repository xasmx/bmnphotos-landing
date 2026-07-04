document.getElementById('year').textContent = new Date().getFullYear();

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') || '';
    const email = formData.get('email') || '';
    const sessionType = formData.get('session_type') || '';
    const message = formData.get('message') || '';

    const subject = encodeURIComponent(`BMN Photos Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Session Type: ${sessionType}\n\n` +
      `Message:\n${message}`
    );

    window.location.href = `mailto:contact@bmnphotos.com?subject=${subject}&body=${body}`;
  });
}
// Keep the portfolio dropdown tidy on click/touch and keyboard use.
document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  dropdown.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      dropdown.removeAttribute('open');
    });
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('.nav-dropdown[open]').forEach((dropdown) => {
    if (!dropdown.contains(event.target)) {
      dropdown.removeAttribute('open');
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.nav-dropdown[open]').forEach((dropdown) => {
      dropdown.removeAttribute('open');
    });
  }
});
