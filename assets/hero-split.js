/* Masked per-letter wipe for page headings.
 *
 * Splits a heading into lines, then words, then letters, and gives every
 * letter an overflow-hidden box holding two copies: the one you see at load
 * (.wipe-ghost) wipes out to the right, and the real letter (.wipe-char)
 * slides in from the left behind it. The motion itself lives in site.css —
 * this only builds the boxes and stamps the line/letter indices the CSS
 * turns into delays.
 *
 * Loaded with a plain <script src> placed immediately after the heading, so
 * it runs before the first paint. Without JS the heading is just text.
 */
(function () {
  var headings = document.querySelectorAll('.poster-type, .page-head h1');

  Array.prototype.forEach.call(headings, function (heading) {
    if (heading.classList.contains('is-wiped')) return;

    /* One letter per span makes some screen readers spell the heading out.
       Freeze the accessible name to the sentence before splitting. */
    heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());

    lines(heading).forEach(function (line, li) {
      var frag = document.createDocumentFragment();
      var c = 0;

      /* Split on real spaces only — a non-breaking space stays inside its
         word, where the word's inline-block keeps the pair together. */
      line.textContent.split(/([ \t\n\r]+)/).forEach(function (chunk) {
        if (!chunk) return;
        if (!/\S/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }

        var word = document.createElement('span');
        word.className = 'wipe-word';

        chunk.split('').forEach(function (letter) {
          var mask = document.createElement('span');
          mask.className = 'wipe-mask';
          mask.style.setProperty('--c', c++);
          mask.style.setProperty('--l', li);

          var real = document.createElement('span');
          real.className = 'wipe-char';
          real.textContent = letter;

          var ghost = document.createElement('span');
          ghost.className = 'wipe-ghost';
          ghost.setAttribute('aria-hidden', 'true');
          ghost.textContent = letter;

          mask.appendChild(real);
          mask.appendChild(ghost);
          word.appendChild(mask);
        });

        frag.appendChild(word);
      });

      line.textContent = '';
      line.appendChild(frag);
    });

    heading.classList.add('is-wiped');
  });

  /* The home hero already marks its lines up as <i><span>. Everywhere else
     the line breaks are <br>, so wrap each run between them in its own span
     and hand those back instead. */
  function lines(heading) {
    var marked = heading.querySelectorAll('i > span');
    if (marked.length) return Array.prototype.slice.call(marked);

    var runs = [[]];
    Array.prototype.forEach.call(heading.childNodes, function (node) {
      if (node.nodeName === 'BR') runs.push([]);
      else runs[runs.length - 1].push(node);
    });

    var out = [];
    var rebuilt = document.createDocumentFragment();
    runs.forEach(function (run, i) {
      if (i) rebuilt.appendChild(document.createElement('br'));
      var line = document.createElement('span');
      line.className = 'wipe-line';
      run.forEach(function (node) { line.appendChild(node); });
      rebuilt.appendChild(line);
      out.push(line);
    });

    heading.textContent = '';  /* clears the leftover <br>s */
    heading.appendChild(rebuilt);
    return out;
  }
})();
