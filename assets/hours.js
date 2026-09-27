/* Opening hours — pure logic behind the live "Open now" status.
 *
 * Published hours (Instagram bio and the front-desk card): Saturday to
 * Thursday 08:00–20:00, closed Fridays; classes 08:00–10:00 and
 * 16:00–18:00. Bangkok is UTC+7 with no daylight saving, so local time is
 * plain arithmetic on the UTC clock — no Intl, no visitor timezone.
 *
 * Browser: window.TKMHours. Node (tests/hours.test.mjs): module.exports.
 */
(function (root) {
  'use strict';

  var OPEN = 8 * 60;
  var CLOSE = 20 * 60;
  var CLASSES = [[8 * 60, 10 * 60], [16 * 60, 18 * 60]];
  var FRIDAY = 5; // Date#getUTCDay numbering: 0 = Sunday
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var hhmm = function (m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  };

  /* The next day the gym opens, counted from `day`: 1 = tomorrow. */
  var daysToNextOpen = function (day) {
    for (var n = 1; n <= 7; n++) if ((day + n) % 7 !== FRIDAY) return n;
    return 1;
  };

  var when = function (day, n) {
    return n === 1 ? 'tomorrow' : DAY_NAMES[(day + n) % 7];
  };

  function status(date) {
    var local = new Date(date.getTime() + 7 * 3600 * 1000);
    var day = local.getUTCDay();
    var m = local.getUTCHours() * 60 + local.getUTCMinutes();
    var openDay = day !== FRIDAY;
    var open = openDay && m >= OPEN && m < CLOSE;

    var running = null;
    var laterToday = null;
    if (openDay) {
      CLASSES.forEach(function (c) {
        if (m >= c[0] && m < c[1]) running = c;
        else if (m < c[0] && laterToday === null) laterToday = c[0];
      });
    }

    var n = daysToNextOpen(day);
    var gym;
    if (open) gym = 'Open now until ' + hhmm(CLOSE);
    else if (!openDay) gym = 'Closed on Fridays, opens ' + when(day, n) + ' at ' + hhmm(OPEN);
    else if (m < OPEN) gym = 'Closed now, opens at ' + hhmm(OPEN);
    else gym = 'Closed now, opens ' + when(day, n) + ' at ' + hhmm(OPEN);

    var classes;
    if (running) classes = 'Class on now until ' + hhmm(running[1]);
    else if (laterToday !== null) classes = 'Next class today at ' + hhmm(laterToday);
    else classes = 'Next class ' + when(day, n) + ' at ' + hhmm(CLASSES[0][0]);

    return {
      open: open,
      classNow: running !== null,
      dayIndex: (day + 6) % 7, // Monday = 0, matching the week strip
      gym: gym,
      classes: classes,
    };
  }

  var api = { status: status };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TKMHours = api;
})(typeof window !== 'undefined' ? window : this);
