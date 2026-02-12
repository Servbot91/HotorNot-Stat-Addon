// ===============================
// Force Custom Fields Collapse Open
// ===============================
const collapseObserver = new MutationObserver(() => {
  const performerCustomFields = document.querySelector('#performer-page .custom-fields');
  if (!performerCustomFields) return;

  const collapse = performerCustomFields.querySelector('.collapse');
  const chevron = performerCustomFields.querySelector('.collapse-button svg');

  if (collapse && !collapse.classList.contains('show')) {
    collapse.classList.add('show');

    // Optional: rotate chevron if needed
    if (chevron) {
      chevron.style.transform = 'rotate(180deg)';
    }

    // Stop observing once expanded
    collapseObserver.disconnect();
  }
});

collapseObserver.observe(document.body, {
  childList: true,
  subtree: true
});


// ===============================
// HotOrNot Stats Parser
// ===============================
const statsObserver = new MutationObserver(() => {
  document.querySelectorAll('.hotornot_stats .TruncatedText').forEach(el => {
    if (el.dataset.parsed) return;

    try {
      const rawText = el.textContent.trim();
      if (!rawText.startsWith('{')) return; // prevent invalid JSON errors

      const data = JSON.parse(rawText);

      const container = el.closest('.hotornot_stats');
      if (!container) return;

      // Rename section title
      const titleSpan = container.querySelector('.detail-item-title.hotornot-stats');
      if (titleSpan) {
        titleSpan.textContent = 'Match History';
      }

      const grid = document.createElement('div');
      grid.className = 'stats-grid';

      const streakEmojis = [
        { min: 3, max: 5, symbol: '🔥' },
        { min: 6, max: 9, symbol: '💎' },
        { min: 10, max: 14, symbol: '♠' },
        { min: 15, max: Infinity, symbol: '👑' }
      ];

      Object.entries(data).forEach(([key, value]) => {
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        const displayValue =
          key === 'last_match'
            ? new Date(value).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            : value;

        // Emoji logic
        let emoji = '';

        if (key.toLowerCase() === 'current_streak') {
          for (let s of streakEmojis) {
            if (value >= s.min && value <= s.max) {
              emoji = ' ' + s.symbol;
              break;
            }
          }
        }

        if (key.toLowerCase() === 'best_streak') {
          emoji =
            ' ' +
            streakEmojis
              .filter(s => value >= s.min)
              .map(s => s.symbol)
              .join('');
        }

        // Value color logic
        const valueClass = (() => {
          if (typeof value === 'number') {
            if (key.toLowerCase() === 'losses' && value > 0)
              return 'stat-negative';
            if (value > 0) return 'stat-positive';
            if (value < 0) return 'stat-negative';
          }
          return '';
        })();

        grid.insertAdjacentHTML(
          'beforeend',
          `<div class="stat-item">
             <div class="stats-key">${label}</div>
             <div class="stats-value ${valueClass}">
               ${displayValue}${emoji}
             </div>
           </div>`
        );
      });

      el.dataset.parsed = 'true';
      el.replaceWith(grid);

    } catch (err) {
      console.warn('HotOrNot stats parse failed:', err);
    }
  });
});

statsObserver.observe(document.body, {
  childList: true,
  subtree: true
});
