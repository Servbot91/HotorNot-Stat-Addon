# HotorNot Stats Add-on
Add-on for the Hot or Not Stash plugin. Features streaks, color coding, performer win/loss ledger and accumulated streaks.

# What is the Hot or Not Plugin?

The Hot or not plugin for [Stash](https://stashapp.cc/)  uses an ELO-style rating system to rank performers and images through head-to-head comparisons.  You can find find it [here](https://discourse.stashapp.cc/t/hotornot-v3/6199)

--- 
# Features

The Hot or Not plugin adds custom values to each performer detail page detailing total matches, last match, wins, losses, current streak, best streak and worst streak. This add-on formats the values in a more palatable structure, adds streaks, and color coding for wins\losses. Custom fields is also auto expanded so these values display on load. Supports mobile, and values are displayed as a single column/

## Streaks
Streaks are marked by badges and are as follows:

Streak values 3-5: 🔥
Streak Values 6-9: 💎
Streak Values 10-14: ♠
Streak Value 15+ : 👑

Easily modifiable via JS. If the streak is broken, the badge resets.

## Best Streak

The best streak field retains all of the highest obtained streaks. A streak of 15+ for example will show 👑♠💎🔥 next to the performers best streak number. If a performer only has a best streak value of 8 for example then they only show 💎🔥 next to their best streak.

## Performer Ledger

The performer ledger tracks the last 10 win\losses for a performer. The win\loss cards contain win\loss performer name, the value their rank updated to, color coded for win\loss, and a link to the performer profile.

## Performer Ledger Reset Button

A reset task has been added for performer custom fields which will reset this ledger. (Alpha)
