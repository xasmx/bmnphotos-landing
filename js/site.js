document.getElementById('year').textContent = new Date().getFullYear();

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const status = document.getElementById('contactStatus');
    const endpoint = window.BMN_CONTACT_FORM_URL || '';

    if (!endpoint || endpoint.includes('PASTE_GOOGLE_APPS_SCRIPT')) {
      setContactStatus(status, 'The contact form is not configured yet. Please email contact@bmnphotos.com.', 'error');
      return;
    }

    const formData = new FormData(form);
    const payload = new URLSearchParams();
    formData.forEach((value, key) => {
      payload.append(key, value);
    });

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
    setContactStatus(status, '', '');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: payload
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Contact form submission failed.');
      }

      form.reset();
      setContactStatus(status, 'Thank you — your inquiry has been sent.', 'success');
    } catch (error) {
      setContactStatus(status, 'Sorry, the message could not be sent. Please email contact@bmnphotos.com.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Inquiry';
      }
    }
  });
}

function setContactStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('success', 'error');
  if (type) element.classList.add(type);
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
