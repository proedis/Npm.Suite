/*
 * The type level test of the polymorphic props, and the only kind of test that can check them: none
 * of this changes anything at runtime, so a render case would pass either way.
 *
 * There is no test runner in this repository. This file IS the assertion — it is typechecked, not
 * executed, and it lives outside `src` so that neither rollup nor the declaration build ever see it:
 *
 *   npx tsc -p tsconfig.types-check.json
 *
 * Every `@ts-expect-error` is an assertion in the negative direction: if the line below it ever
 * starts compiling, `tsc` fails on the unused directive. That is what makes a widened type surface
 * loud instead of silent.
 */

import * as React from 'react';

import { Badge, Box, Container, Heading, IconBox, Item, Label, Spinner, Stack, Surface, VisuallyHidden } from './src';
import { Button } from './src/interactive/button';
import { CheckboxGroup } from './src/interactive/checkbox';
import { Field } from './src/interactive/field';
import { FieldShell } from './src/interactive/field-shell';
import { RadioGroup } from './src/interactive/radio';

import type { StackProps } from './src';

/*
 * The parts of a compound are reachable through the dot and nowhere else, so this import has to fail.
 * Asserting it on an undeclared identifier would prove nothing — a typo errors the same way — while
 * an import names the package's actual export surface.
 */
// @ts-expect-error a compound's parts are not flat exports
import { HeadingTitle as flatPart } from './src';


/* --------
 * The element decides the attributes
 * -------- */
const anchorStack = <Stack as={'a'} href={'/reports'} download gap={4}>ok</Stack>;

const sectionStack = <Stack as={'section'} aria-label={'summary'} direction={'horizontal'}>ok</Stack>;

const plainStack = <Stack gap={4} align={{ base: 'stretch', lg: 'center' }}>ok</Stack>;

/** @ts-expect-error 'href' is an anchor attribute, and this renders a span */
const wrongAttribute = <Stack as={'span'} href={'/reports'}>no</Stack>;

/** @ts-expect-error 'download' likewise */
const wrongAttributeToo = <Stack as={'div'} download>no</Stack>;


/* --------
 * The component keeps its own props typed
 * -------- */
const scaleRespected = <Stack gap={16} columns={12}>ok</Stack>;

/** @ts-expect-error 13 is outside SpacingValue, which is the whole reason it is a union */
const outsideTheScale = <Stack gap={13}>no</Stack>;

/** @ts-expect-error 13 is outside ColumnsValue */
const outsideTheColumns = <Stack columns={13}>no</Stack>;

/** @ts-expect-error a responsive value still has to be on the scale */
const outsideTheScaleResponsive = <Stack gap={{ base: 2, lg: 11 }}>no</Stack>;

/** @ts-expect-error 'base' is not a MediaBreakpoint: it has no media query */
const baseIsNotABreakpoint = <Stack hideBelow={'base'}>no</Stack>;

/** @ts-expect-error and neither is a breakpoint that does not exist */
const unknownBreakpoint = <Box hideFrom={'3xl'}>no</Box>;


/* --------
 * The defaults, which are what keep the change backward compatible
 * -------- */

/** No type argument, exactly as a consumer or a wrapper would write it */
const asAWrapper: (props: StackProps) => React.ReactNode = (props) => <Stack {...props} />;

/** The element defaults per component, not globally: a Label is a `label`, a VisuallyHidden a `span` */
const labelDefault = <Label htmlFor={'email'}>Email</Label>;

const quietLabel = <Label as={'span'} emphasis={'quiet'} description={'kg'}>Total</Label>;

/** @ts-expect-error 'htmlFor' belongs to a label, and this one renders a span */
const spanWithHtmlFor = <Label as={'span'} htmlFor={'email'}>no</Label>;

const skipLink = <VisuallyHidden as={'a'} focusable href={'#main'}>Skip to content</VisuallyHidden>;

/** @ts-expect-error VisuallyHidden deliberately has no shared visibility props */
const contradictoryProps = <VisuallyHidden hideBelow={'md'}>no</VisuallyHidden>;


/* --------
 * The badge shares the tone vocabulary, and the composition it exists for
 * -------- */
const badges = (
  <React.Fragment>
    <Badge>Bozza</Badge>
    <Badge tone={'warning'} dot size={'sm'}>In ritardo</Badge>
    <Badge tone={'destructive'} fill={'solid'} as={'a'} href={'/x'}>3</Badge>
  </React.Fragment>
);

const titleWithBadge = (
  <Heading>
    <Stack direction={'horizontal'} align={'center'} gap={2}>
      <Heading.Title lines={1}>FT-234-KL</Heading.Title>
      <Badge tone={'warning'}>In ritardo</Badge>
    </Stack>
  </Heading>
);

/** @ts-expect-error the badge speaks the same closed tone vocabulary as everything else */
const badgeWrongTone = <Badge tone={'danger'}>no</Badge>;

