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

import { Box, Container, Label, Stack, VisuallyHidden } from './src';

import type { StackProps } from './src';


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
 * Keep the compiler from pruning the assertions
 * -------- */
export const CHECKED = [
  anchorStack, sectionStack, plainStack, wrongAttribute, wrongAttributeToo,
  scaleRespected, outsideTheScale, outsideTheColumns, outsideTheScaleResponsive,
  baseIsNotABreakpoint, unknownBreakpoint, asAWrapper, labelDefault, quietLabel, spanWithHtmlFor,
  skipLink, contradictoryProps, throughAComponent, missingComponentProp
];
