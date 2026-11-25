import * as React from 'react';

import { AspectRatio } from '@proedis/ui/layout';


/** A stand-in for a map tile or a photo: a picture twice as wide as the box, so the crop shows */
const PICTURE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">'
  + '<rect width="800" height="300" fill="#dbeafe"/>'
  + '<path d="M0 220 Q200 120 400 200 T800 160 V300 H0Z" fill="#93c5fd"/>'
  + '<circle cx="400" cy="110" r="38" fill="#2563eb"/>'
  + '</svg>'
)}`;


export default function Example(): React.ReactNode {
  return (
    <AspectRatio ratio={4 / 3} className={'max-w-xs rounded-lg border border-border'}>
      <img src={PICTURE} alt={'The north depot on the map'} />
    </AspectRatio>
  );
}
