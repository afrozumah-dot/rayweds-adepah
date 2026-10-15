(function () {
  var $ = function (id) { return document.getElementById(id); };
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var targetDate = new Date('2027-02-06T10:00').getTime();
  function fmtDate(ms) {
    return new Date(ms).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function fmtTime(ms) {
    return new Date(ms).toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  }

  function showDate() {
    if (Number.isNaN(targetDate)) return;
    if ($('t-date-text')) $('t-date-text').textContent = fmtDate(targetDate);
    if ($('t-date2')) $('t-date2').textContent = fmtDate(targetDate);
    if ($('t-time')) $('t-time').textContent = fmtTime(targetDate);
  }

  function tick() {
    var diff = Math.max(0, targetDate - Date.now());
    if ($('c-d')) $('c-d').textContent = String(Math.floor(diff / 864e5));
    if ($('c-h')) $('c-h').textContent = String(Math.floor((diff % 864e5) / 36e5));
    if ($('c-m')) $('c-m').textContent = String(Math.floor((diff % 36e5) / 6e4));
    if ($('c-s')) $('c-s').textContent = String(Math.floor((diff % 6e4) / 1e3));
  }

  showDate();
  tick();
  setInterval(tick, 1000);

  var lightbox = $('lightbox');
  var lightboxImage = $('lightboxImage');
  var galleryIndex = 0;
  var returnFocus = null;

  function galleryPhotos() {
    return Array.prototype.slice.call($('gallery').querySelectorAll('.gallery-item'));
  }

  function showGalleryPhoto(index) {
    var photos = galleryPhotos();
    if (!photos.length) return;
    galleryIndex = (index + photos.length) % photos.length;
    var photo = photos[galleryIndex].querySelector('img');
    lightboxImage.src = photo.currentSrc || photo.src;
    lightboxImage.alt = photo.alt;
    $('lightboxCaption').textContent = photo.alt;
    $('lightboxCount').textContent = (galleryIndex + 1) + ' / ' + photos.length;
  }

  $('gallery').addEventListener('click', function (event) {
    var item = event.target.closest('.gallery-item');
    if (!item) return;
    var photos = galleryPhotos();
    returnFocus = item;
    showGalleryPhoto(photos.indexOf(item));
    lightbox.showModal();
    $('lightboxClose').focus();
  });

  $('lightboxPrev').addEventListener('click', function () {
    showGalleryPhoto(galleryIndex - 1);
  });

  $('lightboxNext').addEventListener('click', function () {
    showGalleryPhoto(galleryIndex + 1);
  });

  $('lightboxClose').addEventListener('click', function () {
    lightbox.close();
  });

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      lightbox.close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showGalleryPhoto(galleryIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showGalleryPhoto(galleryIndex + 1);
    }
  });

  lightbox.addEventListener('close', function () {
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
    returnFocus = null;
  });

  var touchStartX = null;
  lightbox.addEventListener('touchstart', function (event) {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (event) {
    if (touchStartX === null) return;
    var deltaX = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(deltaX) < 50) return;
    showGalleryPhoto(galleryIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });

  if ($('rsvpForm')) {
    $('rsvpForm').addEventListener('submit', function (event) {
      event.preventDefault();
      var form = event.target;
      form.hidden = true;
      $('thanks').hidden = false;
    });
  }

  function revealOnScroll() {
    var revealEls = document.querySelectorAll('.reveal');
    if (prefersReducedMotion) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  revealOnScroll();
})();
