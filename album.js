(() => {
  'use strict';

  const album = document.getElementById('memoryAlbum');
  const toggle = document.getElementById('toggleAlbum');
  const edit = document.getElementById('editAlbum');
  const hint = document.getElementById('albumEditHint');
  const status = document.getElementById('albumStatus');
  const cards = [...album.querySelectorAll('.album-card')];
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  let editing = false;

  function setEditing(open) {
    editing = open;
    if (open && !album.classList.contains('is-spread')) toggle.click();
    cards.forEach(card => { card.querySelector('.photo-actions').hidden = !open; });
    hint.hidden = !open;
    edit.setAttribute('aria-expanded', String(open));
    edit.textContent = open ? 'Xong' : 'Thay ảnh ✎';
  }
  edit.addEventListener('click', () => setEditing(!editing));
  toggle.addEventListener('click', () => {
    if (editing && !album.classList.contains('is-spread')) setEditing(false);
  });

  async function preparePhoto(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#fffdfb';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', .85);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  window.albumPhotosReady = Promise.allSettled(cards.map(async (card, index) => {
    const photo = card.querySelector('img');
    const input = card.querySelector('.photo-input');
    const change = card.querySelector('.change-photo');
    const reset = card.querySelector('.reset-photo');
    const original = photo.getAttribute('src');
    const key = `flower.album.photo.20-10-ban.v1.${index}`;
    let busy = false;

    change.addEventListener('click', () => {
      input.value = '';
      input.click();
    });
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file || busy) return;
      if (!file.type.startsWith('image/')) {
        status.textContent = 'Bạn chọn một tệp ảnh nhé (JPG, PNG hoặc WebP).';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        status.textContent = 'Ảnh quá lớn. Bạn chọn ảnh nhỏ hơn hoặc bằng 20 MB nhé.';
        return;
      }
      busy = true;
      change.disabled = true;
      reset.disabled = true;
      card.setAttribute('aria-busy', 'true');
      status.textContent = `Đang xử lý ảnh thứ ${index + 1}…`;
      const previous = photo.getAttribute('src');
      try {
        const data = await preparePhoto(file);
        photo.src = data;
        await photo.decode();
        try {
          localStorage.setItem(key, data);
          status.textContent = `Đã lưu ảnh thứ ${index + 1}.`;
        } catch {
          status.textContent = 'Đã thay ảnh. Trình duyệt chưa lưu được ảnh để dùng lần sau; bạn có thể giải phóng bộ nhớ rồi chọn lại ảnh.';
        }
      } catch {
        photo.src = previous;
        status.textContent = 'Chưa đọc được ảnh này. Bạn thử ảnh JPG, PNG hoặc WebP khác nhé.';
      } finally {
        busy = false;
        change.disabled = false;
        reset.disabled = photo.getAttribute('src') === original;
        card.removeAttribute('aria-busy');
      }
    });
    reset.addEventListener('click', () => {
      photo.src = original;
      input.value = '';
      reset.disabled = true;
      try {
        localStorage.removeItem(key);
        status.textContent = `Đã khôi phục ảnh thứ ${index + 1}.`;
      } catch {
        status.textContent = 'Đã khôi phục ảnh. Trình duyệt chưa lưu được thay đổi để dùng lần sau.';
      }
      change.focus({ preventScroll: true });
    });

    try {
      const saved = localStorage.getItem(key);
      if (!saved || !saved.startsWith('data:image/jpeg;base64,')) return;
      const image = new Image();
      image.src = saved;
      await image.decode();
      photo.src = saved;
      reset.disabled = false;
    } catch {
      // Leave the original photo in place when storage is blocked or the saved image is invalid.
    }
  }));
})();

// Gallery lightbox: tap a photo to view it large, swipe or use arrows to move (sister edition).
(() => {
  const items = [];
  document.querySelectorAll('#albumPhotos figure').forEach(fig => {
    const cap = fig.querySelector('.portrait-dedication');
    const caption = cap ? cap.textContent : '';
    const img = fig.querySelector('img');
    const video = fig.querySelector('video');
    if (img) items.push({ type: 'img', el: img, caption });
    else if (video) items.push({ type: 'video', el: video, caption });
  });
  if (!items.length) return;

  const box = document.createElement('div');
  box.className = 'album-lightbox';
  box.hidden = true;
  box.innerHTML = '<button class="lb-close" type="button" aria-label="Đóng xem ảnh">×</button>' +
    '<button class="lb-nav lb-prev" type="button" aria-label="Ảnh trước">‹</button>' +
    '<div class="lb-media"></div>' +
    '<button class="lb-nav lb-next" type="button" aria-label="Ảnh sau">›</button>' +
    '<p class="lb-caption"></p><p class="lb-count"></p>';
  document.body.appendChild(box);
  const media = box.querySelector('.lb-media');
  const lbCap = box.querySelector('.lb-caption');
  const lbCount = box.querySelector('.lb-count');
  let current = 0;

  function render() {
    const item = items[current];
    media.innerHTML = '';
    if (item.type === 'img') {
      const view = document.createElement('img');
      view.src = item.el.currentSrc || item.el.src;
      view.alt = item.el.alt || '';
      media.appendChild(view);
    } else {
      const view = document.createElement('video');
      view.src = item.el.getAttribute('src');
      view.poster = item.el.getAttribute('poster') || '';
      view.controls = true;
      view.playsInline = true;
      media.appendChild(view);
    }
    lbCap.textContent = item.caption;
    lbCount.textContent = (current + 1) + ' / ' + items.length;
  }
  function openAt(index) { current = index; render(); box.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeBox() {
    box.hidden = true;
    media.innerHTML = '';
    document.body.style.overflow = '';
  }
  function step(delta) { current = (current + delta + items.length) % items.length; render(); }

  box.querySelector('.lb-close').addEventListener('click', closeBox);
  box.querySelector('.lb-prev').addEventListener('click', event => { event.stopPropagation(); step(-1); });
  box.querySelector('.lb-next').addEventListener('click', event => { event.stopPropagation(); step(1); });
  box.addEventListener('click', event => { if (event.target === box) closeBox(); });
  document.addEventListener('keydown', event => {
    if (box.hidden) return;
    if (event.key === 'Escape') closeBox();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  // Swipe / drag to change photo (pointer events cover touch + mouse).
  let startX = null;
  box.addEventListener('dragstart', event => event.preventDefault());
  box.addEventListener('pointerdown', event => { startX = event.clientX; });
  box.addEventListener('pointerup', event => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 42) step(dx < 0 ? 1 : -1);
  });
  items.forEach((item, index) => {
    if (item.type !== 'img') return;
    item.el.addEventListener('click', () => openAt(index));
  });
  window.openAlbumGallery = openAt;
})();
