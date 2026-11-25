import type { ThemeVariableGroup } from './themeDoc';


/* --------
 * Constants Definition
 * -------- */

/** The seven tones, each a family of four variables */
const TONES = [ 'primary', 'secondary', 'muted', 'destructive', 'success', 'warning', 'info' ] as const;

/** What each group of variables is, as the title of its table */
export const GROUP_TITLES: Readonly<Record<ThemeVariableGroup, string>> = {
  Default   : 'Defaults',
  Spacing   : 'Spacing scale',
  Size      : 'Sizes',
  Typography: 'Typography',
  Shape     : 'Shape',
  Finish    : 'Finish',
  Colour    : 'Colours',
  Layer     : 'Layers'
};

/** One sentence per group, under its title */
export const GROUP_LEADS: Readonly<Record<ThemeVariableGroup, string>> = {
  Default   : 'The value a prop takes when it is not declared. Undeclared, each variable falls back to its step of the scale; declared, it changes that default for every instance that does not set the prop.',
  Spacing   : 'The steps the spacing props take by name. A step moves every gap, padding and inset named after it, in every component.',
  Size      : 'The heights and the widths that are a decision of the product. A control height moves every control of that size at once, under a finger too.',
  Typography: 'The families and the weights the component writes with. A family set here changes every component that uses it; a weight changes what that name means, everywhere.',
  Shape     : 'The corner language: every rounded step is Tailwind’s own value times this number.',
  Finish    : 'The depth of a solid fill, every part off by default: each one a number a product turns up from :root, each one derived from the colour of the tone.',
  Colour    : 'The semantic colours the component paints with. Each one is shared with every other component that reads it.',
  Layer     : 'The stacking order of what floats.'
};

