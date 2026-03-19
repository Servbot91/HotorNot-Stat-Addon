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

// ===============================
// Performer Record (Match History Timeline) Parser
// ===============================
const recordObserver = new MutationObserver(() => {
  document.querySelectorAll('.performer_record .TruncatedText').forEach(el => {
    if (el.dataset.parsed) return;

    try {
      const rawText = el.textContent.trim();
      if (!rawText.startsWith('[')) return; 

      const history = JSON.parse(rawText);
      const container = el.closest('.performer_record');
      
      const titleSpan = container?.querySelector('.detail-item-title');
      if (titleSpan) titleSpan.textContent = 'Past Matchups';

      const timeline = document.createElement('div');
      timeline.className = 'match-timeline';

      history.reverse().slice(0, 10).forEach(match => {
        const date = new Date(match.date).toLocaleDateString(undefined, { 
            month: 'short', day: 'numeric' 
        });
        
        const statusClass = match.won === true ? 'win' : (match.won === false ? 'loss' : 'draw');
        const statusText = match.won === true ? 'WIN' : (match.won === false ? 'LOSS' : 'DRAW');
        const symbol = match.won === true ? '●' : (match.won === false ? '●' : '○');

        // Split the "ID:Name" format
        const [oppId, oppName] = match.opponent.includes(':') 
          ? match.opponent.split(':') 
          : [null, match.opponent];

        const profileUrl = oppId ? `/performers/${oppId}/scenes` : '#';

	timeline.insertAdjacentHTML('beforeend', `
	  <div class="timeline-entry ${statusClass}">
		<span class="timeline-date">${date}</span>
		<span class="timeline-marker">${symbol}</span>
		<div class="timeline-content">
		  <span class="timeline-status">${statusText}</span>
		  <span class="timeline-vs">vs</span> 
		  <a href="${profileUrl}" class="timeline-opponent-link" style="color: #00b2ff; text-decoration: none;">
			${oppName}
		  </a>
		</div>
		<span class="timeline-rating">${match.ratingAfter}</span>
	  </div>
	`);
      });

      el.dataset.parsed = 'true';
      el.innerHTML = '';
      el.appendChild(timeline);

    } catch (err) {
      console.warn('HotOrNot record parse failed:', err);
    }
  });
});

recordObserver.observe(document.body, { childList: true, subtree: true });

recordObserver.observe(document.body, { childList: true, subtree: true });


// ===============================
// Styles
// ===============================
const style = document.createElement('style');
style.textContent = `
/* Match Timeline Styles */
.match-timeline {
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  gap: 6px;
  padding: 8px 0;
  width: 535% !important; 
  font-family: sans-serif;
}

.timeline-entry {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important; 
  padding: 3px 8px !important;               
  background: rgba(255,255,255,0.05) !important;
  border-radius: 4px !important;
  font-size: 1rem !important;             
  min-height: 40px !important;              
  border-left: 3px solid transparent !important;
}

/* Win: Greenish theme */
.timeline-entry.win {
  border-left: 3px solid #4caf50 !important;
  background: rgba(76, 175, 80, 0.1) !important;
}
.timeline-entry.win .timeline-status {
  color: #4caf50 !important;
  font-weight: bold !important;
}
.timeline-entry.win .timeline-marker {
  color: #4caf50 !important;
}

/* Loss: Reddish theme */
.timeline-entry.loss {
  border-left: 3px solid #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
}
.timeline-entry.loss .timeline-status {
  color: #f44336 !important;
  font-weight: bold !important;
}
.timeline-entry.loss .timeline-marker {
  color: #f44336 !important;
}

/* Draw/Neutral: Gray theme */
.timeline-entry.draw {
  border-left: 3px solid #9e9e9e !important;
  background: rgba(158, 158, 158, 0.1) !important;
}
.timeline-entry.draw .timeline-status {
  color: #9e9e9e !important;
}

.timeline-content {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 6px !important;
  flex-grow: 1 !important;
  height: 100% !important;
}

/* Ensure ALL elements are vertically centered */
.timeline-date,
.timeline-marker,
.timeline-status,
.timeline-vs,
.timeline-opponent-link,
.timeline-rating {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
}

.timeline-status {
  font-weight: bold !important;
  font-size: 0.7rem !important;
}

.timeline-vs {
  font-size: 0.9rem !important;
}

.timeline-opponent-link {
  color: #00b2ff !important;
  text-decoration: none !important;
  white-space: nowrap !important;
}

.timeline-date {
  font-size: 0.65rem !important;
  opacity: 0.5 !important;
  margin-right: 4px !important;
}

.timeline-rating { 
  font-weight: bold !important; 
  color: #00b2ff !important; 
  background: rgba(0,178,255,0.12) !important; 
  padding: 1px 4px !important; 
  border-radius: 3px !important; 
  font-size: 0.7rem !important;
  margin-left: 4px !important;
  min-width: 35px !important;
  text-align: center !important;
}

/* Responsive Breakpoints */
@media (max-width: 1200px) {
  .match-timeline { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 800px) {
  .match-timeline { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 500px) {
  .match-timeline { grid-template-columns: 1fr; }
}

.performer_record, .performer_record .TruncatedText {
  max-width: 100% !important;
  width: 100% !important;
  display: block !important;
  overflow: visible !important;
}
`;
document.head.appendChild(style);
