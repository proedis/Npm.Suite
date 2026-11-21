import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import itemProps from 'virtual:ui-props/DetailItemProps';
import labelsProps from 'virtual:ui-props/DetailLabels';
import detailProps from 'virtual:ui-props/DetailProps';
import sectionProps from 'virtual:ui-props/DetailSectionProps';

import { Callout } from '@/docs/Callout';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import aligned from '@/examples/data/detail/aligned.tsx?example';
import basic from '@/examples/data/detail/basic.tsx?example';
import inContext from '@/examples/data/detail/in-context.tsx?example';
import responsive from '@/examples/data/detail/responsive.tsx?example';
import sections from '@/examples/data/detail/sections.tsx?example';
import spanMap from '@/examples/data/detail/span-map.tsx?example';
import states from '@/examples/data/detail/states.tsx?example';
import types from '@/examples/data/detail/types.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/data/detail');

const STRETCH = 'p-4 sm:p-6';


/* --------
 * Page
 * -------- */

function DetailPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The read-only content of a record: sections with a title, values with their label above, on the grid of
            six columns of a form section. Each value takes the columns of the field that edits it, so a record and its
            form line up column for column. It is a content, not a container: it
            stands in a drawer, a dialog, a card or a page and does not know which.
          </React.Fragment>
        )}
        imports={tsx`
          import { Detail, DETAIL_SPAN } from '@proedis/ui/data/detail';

          import type { DetailLabels, DetailValueType } from '@proedis/ui/data/detail';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} previewClassName={STRETCH} />

        <Section
          title={'Anatomy'}
          lead={(
            <React.Fragment>
              <InlineCode>Detail</InlineCode> holds the texts of service, once, in <InlineCode>labels</InlineCode>: the
              package writes none, not even the “Yes” of a boolean. <InlineCode>Detail.Section</InlineCode> groups values
              under a title, <InlineCode>Detail.Grid</InlineCode> is the grid of six and the description list itself,{' '}
              <InlineCode>Detail.Item</InlineCode> is one value with its label. The values arrive already formatted:
              a date, a weight, an amount are the application’s to write, with its own formatters.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              <InlineCode>null</InlineCode>, <InlineCode>undefined</InlineCode> and the empty string are the value that
              is not there: a quiet dash, named for a screen reader with <InlineCode>labels.empty</InlineCode>. A
              boolean written as <InlineCode>&#123;true&#125;</InlineCode> or <InlineCode>&#123;false&#125;</InlineCode>{' '}
              reads as <InlineCode>labels.yes</InlineCode> and <InlineCode>labels.no</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Kinds of value'}
          lead={(
            <React.Fragment>
              <InlineCode>type</InlineCode> says what a value is, and the kind gives its columns out of six, from{' '}
              <InlineCode>DETAIL_SPAN</InlineCode>: the same as the field of the same kind in a form, the text kinds
              being the field’s own. Every kind below, with its span in the label.
            </React.Fragment>
          )}
        >
          <Example of={types} align={'stretch'} previewClassName={STRETCH} />
          <DocTable
            head={[ 'Kind', 'Columns', 'For' ]}
            rows={[
              [ <InlineCode key={'k'}>text-short</InlineCode>, '1', 'A floor, a size, two or three characters.' ],
              [ <InlineCode key={'k'}>text-code</InlineCode>, '2', 'A code, a plate, a phone number.' ],
              [ <InlineCode key={'k'}>text</InlineCode>, '3', 'A name, a town. The default.' ],
              [ <InlineCode key={'k'}>text-long</InlineCode>, '4', 'An address, an email.' ],
              [ <InlineCode key={'k'}>date</InlineCode>, '2', 'A date, a time, a period.' ],
              [ <InlineCode key={'k'}>number</InlineCode>, '2', 'A quantity, a weight, an amount.' ],
              [ <InlineCode key={'k'}>boolean</InlineCode>, '3', 'Yes or no, from labels.yes and labels.no.' ],
              [ <InlineCode key={'k'}>choice</InlineCode>, '3', 'The label of a value from a list.' ],
              [ <InlineCode key={'k'}>person</InlineCode>, '4', 'Who did something.' ],
              [ <InlineCode key={'k'}>record</InlineCode>, '4', 'Another record, a contract, a weighbridge.' ],
              [ <InlineCode key={'k'}>list</InlineCode>, '4', 'Several values, aligned to the top.' ],
              [ <InlineCode key={'k'}>paragraph</InlineCode>, '6', 'Free text, at the width of a line of prose, its line breaks kept.' ]
            ]}
          />
        </Section>

        <Section
          title={'Sections'}
          lead={(
            <React.Fragment>
              A section has a title and follows the order of the sections of the form of the same record. Two sections
              in a row are separated by a rule with room on both sides. Without a title the section is the only one of
              its detail, named by what holds it.
            </React.Fragment>
          )}
        >
          <Example of={sections} align={'stretch'} previewClassName={STRETCH} />

          <SubSection
            title={'Copying a value'}
            lead={(
              <React.Fragment>
                <InlineCode>copyable</InlineCode> adds a button that copies the text of the value: an email, a code, a
                phone number. It shows under the pointer and with the focus inside the value, says “Copied” with a tick
                for a moment, and the copy, or its failure, is announced from a status region the detail always
                mounts. On a page served over plain http the clipboard does not exist: the copy then fails, and says so.
              </React.Fragment>
            )}
          />

          <SubSection
            title={'A section that is one collection'}
            lead={(
              <React.Fragment>
                <InlineCode>hideLabel</InlineCode> keeps the label for a screen reader and hides it on screen, and the value
                takes the whole row: for the one value of a section that the title already names, as Materials above.
              </React.Fragment>
            )}
          />
        </Section>

        <Section
          title={'Loading and errors'}
          lead={(
            <React.Fragment>
              A section that arrives from a call of its own says so by itself, and the rest of the detail does not
              wait for it. <InlineCode>loading</InlineCode> keeps the real labels and puts a placeholder in place of each
              value, so nothing moves when the values arrive; <InlineCode>error</InlineCode> takes the place of the
              values, and <InlineCode>onRetry</InlineCode> adds the button that loads them again.
            </React.Fragment>
          )}
        >
          <Example of={states} align={'stretch'} previewClassName={STRETCH} />
        </Section>

        <Section
          title={'Narrow containers'}
          lead={(
            <React.Fragment>
              A span written as one value lets the grid decide when it is narrow: below 32rem of its own width,
              measured on the grid with a container query and not on the window, the short values take half a row
              and the others a whole one. That is what keeps a detail right in a drawer on a wide screen.
            </React.Fragment>
          )}
        >
          <Example of={responsive} align={'stretch'} previewClassName={STRETCH} />
        </Section>

        <Section
          title={'Spans per breakpoint'}
          lead={(
            <React.Fragment>
              <InlineCode>span</InlineCode> overrides the columns of the kind, only for a reason said in review. A map,{' '}
              <InlineCode>&#123; base: 6, sm: 3, lg: 2 &#125;</InlineCode>, speaks of the window, like every responsive
              value of the package, and is the caller’s decision at every width: the rule of the grid steps aside. A
              map without <InlineCode>base</InlineCode> starts from the columns of the kind.{' '}
              <InlineCode>breakBefore</InlineCode> starts a new row, per breakpoint too: the first of two related
              values. Narrow the window to watch both.
            </React.Fragment>
          )}
        >
          <Example of={spanMap} align={'stretch'} previewClassName={STRETCH} />
          <Callout>
            The same contract as the <InlineCode>span</InlineCode> and <InlineCode>breakBefore</InlineCode> of a{' '}
            <InlineCode>Field</InlineCode>, on purpose: a value and the field that edits it keep the same place at every
            width.
          </Callout>
        </Section>

        <Section
          title={'Aligned with its form'}
          lead={(
            <React.Fragment>
              The reason the detail is a grid of its own: in edit, each field takes the columns of the value it edits.
              The same six columns as <InlineCode>Form.Section</InlineCode>, the same three rows per value (label,
              value, and an empty row where a field keeps its messages), so a label that wraps keeps the values of its
              row aligned. Switch between the two and watch the columns hold.
            </React.Fragment>
          )}
        >
          <Example of={aligned} align={'stretch'} previewClassName={STRETCH} />
          <Callout>
            Across, the two match to the pixel. Down, they do not quite: measured above, the first field sits 8px lower
            than the first value, under a section title in the same place, and each row of the form is 3px taller,
            since the label of a field is a step larger than the label of a value.
          </Callout>
        </Section>

        <Section
          title={'In context'}
          lead={'The detail of a round in a card, under a header with its state and its action.'}
        >
          <Example of={inContext} align={'stretch'} previewClassName={STRETCH} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The grid is a description list, <InlineCode>{'<dl>'}</InlineCode>, each value a{' '}
              <InlineCode>{'<dt>'}</InlineCode> and a <InlineCode>{'<dd>'}</InlineCode> in a{' '}
              <InlineCode>{'<div>'}</InlineCode>, so a screen reader reads a name and its value as a pair. A section with
              a title is a <InlineCode>group</InlineCode> named by it, not a landmark, with a real heading at{' '}
              <InlineCode>headingLevel</InlineCode>: 3 by default, under the title of the drawer, dialog or page around
              it. A loading section is <InlineCode>aria-busy</InlineCode>.
            </p>
            <p>
              The dash of a missing value is hidden from assistive technology and replaced by{' '}
              <InlineCode>labels.empty</InlineCode>. The copy button is named and has a tooltip; its result is announced
              from the one status region of the detail.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Slots and data attributes'}
          lead={'Every part a stylesheet can reach, and what each one reports.'}
        >
          <SlotsTable
            rows={[
              { slot: 'detail', part: 'The root' },
              { slot: 'detail-status', part: 'The status region that announces a copy' },
              { slot: 'detail-section', part: 'A section', attributes: [ 'data-heading-level', 'data-loading', 'data-error' ] },
              { slot: 'detail-section-title', part: 'The title of a section' },
              { slot: 'detail-section-error', part: 'The error of a section, with its Retry' },
              { slot: 'detail-grid', part: 'The grid of six, the <dl>' },
              { slot: 'detail-item', part: 'One value with its label', attributes: [ 'data-type', 'data-span', 'data-break-before', 'data-empty', 'data-label-hidden', 'data-copyable' ] },
              { slot: 'detail-label', part: 'The label, the <dt>' },
              { slot: 'detail-value', part: 'The value, the <dd>' },
              { slot: 'detail-value-text', part: 'The text of the value, what a copy copies' },
              { slot: 'detail-empty', part: 'The dash of a value that is not there' },
              { slot: 'detail-copy', part: 'The copy button' },
              { slot: 'detail-skeleton', part: 'The placeholder of a value while its section loads' }
            ]}
          />
          <Prose>
            <p>
              <InlineCode>data-span</InlineCode> and <InlineCode>data-break-before</InlineCode> report the value at the
              narrowest width when they change per breakpoint.
            </p>
          </Prose>
        </Section>

        <Section title={'API'}>
          <SubSection title={'Detail'} id={'api-detail'}>
            <PropsTable props={detailProps} rest={'The native props of a <div> reach the root.'} />
          </SubSection>

          <SubSection title={'Detail.Section'} id={'api-detail-section'}>
            <PropsTable props={sectionProps} rest={'The native props of a <div> reach the section.'} />
          </SubSection>

          <SubSection
            title={'Detail.Grid'}
            id={'api-detail-grid'}
            lead={'No props of its own: the shared props, and the native props of a <dl>.'}
          />

          <SubSection title={'Detail.Item'} id={'api-detail-item'}>
            <PropsTable
              props={itemProps}
              rest={(
                <React.Fragment>
                  The native props of a <InlineCode>{'<div>'}</InlineCode> reach the item.{' '}
                  <InlineCode>breakBefore</InlineCode>, <InlineCode>hideLabel</InlineCode> and{' '}
                  <InlineCode>copyable</InlineCode> default to <InlineCode>false</InlineCode>.
                </React.Fragment>
              )}
            />
          </SubSection>

          <SubSection title={'DetailLabels'} id={'api-detail-labels'}>
            <PropsTable props={labelsProps} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Follow the form of the record'}>
              The same sections, in the same order, with the same kinds. Then each field of the form edit sits in the
              columns of the value it replaces.
            </Guidance>
            <Guidance kind={'dont'} title={'Override a span without a reason'}>
              The kind already gives the columns the field takes. A span of your own is a decision to say in review,
              and it has to be the same on the field.
            </Guidance>
            <Guidance kind={'do'} title={'Pass the value formatted'}>
              The detail writes what it receives. A date, a weight or an amount goes through the application’s
              formatters first, the same ones the table reads.
            </Guidance>
            <Guidance kind={'dont'} title={'Hide a missing value'}>
              Leave the item with null as its value: the dash says it is not there, and a screen reader hears your
              labels.empty. A row that vanishes moves every value after it.
            </Guidance>
            <Guidance kind={'do'} title={'Load a slow section on its own'}>
              A section that needs a call of its own takes loading and error, and the rest of the record is readable
              meanwhile.
            </Guidance>
            <Guidance kind={'dont'} title={'Make everything copyable'}>
              The copy button is for what is pasted elsewhere: an email, a code, a phone number. On a name or a date it
              is noise.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/data/detail')({
  component: DetailPage
});