/** Every variable that is not part of a tone family, with what it moves */
const SINGLE: Readonly<Record<string, string>> = {
  '--stack-gap'       : 'The gap of a Stack that declares none.',
  '--cluster-gap'     : 'The gap of a Cluster that declares none.',
  '--grid-gap'        : 'The gap of a Grid that declares none.',
  '--split-gap'       : 'The gap between the two panes of a Split that declares none.',
  '--item-gap'        : 'The gap between the leading visual, the text and the tail of an Item that declares none, the header of a Surface included.',
  '--heading-gap'     : 'The gap between the title and the line under it in a Heading that declares none.',
  '--separator-space' : 'The room of a Surface.Separator of type gap that declares no space.',
  '--space-xs'        : 'Every spacing named xs.',
  '--space-sm'        : 'Every spacing named sm.',
  '--space-md'        : 'Every spacing named md, and the default of Stack, Grid and Split.',
  '--space-lg'        : 'Every spacing named lg, and the default room of a separator.',
  '--space-xl'        : 'Every spacing named xl.',
  '--space-2xl'       : 'Every spacing named 2xl.',
  '--spacing-control-sm': 'The height of every control of size sm. 2.25rem under a coarse pointer.',
  '--spacing-control-md': 'The height of every control of size md. 2.5rem under a coarse pointer.',
  '--spacing-control-lg': 'The height of every control of size lg. 2.75rem under a coarse pointer.',
  '--container-8xl'   : 'The widest page, Container size xl: one step past Tailwind’s container scale.',
  '--text-2xs'        : 'The step below text-xs: a description under a label, the smallest eyebrow, a small badge.',
  '--font-heading'    : 'The family of every title. Undeclared, it is --font-sans.',
  '--font-sans'       : 'The family of all the text, Tailwind’s own: the body, a control, a label.',
  '--font-mono'       : 'The family of fixed width text, Tailwind’s own.',
  '--font-weight-normal': 'What font-normal means: 400.',
  '--font-weight-medium': 'What font-medium means: 500. A label, a button, a tab.',
  '--font-weight-semibold': 'What font-semibold means: 600. A title, a value that leads.',
  '--font-weight-bold': 'What font-bold means: 700. The largest title.',
  '--control-radius'  : 'The corner of every control that declares no radius: a field, a select, a date picker, a toggle, a segmented control, a button.',
  '--button-radius'   : 'The corner of every button that declares no radius. Undeclared, it is --control-radius.',
  '--button-gradient' : 'From 0 to 1: a light top and a darker bottom over the solid fill.',
  '--button-border-shade': 'The border of the solid fill: the tone mixed with this much black, 0% for a border the colour of the fill.',
  '--button-highlight': 'From 0 to 1: a light line inside the top edge.',
  '--button-glow'     : 'From 0 to 1: a soft shadow under the button, in the colour of its tone.',
  '--loading-bar-radius': 'The corner of a LoadingBar that declares no radius, and of its segment. Undeclared, square.',
  '--icon-box-radius' : 'The corner of an IconBox that declares no radius, as a md box shows it: scaled with every size. Undeclared, --radius-2xl.',
  '--accordion-radius': 'The corner of a contained, filled or separated Accordion that declares no radius. Undeclared, --radius-lg.',
  '--accordion-gap'   : 'The room between the items of a separated Accordion. Undeclared, the sm step of the scale.',
  '--accordion-filled-background': 'The surface of the open item of a filled Accordion. Undeclared, --muted.',
  '--accordion-item-background': 'The surface of a closed item of a separated Accordion. Undeclared, --muted.',
  '--accordion-item-open-background': 'The surface of the open item of a separated Accordion. Undeclared, --card.',
  '--accordion-open-border': 'The border of the open item of a separated Accordion. Undeclared, --border.',
  '--radius-scale'    : 'A unitless multiplier over every radius step, xs to 4xl: 1 is Tailwind’s scale as documented.',
  '--background'      : 'The canvas. The application paints it; the package reads it only on the hover of the FileUpload drop zone.',
  '--foreground'      : 'The ink of a value.',
  '--border'          : 'Every line: a divider, the rules of a divided Stack, the frame of a card.',
  '--card'            : 'A raised surface: a card, a panel, a control.',
  '--card-foreground' : 'The ink on a card.',
  '--popover'         : 'What floats: a menu, a list, a dialog.',
  '--popover-foreground': 'The ink on what floats.',
  '--accent'          : 'A highlighted item: the option under the keyboard, the hovered entry of a list.',
  '--accent-foreground': 'The ink on a highlighted item.',
  '--input'           : 'The border of a form control. Follows --border unless a control should read stronger than a line.',
  '--input-hover'     : 'The border of a form control under the pointer.',
  '--placeholder'     : 'The example text of an empty field.',
  '--ring'            : 'The focus ring.',
  '--switch-off'      : 'The track of a switch that is off.',
  '--state-hover'     : 'The veil over a solid fill under the pointer.',
  '--state-pressed'   : 'The veil over a solid fill pressed.',
  '--tooltip'         : 'The surface of a tooltip.',
  '--tooltip-foreground': 'The ink of a tooltip.',
  '--tooltip-muted-foreground': 'The quieter second line of a tooltip.',
  '--busy-veil'       : 'What covers a panel that waits. Optional: three quarters of the card.',
  '--overlay'         : 'The veil under a dialog or a drawer. Optional: black at 40%.',
  '--overlay-nested'  : 'The lighter veil under a dialog opened from another. Optional: black at 20%.',
  '--scroll-shade'    : 'The inner shadow at the edge of a body that scrolls. Optional: black at 8%.',
  '--z-dialog'        : 'A dialog, a drawer and their veil.',
  '--z-popover'       : 'What opens from a control: a menu, a list, a popover. Above a dialog.',
  '--z-toast'         : 'The notifications, usable over an open dialog.',
  '--z-tooltip'       : 'A tooltip, above everything.'
};


/* --------
 * Helpers
 * -------- */

/** What a variable of the theme moves, in one sentence */
export function describeVariable(variable: string): string {
  const single = SINGLE[variable];

  if (single) {
    return single;
  }

  const tone = TONES.find((name) => variable === `--${name}` || variable.startsWith(`--${name}-`));

  if (!tone) {
    return '';
  }

  switch (variable.slice(tone.length + 3)) {
    case '':
      return `The ${tone} tone: a solid fill, the ink of a plain fill, a focus ring of that tone.`;
    case 'foreground':
      return `The ink on a solid ${tone} fill.`;
    case 'soft':
      return `The tinted surface of a soft ${tone} fill. Optional: undeclared, it is derived from the tone.`;
    case 'soft-foreground':
      return `The ink on a soft ${tone} fill. Optional: undeclared, it is derived from the tone.`;
    default:
      return '';
  }
}
