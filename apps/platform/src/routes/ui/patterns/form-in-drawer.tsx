import * as React from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section } from '@/docs/Page';
import { DocTable } from '@/docs/Tables';
import create from '@/examples/patterns/form-in-drawer/create.tsx?example';
import edit from '@/examples/overlays/drawer/edit.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/patterns/form-in-drawer');

const LINK = 'font-medium text-primary hover:underline';


/* --------
 * Page
 * -------- */

function FormInDrawerPatternPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Creating a record, or editing one, without leaving the list it belongs to. The drawer holds the form; the
            form tells the drawer when it is being sent and when it was changed, and the drawer acts on both.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section
          title={'Creating'}
          lead={'A BoundForm with its schema in the body, Submit and Cancel in the footer. Type something, then press Esc.'}
        >
          <Example of={create} />
          <Prose>
            <p>
              <strong>The drawer is told nothing about the form.</strong> A <InlineCode>Form</InlineCode> inside a{' '}
              <InlineCode>Drawer</InlineCode> or a <InlineCode>Dialog</InlineCode> reports to it: while{' '}
              <InlineCode>onSubmit</InlineCode> runs the drawer waits and nothing closes it, and once the form was changed
              leaving asks first, with the texts of <InlineCode>discard</InlineCode>. <InlineCode>Form.Submit</InlineCode>{' '}
              and <InlineCode>Form.Cancel</InlineCode> work from the footer, outside the{' '}
              <InlineCode>{'<form>'}</InlineCode>: they reach the form through the drawer.
            </p>
            <p>
              <strong>The schema gives the fields.</strong> Labels, asterisks, counters and bounds come from{' '}
              <InlineCode>vehicleSchema</InlineCode>; the fields say only their name and their width on the grid of six.
              The form is reset when the drawer closes, so the next one opens empty.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Reading, then editing'}
          lead={'The drawer opens a record to read; its footer switches it to the form, and Cancel comes back to the record.'}
        >
          <Example of={edit} />
          <Prose>
            <p>
              <InlineCode>mode</InlineCode> is <InlineCode>detail</InlineCode> or <InlineCode>form</InlineCode>, and{' '}
              <InlineCode>onBack</InlineCode> is where the form returns to. This example keeps its own state, with{' '}
              <InlineCode>dirty</InlineCode> and <InlineCode>busy</InlineCode> as props of the drawer; with a BoundForm,
              as above, the form reports them itself.
            </p>
          </Prose>
        </Section>

        <Section title={'The pieces'}>
          <DocTable
            head={[ 'Part', 'Component' ]}
            rows={[
              [ 'The panel', <Link key={'k'} to={'/ui/overlays/drawer'} className={LINK}>Drawer</Link> ],
              [ 'The form, bound to its schema', <React.Fragment key={'k'}><Link to={'/ui/form-binding/bound-form'} className={LINK}>BoundForm</Link>, <Link to={'/ui/form-binding/bound-field'} className={LINK}>BoundField</Link></React.Fragment> ],
              [ 'Sections, Submit, Cancel', <Link key={'k'} to={'/ui/forms/form'} className={LINK}>Form</Link> ],
              [ 'A centred panel instead, for a short form', <Link key={'k'} to={'/ui/overlays/dialog'} className={LINK}>Dialog</Link> ]
            ]}
          />
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'A drawer when the list matters'}>
              Creating or editing beside the records it joins. A Dialog for a short form that stands on its own.
            </Guidance>
            <Guidance kind={'dont'} title={'Wire the busy state by hand'}>
              With a Form inside, the drawer knows when it is sent and when it changed. Passing them again can only
              disagree with the form.
            </Guidance>
            <Guidance kind={'do'} title={'Give discard its texts'}>
              The question before closing a changed form is the application&apos;s, in its language.
            </Guidance>
            <Guidance kind={'dont'} title={'A Field inside the BoundForm'}>
              A plain Field sits there unbound, silently: its control edits nothing of the form. Every field of a
              BoundForm is a BoundField.
            </Guidance>
          </GuidanceGrid>
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/patterns/form-in-drawer')({
  component: FormInDrawerPatternPage
});