/** @ts-expect-error and the same fill axis as IconBox: there is no 'outline' */
const badgeWrongFill = <Badge fill={'outline'}>no</Badge>;

/** @ts-expect-error a size is a step, so it has no 'default' either */
const badgeNoDefault = <Badge size={'default'}>no</Badge>;


/* --------
 * The tone vocabulary is closed, and the variant axes are independent
 * -------- */
const softMuted = <IconBox><svg /></IconBox>;

const solidDestructive = <IconBox fill={'solid'} tone={'destructive'} size={'lg'}><svg /></IconBox>;

const emptyState = <IconBox size={'2xl'} tone={'primary'} halo shape={'round'} hideBelow={'md'}><svg /></IconBox>;

/** @ts-expect-error 'danger' is what one frontend calls it; the token, and therefore the tone, is 'destructive' */
const wrongToneName = <IconBox tone={'danger'}><svg /></IconBox>;

/** @ts-expect-error the fill axis is closed too */
const wrongFill = <IconBox fill={'glass'}><svg /></IconBox>;

const spinner = <Spinner size={'lg'} label={'Caricamento'} />;

/** @ts-expect-error the label is what a screen reader reads, so it is a string and not a node */
const wrongSpinnerLabel = <Spinner label={<span>no</span>} />;


/* --------
 * A compound reached through the dot keeps every check
 * -------- */
const pair = (
  <Heading gap={2}>
    <Heading.Eyebrow>Eyebrow</Heading.Eyebrow>
    <Heading.Title size={'xl'} lines={2}>Title</Heading.Title>
    <Heading.Description size={'xs'}>Description</Heading.Description>
  </Heading>
);

/** @ts-expect-error the eyebrow has two steps, and it never goes up to a title size */
const eyebrowWrongSize = <Heading.Eyebrow size={'md'}>no</Heading.Eyebrow>;

const headingAs = <Heading as={'hgroup'}><Heading.Title as={'h2'}>T</Heading.Title></Heading>;

/** @ts-expect-error the title has four steps and 'xs' is not one of them: that one belongs to the description */
const titleWrongSize = <Heading.Title size={'xs'}>no</Heading.Title>;

/** @ts-expect-error and the description does not go up to 'xl' */
const descriptionWrongSize = <Heading.Description size={'xl'}>no</Heading.Description>;

/** @ts-expect-error the clamp is a closed set, not a number */
const wrongLines = <Heading.Title lines={4}>no</Heading.Title>;

/** @ts-expect-error the gap of a heading is a spacing step, and 13 is not one */
const wrongGapValue = <Heading gap={13}>no</Heading>;


/* --------
 * `default` is a value on the four props that earn it, and on no others
 * -------- */
const chromeDefaults = (
  <React.Fragment>
    <Surface elevation={'default'} radius={'default'} />
    <Container size={'default'} />
    <Label emphasis={'default'}>Email</Label>
  </React.Fragment>
);

/** @ts-expect-error a measurement has no 'default': the scale is the lever, and data-size says what it is */
const iconBoxNoDefault = <IconBox size={'default'}><svg /></IconBox>;

/** @ts-expect-error neither does a typographic step */
const titleNoDefault = <Heading.Title size={'default'}>no</Heading.Title>;

/** @ts-expect-error nor a caller-intent prop: 'vertical' is what you meant, not a house opinion */
const itemNoDefault = <Item direction={'default'}>no</Item>;

/** @ts-expect-error nor the spinner's size */
const spinnerNoDefault = <Spinner size={'default'} />;


/* --------
 * The card, and the 'default' that is not a step
 * -------- */
const card = (
  <Surface elevation={'raised'} radius={'2xl'} loading loadingLabel={'Caricamento'}>
    <Surface.Header>
      <Heading><Heading.Title size={'lg'}>Mezzi</Heading.Title></Heading>
    </Surface.Header>
    <Surface.Separator />
    <Surface.Section flush>{null}</Surface.Section>
    <Surface.Separator type={'gap'} space={8} />
    <Surface.Footer justify={'between'} muted>{null}</Surface.Footer>
  </Surface>
);

/** `default` is a value of its own, which is what makes "no opinion" targetable */
const noOpinion = <Surface elevation={'default'} radius={'default'} />;

/** @ts-expect-error the modal elevation belongs to whichever package ships a dialog */
const modalSurface = <Surface elevation={'modal'} />;

/** @ts-expect-error the label is read out, so it is a string and not a node */
const wrongLoadingLabel = <Surface loadingLabel={<span>no</span>} />;

/** @ts-expect-error the separator has two kinds and neither is a hairline-with-room */
const wrongSeparator = <Surface.Separator type={'both'} />;

/** @ts-expect-error the space of a gap is a spacing step */
const wrongSeparatorSpace = <Surface.Separator type={'gap'} space={13} />;

/** The header is an Item, so it takes an Item's props */
const headerIsAnItem = <Surface.Header direction={'vertical'} align={'start'} interactive />;


