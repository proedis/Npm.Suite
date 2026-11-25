/**
 * A portrait for the examples, drawn as an SVG so the site loads no image from elsewhere. An
 * application passes a real URL, already usable by an `<img>`.
 */
const PORTRAIT = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>',
  '<rect width="64" height="64" fill="url(#g)"/>',
  '<circle cx="32" cy="25" r="11" fill="#fde7d4"/>',
  '<path d="M12 64c2-14 10-20 20-20s18 6 20 20z" fill="#1e293b"/>',
  '</svg>'
].join('');

export const PORTRAIT_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PORTRAIT)}`;
