/**
 * ACE Academic Centre - Interactive Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar Effect on Scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Menu Toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking on any nav link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // 3. Stats Counter Animation on Viewport Entry
  const counterElements = document.querySelectorAll('.stat-number-counter');
  let animated = false;

  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // easeOutExpo
      const currentCount = Math.round(target * (progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)));
      
      el.textContent = currentCount + suffix;

      if (frame === totalFrames) {
        clearInterval(counter);
        el.textContent = target + suffix;
      }
    }, frameRate);
  };

  const observerOptions = {
    threshold: 0.3
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(counterEl => countUp(counterEl));
        observer.disconnect();
      }
    });
  }, observerOptions);

  const statsSection = document.getElementById('statsSection');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // 4. Course Category Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCategory = btn.getAttribute('data-filter');

      courseCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCategory.includes(filterCategory)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // 5. Modal Management
  const modalBackdrop = document.getElementById('enquiryModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const openModalButtons = document.querySelectorAll('[data-open-modal]');
  const modalCourseSelect = document.getElementById('modalCourseSelect');

  const openModal = (courseName = '') => {
    if (modalCourseSelect && courseName) {
      // Find matching option
      for (let i = 0; i < modalCourseSelect.options.length; i++) {
        if (modalCourseSelect.options[i].value.toLowerCase().includes(courseName.toLowerCase()) || 
            courseName.toLowerCase().includes(modalCourseSelect.options[i].value.toLowerCase())) {
          modalCourseSelect.selectedIndex = i;
          break;
        }
      }
    }
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  openModalButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const course = btn.getAttribute('data-course-name') || '';
      openModal(course);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });

  // 6. Quick Enquiry & Contact Form Submissions (With WhatsApp generation)
  const handleFormSubmit = (formId, statusMsgId) => {
    const form = document.getElementById(formId);
    const statusMsg = document.getElementById(statusMsgId);

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = form.querySelector('[name="student_name"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const campusInput = form.querySelector('[name="campus"]');
      const courseInput = form.querySelector('[name="course"]');
      const messageInput = form.querySelector('[name="message"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const campus = campusInput ? campusInput.value : 'Taliparamba Campus';
      const course = courseInput ? courseInput.value : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !phone) {
        if (statusMsg) {
          statusMsg.textContent = 'Please enter your name and contact phone number.';
          statusMsg.className = 'form-status-msg error';
        }
        return;
      }

      // Build WhatsApp message URL
      const text = encodeURIComponent(
        `*New Admission Enquiry for EDUAURA ACADEMY*\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Phone:* ${phone}\n` +
        `📍 *Preferred Campus:* ${campus}\n` +
        `📚 *Course:* ${course || 'General Enquiry'}\n` +
        (message ? `💬 *Message:* ${message}` : '')
      );

      const whatsappUrl = `https://wa.me/917736384416?text=${text}`;

      if (statusMsg) {
        statusMsg.textContent = 'Opening WhatsApp with your enquiry...';
        statusMsg.className = 'form-status-msg success';
      }

      // Open WhatsApp chat in a new tab
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        form.reset();
        if (formId === 'modalEnquiryForm') {
          setTimeout(closeModal, 1200);
        }
      }, 500);
    });
  };

  handleFormSubmit('contactForm', 'contactStatusMsg');
  handleFormSubmit('modalEnquiryForm', 'modalStatusMsg');
});