/* --------
 * The row, and the semantics it refuses to fake
 * -------- */
const listRow = (
  <Item interactive inset gap={3}>
    <IconBox><svg /></IconBox>
    <Heading><Heading.Title>FT-234-KL</Heading.Title></Heading>
    <Item.Actions>{null}</Item.Actions>
    <Item.Trailing>{null}</Item.Trailing>
  </Item>
);

/** A row that IS a button says so with the element, and then `type` is available */
const buttonRow = <Item as={'button'} type={'button'} interactive>row</Item>;

const emptyStateRow = (
  <Item direction={{ base: 'vertical', lg: 'horizontal' }} align={'center'} className={'text-center'}>
    <IconBox size={'2xl'} halo><svg /></IconBox>
  </Item>
);

/** @ts-expect-error 'type' is a button attribute, and a div is not a button */
const divWithType = <Item type={'button'}>no</Item>;

/** @ts-expect-error the gap is a spacing step */
const itemWrongGap = <Item gap={13}>no</Item>;

/** @ts-expect-error and there is no chrome: a boxed row is a Surface around it */
const itemWrongTone = <Item tone={'boxed'}>no</Item>;


/* --------
 * A component, not only an intrinsic element
 * -------- */
interface CustomProps {
  className?: string;
  title: string;
}

const Custom: React.FunctionComponent<CustomProps> = () => null;

const throughAComponent = <Container as={Custom} title={'required by Custom'} size={'xl'} />;

/** @ts-expect-error 'title' is required by Custom, and this does not pass it */
const missingComponentProp = <Container as={Custom} size={'xl'} />;


/* --------
 * The layout props of the interactive tier take a value per breakpoint
 * -------- */
const responsiveSpan = <Field span={{ base: 6, md: 3, xl: 2 }} breakBefore={{ base: false, md: true }}>ok</Field>;

const singleSpan = <Field span={4} breakBefore>ok</Field>;

/** @ts-expect-error 5 is not a span of a six-column section */
const wrongSpan = <Field span={{ base: 6, md: 5 }}>no</Field>;

const responsiveGroups = (
  <React.Fragment>
    <CheckboxGroup orientation={{ base: 'vertical', md: 'horizontal' }} />
    <RadioGroup variant={'card'} orientation={{ base: 'vertical', lg: 'horizontal' }} />
  </React.Fragment>
);

/** @ts-expect-error 'row' is not an orientation */
const wrongOrientation = <RadioGroup orientation={{ base: 'row' }} />;

const responsiveBlock = <Button block={{ base: true, md: false }} hideBelow={'sm'}>ok</Button>;

/** @ts-expect-error `base` takes no hide: below the narrowest breakpoint there is nothing to hide */
const wrongHide = <Button hideBelow={'base'}>no</Button>;

const besideOnDesktop = (
  <Field orientation={{ base: 'vertical', md: 'horizontal' }}>
    <Field.Label optional={'optional'}>Notes</Field.Label>
  </Field>
);

/** @ts-expect-error 'inline' is PinTips' word, here the orientation says it */
const wrongFieldOrientation = <Field orientation={'inline'}>no</Field>;

const ownControl = <FieldShell size={'sm'} leading={'@'} trailing={'h'} invalid hideFrom={'md'}>ok</FieldShell>;

/** @ts-expect-error the three heights of every control, and no fourth */
const wrongShellSize = <FieldShell size={'xl'}>no</FieldShell>;


/* --------
 * Keep the compiler from pruning the assertions
 * -------- */
export const CHECKED = [
  badges, titleWithBadge, badgeWrongTone, badgeWrongFill, badgeNoDefault,
  chromeDefaults, iconBoxNoDefault, titleNoDefault, itemNoDefault, spinnerNoDefault,
  card, noOpinion, modalSurface, wrongLoadingLabel, wrongSeparator, wrongSeparatorSpace,
  headerIsAnItem, listRow, buttonRow, emptyStateRow, divWithType, itemWrongGap, itemWrongTone,
  pair, eyebrowWrongSize, headingAs, titleWrongSize, descriptionWrongSize, wrongLines, wrongGapValue, flatPart,
  softMuted, solidDestructive, emptyState, wrongToneName, wrongFill, spinner, wrongSpinnerLabel,
  anchorStack, sectionStack, plainStack, wrongAttribute, wrongAttributeToo,
  scaleRespected, outsideTheScale, outsideTheColumns, outsideTheScaleResponsive,
  baseIsNotABreakpoint, unknownBreakpoint, asAWrapper, labelDefault, quietLabel, spanWithHtmlFor,
  skipLink, contradictoryProps, throughAComponent, missingComponentProp,
  responsiveSpan, singleSpan, wrongSpan, responsiveGroups, wrongOrientation, responsiveBlock, wrongHide,
  besideOnDesktop, wrongFieldOrientation, ownControl, wrongShellSize
];
