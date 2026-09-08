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
      company: '<a href="https://www.techmahindra.com/" target="_blank" style="color: inherit; text-decoration: underline;">Tech Mahindra</a>',
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
      company: '<a href="https://www.techmahindra.com/" target="_blank" style="color: inherit; text-decoration: underline;">Tech Mahindra</a>',
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

  /* --- Interactive Project Showcase Controllers (Virtual Lounge & FindXL) --- */

  // 1. Sandbox Tabs Switching
  const tabBtnLounge = document.getElementById('tabBtnLounge');
  const tabBtnFindXL = document.getElementById('tabBtnFindXL');
  const simViewLounge = document.getElementById('simViewLounge');
  const simViewFindXL = document.getElementById('simViewFindXL');

  if (tabBtnLounge && tabBtnFindXL && simViewLounge && simViewFindXL) {
    tabBtnLounge.addEventListener('click', () => {
      tabBtnLounge.classList.add('active');
      tabBtnFindXL.classList.remove('active');
      simViewLounge.classList.add('active');
      simViewFindXL.classList.remove('active');
    });

    tabBtnFindXL.addEventListener('click', () => {
      tabBtnFindXL.classList.add('active');
      tabBtnLounge.classList.remove('active');
      simViewFindXL.classList.add('active');
      simViewLounge.classList.remove('active');
      renderFindXL();
    });
  }

  // 2. Virtual Social Lounge Interactive Engine
  const loungeMessages = document.getElementById('loungeMessages');
  const loungeChatForm = document.getElementById('loungeChatForm');
  const loungeChatInput = document.getElementById('loungeChatInput');
  const vanishToggleBtn = document.getElementById('vanishToggleBtn');
  const vanishStatusText = document.getElementById('vanishStatusText');
  const replyBanner = document.getElementById('replyBanner');
  const replyTargetText = document.getElementById('replyTargetText');
  const replyCloseBtn = document.getElementById('replyCloseBtn');
  const slashChips = document.querySelectorAll('.slash-chip');

  let isVanishMode = false;
  let activeReply = null;

  // Vanish Mode Toggle
  if (vanishToggleBtn && vanishStatusText) {
    vanishToggleBtn.addEventListener('click', () => {
      isVanishMode = !isVanishMode;
      vanishToggleBtn.classList.toggle('active', isVanishMode);
      vanishStatusText.textContent = isVanishMode ? 'Vanish: ON 🔥' : 'Vanish: OFF';
      showToast(isVanishMode ? '🔥 Vanish Mode Activated! Messages auto-burn in 5s.' : 'Vanish Mode Deactivated.', isVanishMode ? 'warn' : 'info');
    });
  }

  // Floating Heart Generator function
  const triggerHeartBurst = (x, y, parentElement) => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '❤️';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    parentElement.appendChild(heart);
    setTimeout(() => heart.remove(), 950);
  };

  // Attach reaction & reply events to messages
  const bindMessageEvents = (msgEl) => {
    const bubble = msgEl.querySelector('.msg-bubble');
    const heartBtn = msgEl.querySelector('.heart-btn');
    const replyBtn = msgEl.querySelector('.reply-btn');
    const author = msgEl.querySelector('.msg-author')?.textContent || 'User';

    // Double tap / click heart on bubble
    if (bubble) {
      let lastTap = 0;
      bubble.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 350 && tapLength > 0) {
          // Double tap detected!
          const rect = msgEl.getBoundingClientRect();
          triggerHeartBurst(e.clientX - rect.left, e.clientY - rect.top, msgEl);
          showToast('❤️ Heart reaction sent!', 'success');
        }
        lastTap = currentTime;
      });
    }

    if (heartBtn) {
      heartBtn.addEventListener('click', (e) => {
        const rect = msgEl.getBoundingClientRect();
        triggerHeartBurst(e.clientX - rect.left, e.clientY - rect.top, msgEl);
      });
    }

    if (replyBtn) {
      replyBtn.addEventListener('click', () => {
        const previewText = bubble ? bubble.textContent.trim().slice(0, 45) + '...' : '';
        activeReply = { author, text: previewText };
        if (replyBanner && replyTargetText) {
          replyTargetText.textContent = `Replying to ${author}: "${previewText}"`;
          replyBanner.classList.remove('hidden');
          if (loungeChatInput) loungeChatInput.focus();
        }
      });
    }
  };

  document.querySelectorAll('.chat-msg').forEach(bindMessageEvents);

  if (replyCloseBtn && replyBanner) {
    replyCloseBtn.addEventListener('click', () => {
      activeReply = null;
      replyBanner.classList.add('hidden');
    });
  }

  // Slash commands quick click
  slashChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd === '/shrug') {
        if (loungeChatInput) {
          loungeChatInput.value += ' ¯\\_(ツ)_/¯';
          loungeChatInput.focus();
        }
      } else {
        executeSlashCommand(cmd);
      }
    });
  });

  const executeSlashCommand = (cmd) => {
    if (cmd === '/dice') {
      const roll = Math.floor(Math.random() * 6) + 1;
      postMessage('Sujan (Guest)', `🎲 Rolled a dice: **${roll}**!`, false);
    } else if (cmd === '/poll') {
      postMessage('Sujan (Guest)', `📊 Quick Poll: Best P2P feature?\n1️⃣ WebRTC Video (42%)\n2️⃣ Audio Equalizer (35%)\n3️⃣ Vanish Chat (23%)`, false);
    } else if (cmd === '/8ball') {
      const answers = ['Without a doubt!', 'Yes definitely.', 'Ask again later.', 'My sources say yes! 🚀', 'Outlook good.'];
      const pick = answers[Math.floor(Math.random() * answers.length)];
      postMessage('Magic 8-Ball 🎱', pick, false);
    }
  };

  const postMessage = (author, text, isVanishing) => {
    if (!loungeMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    
    let replyHtml = '';
    if (activeReply) {
      replyHtml = `<div style="font-size:0.7rem; color:var(--color-primary); margin-bottom:0.2rem; border-left: 2px solid var(--color-primary); padding-left:0.4rem;">↩️ In reply to ${activeReply.author}</div>`;
      activeReply = null;
      if (replyBanner) replyBanner.classList.add('hidden');
    }

    const vanishTag = isVanishing ? ' <span style="color:#f87171; font-size:0.65rem; font-weight:bold;">[🔥 5s Vanish]</span>' : '';

    msgDiv.innerHTML = `
      <div class="msg-avatar" style="background: linear-gradient(135deg, #6366f1, #a855f7);">S</div>
      <div class="msg-body">
        <div class="msg-meta">
          <span class="msg-author">${author}</span>
          <span class="msg-time">Just now${vanishTag}</span>
        </div>
        ${replyHtml}
        <div class="msg-bubble ${isVanishing ? 'vanish' : ''}">${text}</div>
      </div>
      <div class="msg-quick-actions">
        <button class="msg-act-btn heart-btn" data-action="heart" type="button" title="Heart reaction">❤️</button>
        <button class="msg-act-btn reply-btn" data-action="reply" type="button" title="Swipe to reply">↩️</button>
      </div>
    `;

    loungeMessages.appendChild(msgDiv);
    bindMessageEvents(msgDiv);
    loungeMessages.scrollTop = loungeMessages.scrollHeight;

    if (isVanishing) {
      setTimeout(() => {
        const bubble = msgDiv.querySelector('.msg-bubble');
        if (bubble) bubble.classList.add('burn-out');
        setTimeout(() => {
          msgDiv.remove();
          showToast('🔥 Vanish message was safely destroyed!', 'info');
        }, 650);
      }, 5000);
    }
  };

  if (loungeChatForm && loungeChatInput) {
    loungeChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = loungeChatInput.value.trim();
      if (!val) return;

      if (val.startsWith('/')) {
        executeSlashCommand(val);
      } else {
        postMessage('Sujan (Guest)', val, isVanishMode);
      }
      loungeChatInput.value = '';
    });
  }

  // 3. Audio Equalizer Canvas Animation
  const eqCanvas = document.getElementById('loungeEqCanvas');
  const eqToggleBtn = document.getElementById('eqToggleBtn');
  const eqPlayIcon = document.getElementById('eqPlayIcon');
  const eqPlayLabel = document.getElementById('eqPlayLabel');
  const volLofi = document.getElementById('volLofi');
  const volRain = document.getElementById('volRain');
  const volCafe = document.getElementById('volCafe');
  const volLofiVal = document.getElementById('volLofiVal');
  const volRainVal = document.getElementById('volRainVal');
  const volCafeVal = document.getElementById('volCafeVal');

  if (volLofi && volLofiVal) {
    volLofi.addEventListener('input', (e) => volLofiVal.textContent = `${e.target.value}%`);
  }
  if (volRain && volRainVal) {
    volRain.addEventListener('input', (e) => volRainVal.textContent = `${e.target.value}%`);
  }
  if (volCafe && volCafeVal) {
    volCafe.addEventListener('input', (e) => volCafeVal.textContent = `${e.target.value}%`);
  }

  if (eqCanvas) {
    const eqCtx = eqCanvas.getContext('2d');
    let isEqPlaying = true;
    let eqBars = Array.from({ length: 24 }, () => Math.random() * 45 + 15);

    const drawEq = () => {
      eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);
      const barWidth = (eqCanvas.width / eqBars.length) - 4;

      for (let i = 0; i < eqBars.length; i++) {
        if (isEqPlaying) {
          const lofiFactor = (volLofi ? parseInt(volLofi.value) : 70) / 100;
          eqBars[i] += (Math.random() - 0.5) * 10 * lofiFactor;
          eqBars[i] = Math.max(6, Math.min(eqCanvas.height - 10, eqBars[i]));
        }

        const x = i * (barWidth + 4);
        const y = eqCanvas.height - eqBars[i];

        const grad = eqCtx.createLinearGradient(0, eqCanvas.height, 0, 0);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#ec4899');

        eqCtx.fillStyle = grad;
        eqCtx.beginPath();
        if (eqCtx.roundRect) {
          eqCtx.roundRect(x, y, barWidth, eqBars[i], 3);
        } else {
          eqCtx.rect(x, y, barWidth, eqBars[i]);
        }
        eqCtx.fill();
      }

      requestAnimationFrame(drawEq);
    };

    drawEq();

    if (eqToggleBtn) {
      eqToggleBtn.addEventListener('click', () => {
        isEqPlaying = !isEqPlaying;
        if (eqPlayLabel) eqPlayLabel.textContent = isEqPlaying ? 'Pause Spectrum' : 'Resume Spectrum';
        if (eqPlayIcon) {
          eqPlayIcon.setAttribute('data-lucide', isEqPlaying ? 'pause' : 'play');
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      });
    }
  }

  // TTS Reader
  const btnSpeakDemo = document.getElementById('btnSpeakDemo');
  if (btnSpeakDemo) {
    btnSpeakDemo.addEventListener('click', () => {
      const msgs = document.querySelectorAll('.lounge-messages .msg-bubble');
      const lastMsg = msgs[msgs.length - 1]?.textContent || 'Welcome to the Virtual Lounge!';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastMsg);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        showToast('🔊 Text-to-Speech speaking: "' + lastMsg.slice(0, 30) + '..."', 'info');
      } else {
        showToast('🔊 Speech synthesizer simulated for: "' + lastMsg.slice(0, 30) + '..."', 'info');
      }
    });
  }

  // 4. FindXL Search Engine
  const sampleProducts = [
    { sku: "XL-0101", name: "Pro Studio Wireless Headphones", category: "Audio", price: "$299.00", stock: 84, status: "in-stock" },
    { sku: "XL-0102", name: "Ultra-Light Carbon Mechanical Keyboard", category: "Accessories", price: "$149.00", stock: 38, status: "in-stock" },
    { sku: "XL-0103", name: "4K HDR Ultra-Wide Gaming Display", category: "Electronics", price: "$899.99", stock: 4, status: "low-stock" },
    { sku: "XL-0104", name: "Smart Fitness Watch V3 Titanium", category: "Wearables", price: "$349.50", stock: 62, status: "in-stock" },
    { sku: "XL-0105", name: "NVMe M.2 2TB Extreme SSD", category: "Storage", price: "$189.00", stock: 12, status: "in-stock" },
    { sku: "XL-0106", name: "Noise-Cancelling Studio Earbuds Pro", category: "Audio", price: "$179.00", stock: 0, status: "out-of-stock" },
    { sku: "XL-0107", name: "Ergonomic Vertical Optical Mouse", category: "Accessories", price: "$69.99", stock: 53, status: "in-stock" },
    { sku: "XL-0108", name: "Thunderbolt 4 Multi-Port Docking Station", category: "Electronics", price: "$229.00", stock: 21, status: "in-stock" },
    { sku: "XL-0109", name: "External Rugged 4TB Backup Drive", category: "Storage", price: "$139.95", stock: 3, status: "low-stock" },
    { sku: "XL-0110", name: "Smart Health & Sleep Tracker Ring", category: "Wearables", price: "$279.00", stock: 19, status: "in-stock" },
    { sku: "XL-0111", name: "Broadcast USB Condenser Microphone", category: "Audio", price: "$129.99", stock: 45, status: "in-stock" },
    { sku: "XL-0112", name: "USB-C Magnetic Braided Cable (2m)", category: "Accessories", price: "$24.50", stock: 140, status: "in-stock" },
    { sku: "XL-0113", name: "Portable Dual-Screen Laptop Extender", category: "Electronics", price: "$329.00", stock: 2, status: "low-stock" },
    { sku: "XL-0114", name: "Biometric Heart Rate Sport Armband", category: "Wearables", price: "$89.00", stock: 31, status: "in-stock" },
    { sku: "XL-0115", name: "High-Speed MicroSDXC 512GB Card", category: "Storage", price: "$59.99", stock: 0, status: "out-of-stock" },
    { sku: "XL-0116", name: "Surround Sound Home Theater Bar", category: "Audio", price: "$499.00", stock: 14, status: "in-stock" },
    { sku: "XL-0117", name: "Aluminium Laptop Cooling Stand Pro", category: "Accessories", price: "$49.95", stock: 75, status: "in-stock" },
    { sku: "XL-0118", name: "Wi-Fi 7 Tri-Band Mesh Router Hub", category: "Electronics", price: "$399.00", stock: 18, status: "in-stock" },
    { sku: "XL-0119", name: "Solar Charging Rugged Adventure Watch", category: "Wearables", price: "$449.00", stock: 5, status: "low-stock" },
    { sku: "XL-0120", name: "Enterprise NVMe PCIe 4.0 4TB SSD", category: "Storage", price: "$379.00", stock: 22, status: "in-stock" },
    { sku: "XL-0121", name: "Reference Studio Monitor Speakers", category: "Audio", price: "$349.00", stock: 11, status: "in-stock" },
    { sku: "XL-0122", name: "Desk Mat XXL Spill-Resistant Felt", category: "Accessories", price: "$34.00", stock: 88, status: "in-stock" },
    { sku: "XL-0123", name: "4K 60FPS Streaming Webcam with Ring Light", category: "Electronics", price: "$159.00", stock: 0, status: "out-of-stock" },
    { sku: "XL-0124", name: "Smart ECG Health Vital Monitor", category: "Wearables", price: "$199.00", stock: 27, status: "in-stock" },
    { sku: "XL-0125", name: "Compact External SSD 1TB USB 3.2", category: "Storage", price: "$99.00", stock: 63, status: "in-stock" },
    { sku: "XL-0126", name: "Open-Back Audiophile Headphones", category: "Audio", price: "$429.00", stock: 7, status: "low-stock" },
    { sku: "XL-0127", name: "Programmable Macro Stream Controller", category: "Accessories", price: "$149.99", stock: 33, status: "in-stock" },
    { sku: "XL-0128", name: "GaN Fast Charger 140W Dual USB-C", category: "Electronics", price: "$79.00", stock: 110, status: "in-stock" },
    { sku: "XL-0129", name: "Hybrid Smartwatch Sapphire Crystal", category: "Wearables", price: "$299.00", stock: 15, status: "in-stock" },
    { sku: "XL-0130", name: "Hardware Encrypted USB 3.0 Flash Drive", category: "Storage", price: "$85.00", stock: 40, status: "in-stock" }
  ];

  const findxlQuery = document.getElementById('findxlQuery');
  const findxlClearBtn = document.getElementById('findxlClearBtn');
  const findxlCategoryFilter = document.getElementById('findxlCategoryFilter');
  const findxlRegexToggle = document.getElementById('findxlRegexToggle');
  const findxlTableBody = document.getElementById('findxlTableBody');
  const findxlEmptyState = document.getElementById('findxlEmptyState');
  const findxlPerfTime = document.getElementById('findxlPerfTime');
  const findxlMatchCount = document.getElementById('findxlMatchCount');
  const findxlExportBtn = document.getElementById('findxlExportBtn');

  const highlightMatches = (text, query, isRegex) => {
    if (!query) return text;
    try {
      const regex = isRegex ? new RegExp(`(${query})`, 'gi') : new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="findxl-highlight">$1</mark>');
    } catch {
      return text;
    }
  };

  const renderFindXL = () => {
    if (!findxlTableBody) return;

    const t0 = performance.now();
    const query = findxlQuery ? findxlQuery.value.trim() : '';
    const category = findxlCategoryFilter ? findxlCategoryFilter.value : 'all';
    const isRegex = findxlRegexToggle ? findxlRegexToggle.checked : false;

    if (findxlClearBtn) {
      findxlClearBtn.classList.toggle('hidden', !query);
    }

    let regexObj = null;
    let regexError = false;
    if (query && isRegex) {
      try {
        regexObj = new RegExp(query, 'i');
      } catch {
        regexError = true;
      }
    }

    const filtered = sampleProducts.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (!query) return true;
      if (regexError) return false;

      const targetStr = `${item.sku} ${item.name} ${item.category} ${item.price} ${item.status}`;
      if (isRegex && regexObj) {
        return regexObj.test(targetStr);
      } else {
        return targetStr.toLowerCase().includes(query.toLowerCase());
      }
    });

    const t1 = performance.now();
    const elapsed = Math.max(0.1, (t1 - t0)).toFixed(1);

    if (findxlPerfTime) findxlPerfTime.textContent = `${elapsed}ms`;
    if (findxlMatchCount) findxlMatchCount.textContent = filtered.length;

    if (filtered.length === 0) {
      findxlTableBody.innerHTML = '';
      if (findxlEmptyState) {
        findxlEmptyState.classList.remove('hidden');
        if (regexError) {
          findxlEmptyState.querySelector('p').textContent = '⚠️ Invalid regular expression pattern. Please check your syntax.';
        } else {
          findxlEmptyState.querySelector('p').textContent = 'No matching spreadsheet rows found. Try adjusting your query or category.';
        }
      }
      return;
    }

    if (findxlEmptyState) findxlEmptyState.classList.add('hidden');

    findxlTableBody.innerHTML = filtered.map(item => {
      const statusLabel = item.status === 'in-stock' ? 'In Stock' : item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock';
      return `
        <tr>
          <td class="findxl-sku">${highlightMatches(item.sku, query, isRegex)}</td>
          <td><strong>${highlightMatches(item.name, query, isRegex)}</strong></td>
          <td>${highlightMatches(item.category, query, isRegex)}</td>
          <td>${highlightMatches(item.price, query, isRegex)}</td>
          <td>${item.stock} units</td>
          <td><span class="stock-badge ${item.status}">${statusLabel}</span></td>
        </tr>
      `;
    }).join('');
  };

  if (findxlQuery) {
    findxlQuery.addEventListener('input', renderFindXL);
  }
  if (findxlClearBtn) {
    findxlClearBtn.addEventListener('click', () => {
      findxlQuery.value = '';
      renderFindXL();
      findxlQuery.focus();
    });
  }
  if (findxlCategoryFilter) {
    findxlCategoryFilter.addEventListener('change', renderFindXL);
  }
  if (findxlRegexToggle) {
    findxlRegexToggle.addEventListener('change', renderFindXL);
  }

  if (findxlExportBtn) {
    findxlExportBtn.addEventListener('click', () => {
      const query = findxlQuery ? findxlQuery.value.trim() : '';
      const category = findxlCategoryFilter ? findxlCategoryFilter.value : 'all';
      const isRegex = findxlRegexToggle ? findxlRegexToggle.checked : false;

      let regexObj = null;
      if (query && isRegex) {
        try { regexObj = new RegExp(query, 'i'); } catch {}
      }

      const filtered = sampleProducts.filter(item => {
        if (category !== 'all' && item.category !== category) return false;
        if (!query) return true;
        const targetStr = `${item.sku} ${item.name} ${item.category} ${item.price} ${item.status}`;
        return isRegex && regexObj ? regexObj.test(targetStr) : targetStr.toLowerCase().includes(query.toLowerCase());
      });

      let csv = 'SKU,Product Name,Category,Price,Inventory Units,Status\n';
      filtered.forEach(r => {
        csv += `"${r.sku}","${r.name.replace(/"/g, '""')}","${r.category}","${r.price}",${r.stock},"${r.status}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'findxl_export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${filtered.length} rows to findxl_export.csv (Client-side)!`, 'success');
    });
  }

  // Initial render of FindXL table
  renderFindXL();

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
