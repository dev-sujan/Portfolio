document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* --- Toast Notification System --- */
  const toastContainer = document.getElementById('toastContainer');

  const showToast = (message, type = 'info') => {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-item ${type === 'success' ? 'success' : ''}`;
    
    // Choose icon based on type
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warn') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon ${type === 'success' ? 'success' : ''}">${icon}</span>
      <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('hide');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 4000);
  };

  /* --- Mobile Navbar Toggle --- */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-show');
      const isOpen = navMenu.classList.contains('mobile-show');
      mobileToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });

    // Close menu when clicking nav link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-show');
        mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      });
    });
  }

  /* --- Multi-Theme Switching Controller --- */
  const themeBtn = document.getElementById('themeBtn');
  const themeDropdown = document.getElementById('themeDropdown');
  const themeLabel = document.getElementById('themeLabel');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  if (themeBtn && themeDropdown) {
    // Toggle dropdown visibility
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
      themeDropdown.classList.remove('show');
    });

    // Switch themes
    dropdownItems.forEach(item => {
      item.addEventListener('click', () => {
        const theme = item.getAttribute('data-theme');
        
        // Update active state in UI
        dropdownItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Apply theme to body
        document.body.className = ''; // reset classes
        document.body.classList.add(`theme-${theme}`);
        
        // Update toggle button text
        const capitalized = theme.charAt(0).toUpperCase() + theme.slice(1);
        const displayName = theme === 'light' ? 'Pure Light' : theme === 'emerald' ? 'Shopify Emerald' : capitalized;
        themeLabel.textContent = displayName;
        
        // Save theme to localStorage
        localStorage.setItem('portfolio-theme', theme);
        
        showToast(`Theme changed to ${displayName}`, 'success');
      });
    });

    // Load saved theme on startup without firing toast
    const savedTheme = localStorage.getItem('portfolio-theme') || 'obsidian';
    const defaultActiveItem = document.querySelector(`.dropdown-item[data-theme="${savedTheme}"]`);
    if (defaultActiveItem) {
      // Trigger theme set programmatically
      dropdownItems.forEach(i => i.classList.remove('active'));
      defaultActiveItem.classList.add('active');
      document.body.className = '';
      document.body.classList.add(`theme-${savedTheme}`);
      const capitalized = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
      themeLabel.textContent = savedTheme === 'light' ? 'Pure Light' : savedTheme === 'emerald' ? 'Shopify Emerald' : capitalized;
    }
  }

  /* --- Background Particle System (Canvas) --- */
  const canvas = document.getElementById('bg-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position
    let mouse = { x: null, y: null, radius: 130 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.baseOpacity = Math.random() * 0.25 + 0.1;
        this.opacity = this.baseOpacity;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around borders
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Interaction with mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            // Brighten close particles
            const factor = 1 - dist / mouse.radius;
            this.opacity = Math.min(0.7, this.baseOpacity + factor * 0.45);
          } else {
            this.opacity = this.baseOpacity;
          }
        } else {
          this.opacity = this.baseOpacity;
        }
      }

      draw() {
        // Adapt colors based on theme color
        const isLightTheme = document.body.classList.contains('theme-light');
        const isEmeraldTheme = document.body.classList.contains('theme-emerald');
        let fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        
        if (isLightTheme) {
          fillStyle = `rgba(79, 70, 229, ${this.opacity})`;
        } else if (isEmeraldTheme) {
          fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
        }

        ctx.fillStyle = fillStyle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.min(65, Math.floor((width * height) / 22000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      const isLightTheme = document.body.classList.contains('theme-light');
      const isEmeraldTheme = document.body.classList.contains('theme-emerald');
      let strokeStyleBase = '99, 102, 241';
      if (isLightTheme) {
        strokeStyleBase = '79, 70, 229';
      } else if (isEmeraldTheme) {
        strokeStyleBase = '16, 185, 129';
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.strokeStyle = `rgba(${strokeStyleBase}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Draw line to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.18;
            ctx.strokeStyle = `rgba(${strokeStyleBase}, ${alpha})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    };

    initParticles();
    animateParticles();
  }

  /* --- 3D Hover Card Tilt Effect --- */
  const tiltCards = document.querySelectorAll('.glass-panel, .brand-card, .project-card, .sim-gauge-card');
  
  tiltCards.forEach(card => {
    // Skip interactive simulator sliders
    if (card.classList.contains('sim-slider-container')) return;
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside the card
      const y = e.clientY - rect.top;  // y coordinate inside the card
      
      const width = rect.width;
      const height = rect.height;
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Calculate rotation angles (-10 to 10 degrees)
      const rotateX = ((centerY - y) / centerY) * 8; 
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.boxShadow = `
        ${-rotateY * 2}px ${rotateX * 2}px 35px rgba(99, 102, 241, 0.15),
        var(--shadow-main)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.boxShadow = 'var(--shadow-main)';
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
    });
    
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  /* --- Scroll Reveal Animations Observer --- */
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, no need to keep observing
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* --- Skill Filtering Controller --- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const skillTags = document.querySelectorAll('.skill-tag');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillTags.forEach(tag => {
        const category = tag.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          tag.classList.remove('hide');
        } else {
          tag.classList.add('hide');
        }
      });
    });
  });

  /* --- Interactive Timeline Modal --- */
  const timelineData = {
    "techmahindra-se": {
      title: "Software Engineer",
      company: "Tech Mahindra",
      period: "June 2025 — Present",
      bullets: [
        "Led core performance enhancement initiatives for global Shopify storefronts (Escentric Molecules, Bluebella, Castore), resulting in <strong>Lighthouse score boosts of 35%+</strong>.",
        "Engineered robust CI/CD automation configurations using Docker and GitHub Actions, reducing developer manual release operations by <strong>80%</strong> and improving release reliability by <strong>90%+</strong>.",
        "Drove <strong>GitHub Copilot and generative AI adoption</strong> across engineering teams, conducting training sessions that boosted adoption by <strong>60%+</strong> and developer productivity by <strong>25-35%</strong>.",
        "Conducted <strong>15+ technical interviews</strong> and mentored junior developers on Shopify development, theme performance tuning, and DevOps workflows.",
        "Promoted from Associate Software Engineer to Software Engineer within 1 year for outstanding technical contributions."
      ],
      stack: ["Shopify Liquid", "JavaScript (ES6)", "Docker", "GitHub Actions", "Cypress QA", "GitHub Copilot", "Generative AI"]
    },
    "techmahindra-ase": {
      title: "Associate Software Engineer",
      company: "Tech Mahindra",
      period: "March 2024 — June 2025",
      bullets: [
        "Configured custom Liquid theme logic, dynamic collection grids, and optimized interactive cart drawers to decrease mobile bounce rates and drive customer conversions.",
        "Developed custom <strong>Java-based testing and automation utilities</strong>, cutting down manual QA test execution times by <strong>50%+</strong> and accelerating bug detection.",
        "Collaborated with cross-functional project teams to achieve a consistent <strong>95%+ on-time sprint completion rate</strong>.",
        "Recipient of <strong>4 Bravo Awards</strong> for outstanding engineering delivery, rapid bug resolution, and team collaboration."
      ],
      stack: ["Core Java", "Shopify Liquid", "JavaScript (ES5/ES6)", "HTML5 & CSS Grid", "AJAX / JSON APIs", "JUnit"]
    },
    education: {
      title: "B.Tech in Computer Science",
      company: "Regent Education & Research Foundation (MAKAUT)",
      period: "2019 — 2023",
      bullets: [
        "Completed comprehensive training in data structures, design and analysis of algorithms, database management systems (DBMS), and modern software engineering methods.",
        "Graduated with a stellar aggregate score of <strong>85% (8.5 CGPA)</strong>.",
        "Designed and developed a responsive catalog control platform as a capstone project using web standards."
      ],
      stack: ["Core Java", "PHP & Laravel", "MySQL", "JavaScript", "Responsive Web Design"]
    },
    certs: {
      title: "AWS & AI System Certifications",
      company: "Amazon Web Services & Tech Mahindra Academies",
      period: "Issued 2024 - 2025",
      bullets: [
        "<strong>AWS Certified Cloud Practitioner</strong>: Validated foundation-level knowledge of AWS cloud services, architecture standards, security compliance, and basic operations.",
        "<strong>AI White Belt & Blue Belt</strong>: Acquired internal competencies on integrating large language models (LLMs) into theme linting processes, prompts designs, and workflow automation tooling.",
        "Active participant in tech guilds surrounding performance optimization."
      ],
      stack: ["AWS Console", "Amazon EC2 & S3", "Google Gemini API", "GitHub Copilot", "Generative AI Integration"]
    }
  };

  const timelineItems = document.querySelectorAll('.timeline-item');
  const modal = document.getElementById('timelineModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  if (modal && modalTitle && modalBody && modalClose) {
    const openModal = (id) => {
      const data = timelineData[id];
      if (!data) return;

      modalTitle.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.25rem;">
          <h3 style="font-size:1.35rem; font-weight:850; color:var(--color-text-main);">${data.title}</h3>
          <span style="font-size:0.85rem; font-weight:600; color:var(--color-primary);">${data.company} • ${data.period}</span>
        </div>
      `;

      let bulletsHtml = '<ul style="list-style-type: disc; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">';
      data.bullets.forEach(b => {
        bulletsHtml += `<li style="line-height:1.6; font-size:0.85rem; color:var(--color-text-muted);">${b}</li>`;
      });
      bulletsHtml += '</ul>';

      let stackHtml = '<div style="margin-top: 1rem;"><h4 style="font-size:0.8rem; font-weight:750; text-transform:uppercase; margin-bottom:0.6rem; color:var(--color-text-main);">Core Stack</h4><div class="modal-tech-stack">';
      data.stack.forEach(tech => {
        stackHtml += `<span class="modal-tech-badge">${tech}</span>`;
      });
      stackHtml += '</div></div>';

      modalBody.innerHTML = bulletsHtml + stackHtml;
      
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // prevent bg scroll
    };

    const closeModal = () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    timelineItems.forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-timeline-id');
        openModal(id);
      });
    });

    modalClose.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });
  }

  /* --- Hero Lighthouse Score Counter Animation --- */
  const heroLighthouseDial = document.getElementById('heroLighthouseDial');
  const heroLighthouseVal = document.getElementById('heroLighthouseVal');

  if (heroLighthouseDial && heroLighthouseVal) {
    // Dial progress circle animation values (r=16 -> circumference = 2 * PI * 16 = 100.5)
    setTimeout(() => {
      let currentVal = 0;
      const targetVal = 100;
      const duration = 1200; // ms
      const interval = 12; // ms
      const step = targetVal / (duration / interval);
      
      const counter = setInterval(() => {
        currentVal += step;
        if (currentVal >= targetVal) {
          currentVal = targetVal;
          clearInterval(counter);
        }
        
        const rounded = Math.floor(currentVal);
        heroLighthouseVal.textContent = rounded;
        
        // Update dial circle stroke-dashoffset
        const offset = 100 - rounded;
        heroLighthouseDial.setAttribute('stroke-dashoffset', offset);
      }, interval);
    }, 400);
  }

  /* --- Playground Simulator Controllers --- */

  // Simulator tabs swapping
  const tabBtnAudit = document.getElementById('tabBtnAudit');
  const tabBtnRegression = document.getElementById('tabBtnRegression');
  const simViewAudit = document.getElementById('simViewAudit');
  const simViewRegression = document.getElementById('simViewRegression');

  if (tabBtnAudit && tabBtnRegression && simViewAudit && simViewRegression) {
    tabBtnAudit.addEventListener('click', () => {
      tabBtnAudit.classList.add('active');
      tabBtnRegression.classList.remove('active');
      simViewAudit.classList.add('active');
      simViewRegression.classList.remove('active');
    });

    tabBtnRegression.addEventListener('click', () => {
      tabBtnRegression.classList.add('active');
      tabBtnAudit.classList.remove('active');
      simViewRegression.classList.add('active');
      simViewAudit.classList.remove('active');
    });
  }

  // Simulator 1: Performance Audit
  const runSimAuditBtn = document.getElementById('runSimAuditBtn');
  const simAuditLoader = document.getElementById('simAuditLoader');
  const simAuditResults = document.getElementById('simAuditResults');
  const simPerfScore = document.getElementById('simPerfScore');

  if (runSimAuditBtn && simAuditLoader && simAuditResults && simPerfScore) {
    runSimAuditBtn.addEventListener('click', () => {
      runSimAuditBtn.disabled = true;
      simAuditLoader.classList.remove('hidden');
      simAuditResults.classList.add('hidden');

      setTimeout(() => {
        simAuditLoader.classList.add('hidden');
        simAuditResults.classList.remove('hidden');
        runSimAuditBtn.disabled = false;

        // Random target score
        const targetScore = Math.floor(Math.random() * 8) + 90; // 90 - 97 (optimized score!)
        
        // Counter animation for gauge
        let currentScore = 0;
        const duration = 800; // ms
        const interval = 15;
        const step = targetScore / (duration / interval);
        
        const auditCounter = setInterval(() => {
          currentScore += step;
          if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(auditCounter);
          }
          simPerfScore.textContent = Math.floor(currentScore);
        }, interval);

        showToast('Performance theme audit completed successfully!', 'success');
      }, 1500);
    });
  }

  // Simulator 2: Visual Regression & Slider
  const runSimRegBtn = document.getElementById('runSimRegBtn');
  const simRegLoader = document.getElementById('simRegLoader');
  const simRegResults = document.getElementById('simRegResults');
  
  const sliderContainer = document.getElementById('simSliderContainer');
  const sliderCurrent = document.getElementById('simSliderCurrent');
  const sliderHandle = document.getElementById('simSliderHandle');
  let isDragging = false;

  if (runSimRegBtn && simRegLoader && simRegResults) {
    runSimRegBtn.addEventListener('click', () => {
      runSimRegBtn.disabled = true;
      simRegLoader.classList.remove('hidden');
      simRegResults.classList.add('hidden');

      setTimeout(() => {
        simRegLoader.classList.add('hidden');
        simRegResults.classList.remove('hidden');
        runSimRegBtn.disabled = false;
        
        // Reset slider to middle position
        updateSlider(50);

        showToast('CI/CD build layout analysis succeeded!', 'success');
      }, 1800);
    });
  }

  // Visual Slider Dragging Logic
  const updateSlider = (percent) => {
    if (!sliderCurrent || !sliderHandle) return;
    const capped = Math.max(0, Math.min(100, percent));
    sliderCurrent.style.width = `${capped}%`;
    sliderHandle.style.left = `${capped}%`;
  };

  const handleDrag = (clientX) => {
    if (!sliderContainer) return;
    const rect = sliderContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    updateSlider(percentage);
  };

  if (sliderHandle && sliderContainer) {
    // Attach drag events to the handle
    sliderHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    // Also support dragging directly on the container for smoother UX
    sliderContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleDrag(e.clientX);
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      handleDrag(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch Support for mobile viewports
    sliderHandle.addEventListener('touchstart', () => {
      isDragging = true;
    });

    sliderContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientX);
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientX);
      }
    });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* --- Contact Form Handler --- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = document.getElementById('cName').value;
      
      // Simulate submission success toast
      showToast(`Thank you, ${nameVal}! Your message has been sent successfully (Simulation).`, 'success');
      
      // Reset form
      contactForm.reset();
    });
  }
});
