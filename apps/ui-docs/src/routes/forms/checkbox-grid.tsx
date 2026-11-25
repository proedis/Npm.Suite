import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import gridProps from 'virtual:ui-props/CheckboxGridProps';
import themeDoc from 'virtual:ui-theme/forms/checkbox-grid';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { SlotsInspector } from '@/docs/SlotsInspector';
import { DocTable, PropsTable } from '@/docs/Tables';
import basic from '@/examples/forms/checkbox-grid/basic.tsx?example';
import labels from '@/examples/forms/checkbox-grid/labels.ts?source';
import permissions from '@/examples/forms/checkbox-grid/permissions.ts?source';
import readOnly from '@/examples/forms/checkbox-grid/read-only.tsx?example';
import search from '@/examples/forms/checkbox-grid/search.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/checkbox-grid');


/* --------
 * Page
 * -------- */

function CheckboxGridPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Boxes in sections that open and close: rows of items, columns of choices. The permissions of a profile are
            the case it was made for, areas of entities against read, create, update and delete. It is the value of a
            form, saved with the button.
          </React.Fragment>
        )}
        imports={tsx`
          import { CheckboxGrid } from '@proedis/ui/forms/checkbox-grid';
          import type { CheckboxGridColumn, CheckboxGridGroup, CheckboxGridLabels, CheckboxGridValue } from '@proedis/ui/forms/checkbox-grid';
        `}
      />

      <PageBody>
        <Example of={basic} align={'stretch'} />

        <Section
          title={'Groups, items and columns'}
          lead={(
            <React.Fragment>
              <InlineCode>groups</InlineCode> are the sections, each with its <InlineCode>items</InlineCode>, the rows;{' '}
              <InlineCode>columns</InlineCode> are the choices. The value maps an item to the ids of its checked columns,
              so a profile is stored as it is read.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={permissions} title={permissions.file} maxHeight={420} />
          <Prose>
            <p>
              An item’s <InlineCode>locked</InlineCode> columns are decided by the system: shown as they are in the value,
              never changed from here, with a tooltip that says why. The audit log above is always readable.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Sections that open'}
          lead={(
            <React.Fragment>
              The groups are an Accordion, each header summing its group up, “2 of 4 entities with permissions”. All are
              closed by default and not remembered; <InlineCode>defaultOpenGroups</InlineCode> or the controlled{' '}
              <InlineCode>openGroups</InlineCode> open some. A closed group has no parent boxes: to act on a whole area,
              open it.
            </React.Fragment>
          )}
        />

        <Section
          title={'Parent boxes'}
          lead={(
            <React.Fragment>
              The first row of an open group, “Whole area”, holds a parent box per column. It is full, partial or empty
              over the editable items of its group only, and read only when every item of its column is locked. A click
              on an empty or partial one grants the column to every editable item; on a full one, takes it away.
            </React.Fragment>
          )}
        />

        <Section
          title={'Rules between the columns'}
          lead={(
            <React.Fragment>
              The grid does not know that updating something needs reading it. <InlineCode>resolve</InlineCode> does:
              it receives the value a click proposes and the one before, and returns the value to keep. In the example a
              grant of create, update or delete brings read with it, and taking read away takes the rest.
            </React.Fragment>
          )}
        >
          <Prose>
            <p>
              Every change is announced, the ones the rules make included: “Update and Read granted to Drivers” after
              a single box, “Read granted to 4 entities of Fleet” after a parent box. The texts are{' '}
              <InlineCode>labels.toggled</InlineCode> and <InlineCode>labels.bulk</InlineCode>.
            </p>
          </Prose>
        </Section>

        <Section
          title={'What changed'}
          lead={(
            <React.Fragment>
              With <InlineCode>savedValue</InlineCode>, the value as it is on the server, every box that differs carries a
              dot and its group says “modified” after its name. A box brought back as it was loses both. In the example,
              Save makes the current value the saved one and the marks go; Discard changes brings the saved one back.
            </React.Fragment>
          )}
        />

        <Section
          title={'Labels'}
          lead={'Every text of service of the grid is yours. Most of them carry a count, and are functions.'}
        >
          <CodeBlock snippet={labels} title={labels.file} maxHeight={420} />
        </Section>

        <Section
          title={'Search'}
          lead={(
            <React.Fragment>
              The search is the caller’s, who knows the text of the labels: <InlineCode>visibleItems</InlineCode> is the
              set of the items to show. Their groups open, and a group that shows only part of its items has no parent
              boxes, which would act on rows nobody sees. A group found by its name passes all its items. Type “fuel”,
              then “billing”.
            </React.Fragment>
          )}
        >
          <Example of={search} align={'stretch'} />
        </Section>

        <Section
          title={'Read only'}
          lead={(
            <React.Fragment>
              <InlineCode>readOnly</InlineCode> is consultation: no boxes, and each item says its checked columns in words,
              through <InlineCode>labels.readOnlyValue</InlineCode>, an empty list included.
            </React.Fragment>
          )}
        >
          <Example of={readOnly} align={'stretch'} />
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The headers of the groups are real headings and Tab stops. The body of an open group is a grid with one Tab
              stop: the first time on its first parent box, then on the last box visited. The boxes themselves move the
              tab index, so the state of the box is what gets announced, and a partial parent box says how many items
              have its column.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'From one group header to the next; into an open grid with one stop.' ],
              [ <InlineCode key={'k'}>Arrows</InlineCode>, 'Move between the boxes of the grid.' ],
              [ <InlineCode key={'k'}>Space</InlineCode>, 'Ticks or clears the box.' ],
              [ <InlineCode key={'k'}>Home</InlineCode>, 'The first box of the row. End, the last.' ],
              [ <InlineCode key={'k'}>Ctrl Home</InlineCode>, 'The first row. Ctrl End, the last.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SlotsInspector of={basic}
            rows={[
              { slot: 'checkbox-grid', part: 'The grid', attributes: [ 'data-read-only', 'data-searching' ] },
              { slot: 'checkbox-grid-header', part: 'The header of the columns, which stays put while the grid scrolls' },
              { slot: 'checkbox-grid-column-header', part: 'A column title' },
              { slot: 'checkbox-grid-groups', part: 'The groups, an Accordion with inset' },
              { slot: 'accordion-item', part: 'A group', attributes: [ 'data-open', 'data-modified' ] },
              { slot: 'checkbox-grid-modified', part: 'The “modified” after the name of a group' },
              { slot: 'checkbox-grid-body', part: 'The grid of an open group' },
              { slot: 'checkbox-grid-all', part: 'The row of the parent boxes' },
              { slot: 'checkbox-grid-item', part: 'The row of an item' },
              { slot: 'checkbox-grid-item-name', part: 'Its name' },
              { slot: 'checkbox-grid-cell', part: 'A cell', attributes: [ 'data-parent', 'data-locked', 'data-changed' ] },
              { slot: 'checkbox-grid-box', part: 'The box, which takes the focus', attributes: [ 'data-checked', 'data-indeterminate' ] },
              { slot: 'checkbox-grid-indicator', part: 'The tick or the dash' },
              { slot: 'checkbox-grid-changed', part: 'The dot of a box that differs from the saved value' },
              { slot: 'checkbox-grid-text', part: 'The checked columns in words, in read only' },
              { slot: 'checkbox-grid-status', part: 'The status region of the announcements' }
            ]}
          />
        </Section>

        <Section title={'API'}>
          <PropsTable
            props={gridProps}
            rest={(
              <React.Fragment>
                Every other prop goes to the root <InlineCode>{'<div>'}</InlineCode>. <InlineCode>headingLevel</InlineCode>{' '}
                defaults to 3.
              </React.Fragment>
            )}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Write the rules in resolve'}>
              The dependencies between rights belong to the domain. Keep them in one function, and the grid applies and
              announces them.
            </Guidance>
            <Guidance kind={'dont'} title={'A third level'}>
              Group and item, two levels. A deeper tree is a different screen, not a grid with more indentation.
            </Guidance>
            <Guidance kind={'do'} title={'Pass the saved value'}>
              Before a Save, the user wants to see what they changed. The dots and the “modified” cost one prop.
            </Guidance>
            <Guidance kind={'dont'} title={'Open every group by default'}>
              The summaries in the headers are the overview. Open the group the user came for, if there is one.
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

export const Route = createFileRoute('/forms/checkbox-grid')({
  component: CheckboxGridPage
});
