// Observer to force Custom Fields collapse open
const collapseObserver = new MutationObserver(() => {
  const performerCustomFields = document.querySelector('#performer-page .custom-fields');
	if (performerCustomFields) {
	  const collapse = performerCustomFields.querySelector('.collapse');

	  if (collapse && !collapse.classList.contains('show')) {
		collapse.classList.add('show'); // expand once on load
	  }
}
  const collapse = performerCustomFields.querySelector('.collapse');
  const chevron = performerCustomFields.querySelector('.collapse-button svg');

  if (collapse && !collapse.classList.contains('show')) {
    collapse.classList.add('show');           // expand collapse
  }
});

// Start observing the page for changes in the custom fields container
collapseObserver.observe(document.body, {
  childList: true,
  subtree: true
});



const observer = new MutationObserver(() => {
  document.querySelectorAll('.hotornot_stats .TruncatedText').forEach(el => {
    if (el.dataset.parsed) return;

    try {
      const data = JSON.parse(el.textContent.trim());
	  
	  const titleSpan = el.closest('.hotornot_stats').querySelector('.detail-item-title.hotornot-stats');
      if (titleSpan) {
        titleSpan.textContent = 'Match History';
      }
	  
      const grid = document.createElement('div');
      grid.className = 'stats-grid';

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
	  
  // Add emoji
  let emoji = '';
  const streakEmojis = [
    { min: 3, max: 5, symbol: '🔥' },
    { min: 6, max: 9, symbol: '💎' },
    { min: 10, max: 14, symbol: '️♠' },
    { min: 15, max: Infinity, symbol: '👑' } 
  ];

  if (key.toLowerCase() === 'current_streak') {
    for (let s of streakEmojis) {
      if (value >= s.min && value <= s.max) {
        emoji = ' ' + s.symbol;
        break; // only the matching emoji for current streak
      }
    }
  }

  if (key.toLowerCase() === 'best_streak') {
    // Include all emojis up to current value
    emoji = ' ' + streakEmojis
      .filter(s => value >= s.min)
      .map(s => s.symbol)
      .join('');
  }


  // Color stats based on value sign
const valueClass = (() => {
  if (typeof value === 'number') {
    if (key.toLowerCase() === 'losses' && value > 0) return 'stat-negative';
    if (value > 0) return 'stat-positive';
    if (value < 0) return 'stat-negative';
  }
  return '';
})();

  grid.insertAdjacentHTML(
    'beforeend',
    `<div class="stat-item">
       <div class="stats-key">${label}</div>
       <div class="stats-value ${valueClass}">${displayValue}${emoji}</div>
   </div>`
);
});

      el.dataset.parsed = 'true';
      el.replaceWith(grid);
    } catch {}
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
