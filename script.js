(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function throttle(fn, limit) {
    var waiting = false;
    return function() {
      if (!waiting) {
        fn.apply(this, arguments);
        waiting = true;
        setTimeout(function() {
          waiting = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    var toggle = document.querySelector('.navbar-toggler');
    var collapse = document.querySelector('.navbar-collapse');
    var nav = document.querySelector('.navbar-nav');
    var body = document.body;

    if (!toggle || !collapse) return;

    var isOpen = false;

    function openMenu() {
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      isOpen = true;
    }

    function closeMenu() {
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      isOpen = false;
    }

    function toggleMenu() {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMenu();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function(e) {
      if (isOpen && collapse && !collapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    if (nav) {
      var navLinks = nav.querySelectorAll('.nav-link');
      for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function() {
          if (isOpen) {
            closeMenu();
          }
        });
      }
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 768 && isOpen) {
        closeMenu();
      }
    }, 250);

    window.addEventListener('resize', resizeHandler);
  }

  function initSmoothScroll() {
    if (app.smoothScrollInit) return;
    app.smoothScrollInit = true;

    var isHomePage = window.location.pathname === '/' || 
                     window.location.pathname === '/index.html' || 
                     window.location.pathname.endsWith('/index.html');

    var anchors = document.querySelectorAll('a[href^="#"]');
    
    for (var i = 0; i < anchors.length; i++) {
      (function(anchor) {
        var href = anchor.getAttribute('href');
        if (href === '#' || href === '#!') return;

        if (!isHomePage && href.indexOf('#') === 0) {
          var sectionId = href.substring(1);
          if (sectionId && !anchor.hasAttribute('data-bs-toggle')) {
            anchor.setAttribute('href', '/#' + sectionId);
          }
        }

        anchor.addEventListener('click', function(e) {
          var targetHref = anchor.getAttribute('href');
          if (!targetHref || targetHref === '#' || targetHref === '#!') return;

          if (anchor.hasAttribute('data-bs-toggle')) return;

          var hashIndex = targetHref.indexOf('#');
          if (hashIndex === -1) return;

          var hash = targetHref.substring(hashIndex + 1);
          var targetElement = document.getElementById(hash);

          if (targetElement && (isHomePage || hashIndex === 0)) {
            e.preventDefault();
            var header = document.querySelector('.navbar');
            var offset = header ? header.offsetHeight : 80;
            var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            var offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            if (history.pushState) {
              history.pushState(null, null, '#' + hash);
            }
          }
        });
      })(anchors[i]);
    }
  }

  function initScrollSpy() {
    if (app.scrollSpyInit) return;
    app.scrollSpyInit = true;

    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      var scrollPos = window.pageYOffset + 100;

      sections.forEach(function(section) {
        var top = section.offsetTop;
        var bottom = top + section.offsetHeight;
        var id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(function(link) {
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            var linkHref = link.getAttribute('href');
            if (linkHref === '#' + id) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }

    var scrollHandler = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', scrollHandler);
    updateActiveLink();
  }

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    var navLinks = document.querySelectorAll('.nav-link');
    var currentPath = window.location.pathname;

    var isHomePage = currentPath === '/' || 
                     currentPath === '/index.html' || 
                     currentPath.endsWith('/index.html');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkHref = link.getAttribute('href');

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (!linkHref || linkHref.indexOf('#') === 0) continue;

      var linkPath = linkHref.split('#')[0];
      var normalizedLinkPath = linkPath.replace(/^\.?\//, '');
      var normalizedCurrentPath = currentPath.replace(/^\//, '');

      if (normalizedLinkPath === '' || normalizedLinkPath === 'index.html') {
        normalizedLinkPath = '';
      }
      if (normalizedCurrentPath === '' || normalizedCurrentPath === 'index.html') {
        normalizedCurrentPath = '';
      }

      if (normalizedLinkPath === normalizedCurrentPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else if (isHomePage && (linkHref === '/' || linkHref === '/index.html' || linkHref === 'index.html' || linkHref === '')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isLogo = img.classList.contains('navbar-brand') || img.closest('.navbar-brand');
      var isCritical = img.hasAttribute('data-critical');

      if (!img.hasAttribute('loading') && !isLogo && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      (function(image) {
        image.addEventListener('error', function() {
          var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
          image.src = svgPlaceholder;
          image.style.objectFit = 'contain';
        });
      })(img);
    }
  }

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.style.minWidth = '250px';
      toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

      container.appendChild(toast);

      var closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          toast.classList.remove('show');
          setTimeout(function() {
            if (container.contains(toast)) {
              container.removeChild(toast);
            }
          }, 150);
        });
      }

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (container.contains(toast)) {
            container.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    function validateField(field) {
      var value = field.value.trim();
      var type = field.type;
      var id = field.id;
      var fieldName = field.getAttribute('name') || id;
      var errorMsg = '';

      field.classList.remove('is-invalid');
      var existingFeedback = field.parentNode.querySelector('.invalid-feedback');
      if (existingFeedback) {
        existingFeedback.remove();
      }

      if (field.hasAttribute('required') && !value) {
        errorMsg = 'Šis lauks ir obligāts';
      } else if (value) {
        if (type === 'email' || id.toLowerCase().includes('email')) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errorMsg = 'Lūdzu, ievadiet derīgu e-pasta adresi';
          }
        } else if (type === 'tel' || id.toLowerCase().includes('phone')) {
          var phoneRegex = /^[\d\s+()-]{10,20}$/;
          if (!phoneRegex.test(value)) {
            errorMsg = 'Lūdzu, ievadiet derīgu tālruņa numuru';
          }
        } else if (id.toLowerCase().includes('name') || fieldName.toLowerCase().includes('name')) {
          var nameRegex = /^[a-zA-ZÀ-ÿ\s-']{2,50}$/;
          if (!nameRegex.test(value)) {
            errorMsg = 'Vārds drīkst saturēt tikai burtus (2-50 rakstzīmes)';
          }
        } else if (field.tagName === 'TEXTAREA' || id.toLowerCase().includes('message')) {
          if (value.length < 10) {
            errorMsg = 'Ziņojumam jābūt vismaz 10 rakstzīmēm';
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        errorMsg = 'Jums jāpiekrīt, lai turpinātu';
      }

      if (errorMsg) {
        field.classList.add('is-invalid');
        var feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = errorMsg;
        field.parentNode.appendChild(feedback);
        return false;
      }

      return true;
    }

    function validateForm(form) {
      var isValid = true;
      var fields = form.querySelectorAll('input, select, textarea');

      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (!validateField(field)) {
          isValid = false;
        }
      }

      return isValid;
    }

    var forms = document.querySelectorAll('form');

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        var fields = form.querySelectorAll('input, select, textarea');

        for (var j = 0; j < fields.length; j++) {
          fields[j].addEventListener('blur', function() {
            validateField(this);
          });

          fields[j].addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
              validateField(this);
            }
          });
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();

          if (!validateForm(form)) {
            var firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
              firstInvalid.focus();
            }
            return;
          }

          var submitBtn = form.querySelector('[type="submit"]');
          var originalText = '';

          if (submitBtn) {
            originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sūta...';
          }

          setTimeout(function() {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }

            app.notify('Paldies! Jūsu pieteikums ir saņemts.', 'success');
            form.reset();
            form.classList.remove('was-validated');

            var invalidFields = form.querySelectorAll('.is-invalid');
            for (var k = 0; k < invalidFields.length; k++) {
              invalidFields[k].classList.remove('is-invalid');
            }

            var feedbacks = form.querySelectorAll('.invalid-feedback');
            for (var m = 0; m < feedbacks.length; m++) {
              feedbacks[m].remove();
            }

            setTimeout(function() {
              window.location.href = 'thank_you.html';
            }, 1500);
          }, 1000);
        });
      })(forms[i]);
    }
  }

  function initAccordion() {
    if (app.accordionInit) return;
    app.accordionInit = true;

    var accordionButtons = document.querySelectorAll('.accordion-button');

    for (var i = 0; i < accordionButtons.length; i++) {
      (function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();

          var target = button.getAttribute('data-bs-target');
          if (!target) return;

          var collapse = document.querySelector(target);
          if (!collapse) return;

          var isExpanded = button.getAttribute('aria-expanded') === 'true';

          if (isExpanded) {
            button.setAttribute('aria-expanded', 'false');
            button.classList.add('collapsed');
            collapse.classList.remove('show');
          } else {
            var accordion = button.closest('.accordion');
            if (accordion) {
              var allButtons = accordion.querySelectorAll('.accordion-button');
              var allCollapses = accordion.querySelectorAll('.accordion-collapse');

              for (var j = 0; j < allButtons.length; j++) {
                allButtons[j].setAttribute('aria-expanded', 'false');
                allButtons[j].classList.add('collapsed');
              }

              for (var k = 0; k < allCollapses.length; k++) {
                allCollapses[k].classList.remove('show');
              }
            }

            button.setAttribute('aria-expanded', 'true');
            button.classList.remove('collapsed');
            collapse.classList.add('show');
          }
        });
      })(accordionButtons[i]);
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInit) return;
    app.scrollToTopInit = true;

    var scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Atpakaļ uz augšu');
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:50%;background:var(--color-accent);color:white;border:none;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s;z-index:1000;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';

    document.body.appendChild(scrollBtn);

    function toggleScrollBtn() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    var scrollHandler = throttle(toggleScrollBtn, 100);
    window.addEventListener('scroll', scrollHandler);
    toggleScrollBtn();
  }

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initForms();
    initAccordion();
    initScrollToTop();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();