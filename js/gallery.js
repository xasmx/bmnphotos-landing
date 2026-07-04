(function () {
  const galleryRoot = document.querySelector('[data-gallery-category]');
  if (!galleryRoot) return;

  const category = galleryRoot.dataset.galleryCategory;
  const emptyState = document.querySelector('[data-gallery-empty]');
  const loadingState = document.querySelector('[data-gallery-loading]');
  const endpoint = window.BMN_GALLERY_DATA_URL;

  const sampleImages = {
    events: [
      ['portfolio/events/candid-reception-laughter.jpg', 'Candid Reception Laughter', 'Guests laughing together at an outdoor event', 'wide'],
      ['portfolio/events/dance-floor-moment.jpg', 'Dance Floor Moment', 'People dancing at a celebration', 'tall'],
      ['portfolio/events/toast-reaction.jpg', 'Toast Reaction', 'Candid reaction during a toast', ''],
      ['portfolio/events/guests-talking-outdoors.jpg', 'Guests Talking Outdoors', 'Guests talking outdoors during an event', ''],
      ['portfolio/events/live-event-crowd.jpg', 'Live Event Crowd', 'Crowd enjoying a live event', ''],
      ['portfolio/events/family-party-candids.jpg', 'Family Party Candids', 'Family party candid photos', '']
    ],
    families: [
      ['portfolio/families/backyard-family-moment.jpg', 'Backyard Family Moment', 'Family sharing a candid backyard moment', 'wide'],
      ['portfolio/families/parent-child-laughter.jpg', 'Parent Child Laughter', 'Parent and child laughing together', 'tall'],
      ['portfolio/families/siblings-playing.jpg', 'Siblings Playing', 'Siblings playing together', ''],
      ['portfolio/families/family-walk.jpg', 'Family Walk', 'Family walking together outdoors', ''],
      ['portfolio/families/home-session.jpg', 'Home Session', 'Family session at home', ''],
      ['portfolio/families/generations.jpg', 'Generations', 'Multi-generation family portrait moment', '']
    ],
    portraits: [
      ['portfolio/portraits/natural-light-portrait.jpg', 'Natural Light Portrait', 'Natural light portrait with candid expression', 'wide'],
      ['portfolio/portraits/senior-photo-outdoors.jpg', 'Senior Photo Outdoors', 'Senior portrait outdoors', 'tall'],
      ['portfolio/portraits/creative-headshot.jpg', 'Creative Headshot', 'Creative headshot portrait', ''],
      ['portfolio/portraits/individual-portrait.jpg', 'Individual Portraits', 'Natural individual portrait session', ''],
      ['portfolio/portraits/candid-profile.jpg', 'Candid Profile', 'Candid profile portrait', ''],
      ['portfolio/portraits/golden-hour-portrait.jpg', 'Golden Hour Portrait', 'Golden hour portrait session', '']
    ],
    sports: [
      ['portfolio/sports/game-day-action.jpg', 'Game Day Action', 'Athletes in action during a game', 'wide'],
      ['portfolio/sports/sideline-team-moment.jpg', 'Sideline Team Moment', 'Team candid photo during a game or tournament', 'tall'],
      ['portfolio/sports/athlete-detail.jpg', 'Athlete Detail', 'Close-up sports detail photo', ''],
      ['portfolio/sports/tournament-coverage.jpg', 'Tournament Coverage', 'Sports tournament coverage', ''],
      ['portfolio/sports/sideline-story.jpg', 'Sideline Story', 'Candid sideline sports moment', ''],
      ['portfolio/sports/sports-highlights.jpg', 'Sports Highlights', 'Sports highlights and action photography', '']
    ],
    celebrations: [
      ['portfolio/celebrations/birthday-candles-reaction.jpg', 'Birthday Candles Reaction', 'Candid reaction during a birthday celebration', 'wide'],
      ['portfolio/celebrations/graduation-hug.jpg', 'Graduation Hug', 'Graduation celebration hug', 'tall'],
      ['portfolio/celebrations/baby-shower-details.jpg', 'Baby Shower Details', 'Baby shower details and candid moments', ''],
      ['portfolio/celebrations/anniversary-toast.jpg', 'Anniversary Toast', 'Anniversary toast candid photo', ''],
      ['portfolio/celebrations/kids-party.jpg', 'Kids Party', 'Kids party celebration', ''],
      ['portfolio/celebrations/milestone-moment.jpg', 'Milestone Moment', 'Milestone celebration moment', '']
    ]
  };

  function setState(state, message) {
    if (loadingState) loadingState.hidden = state !== 'loading';
    if (emptyState) {
      emptyState.hidden = state !== 'empty' && state !== 'error';
      if (message) emptyState.textContent = message;
    }
  }

  function normalizeBoolean(value) {
    if (typeof value === 'boolean') return value;
    return String(value || '').trim().toLowerCase() !== 'false';
  }


  function extractDriveFileId(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^[a-zA-Z0-9_-]{20,}$/.test(text) && !text.includes('/')) return text;
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
      /\/thumbnail\?id=([a-zA-Z0-9_-]+)/
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1];
    }
    return '';
  }

  function driveImageUrl(value, width) {
    const fileId = extractDriveFileId(value);
    if (!fileId) return '';
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${width || 1600}`;
  }

  function normalizeImage(row, index) {
    return {
      src: row.image_url || row.src || driveImageUrl(row.drive_file_id || row.drive_url || row.google_drive_url, 2000) || '',
      thumbnail: row.thumbnail_url || row.thumbnail || row.image_url || row.src || driveImageUrl(row.drive_file_id || row.drive_url || row.google_drive_url, 1200) || '',
      title: row.title || `Gallery image ${index + 1}`,
      caption: row.caption || '',
      alt: row.alt_text || row.alt || row.title || `BMN Photos ${category} gallery image`,
      sortOrder: Number(row.sort_order || row.sortOrder || index + 1),
      visible: normalizeBoolean(row.visible),
      size: String(row.size || '').trim().toLowerCase()
    };
  }

  function render(images, options = {}) {
    galleryRoot.innerHTML = '';
    const visibleImages = images
      .map(normalizeImage)
      .filter((image) => image.src && image.visible)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (!visibleImages.length) {
      setState('empty', options.emptyMessage || 'No photos are published in this gallery yet.');
      return;
    }

    setState('ready');
    visibleImages.forEach((image, index) => {
      const article = document.createElement('article');
      const sizeClass = image.size || (index === 0 ? 'wide' : index === 1 ? 'tall' : '');
      article.className = ['gallery-item', sizeClass].filter(Boolean).join(' ');

      const img = document.createElement('img');
      img.src = image.thumbnail || image.src;
      img.alt = image.alt;
      img.loading = index < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';

      const caption = document.createElement('div');
      caption.className = 'gallery-caption';
      const strong = document.createElement('strong');
      strong.textContent = image.title;
      caption.appendChild(strong);
      if (image.caption) {
        const span = document.createElement('span');
        span.textContent = image.caption;
        caption.appendChild(span);
      }

      article.appendChild(img);
      article.appendChild(caption);
      galleryRoot.appendChild(article);
    });
  }

  function renderSamples() {
    const samples = (sampleImages[category] || []).map(([src, title, alt, size], index) => ({
      category,
      image_url: src,
      title,
      alt_text: alt,
      size,
      sort_order: index + 1,
      visible: true
    }));
    render(samples, { emptyMessage: 'Add photos to the Google Sheet to publish this gallery.' });
  }

  async function loadGallery() {
    if (!endpoint || endpoint.includes('PASTE_GOOGLE_APPS_SCRIPT')) {
      setState('ready');
      renderSamples();
      return;
    }

    setState('loading');
    try {
      const url = new URL(endpoint);
      url.searchParams.set('category', category);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Gallery request failed: ${response.status}`);
      const payload = await response.json();
      const images = Array.isArray(payload) ? payload : payload.images || [];
      render(images);
    } catch (error) {
      console.error(error);
      setState('error', 'The gallery could not be loaded right now. Showing sample placeholders instead.');
      renderSamples();
    }
  }

  loadGallery();
})();
