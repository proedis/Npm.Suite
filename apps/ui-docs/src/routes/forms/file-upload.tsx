import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import attachmentListProps from 'virtual:ui-props/AttachmentListProps';
import fileUploadProps from 'virtual:ui-props/FileUploadProps';
import themeDoc from 'virtual:ui-theme/forms/file-upload';
import { Callout } from '@/docs/Callout';
import { CodeBlock } from '@/docs/CodeBlock';
import { Customization } from '@/docs/Customization';
import { Example } from '@/docs/Example';
import { Guidance, GuidanceGrid } from '@/docs/Guidance';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { tsx } from '@/docs/snippet';
import { DocTable, PropsTable, SlotsTable } from '@/docs/Tables';
import attachments from '@/examples/forms/file-upload/attachments.tsx?example';
import basic from '@/examples/forms/file-upload/basic.tsx?example';
import labels from '@/examples/forms/file-upload/labels.ts?source';
import rejected from '@/examples/forms/file-upload/rejected.tsx?example';
import single from '@/examples/forms/file-upload/single.tsx?example';
import states from '@/examples/forms/file-upload/states.tsx?example';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/forms/file-upload');


/* --------
 * Page
 * -------- */

function FileUploadPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            Attaching files in a form: a box that takes a drag or a choice, and the list of the files under it, each
            checked on arrival. And <InlineCode>AttachmentList</InlineCode>, the files an element already has, in its
            detail. Nothing here uploads: the files leave with the form.
          </React.Fragment>
        )}
        imports={tsx`
          import { AttachmentList, FileUpload, acceptsFile, validateFiles } from '@proedis/ui/forms/file-upload';
          import type { AttachmentItem, FileEntry, FileLimits, FileRejection } from '@proedis/ui/forms/file-upload';
        `}
      />

      <PageBody>
        <Example of={basic} />

        <Section
          title={'The files are yours'}
          lead={(
            <React.Fragment>
              <InlineCode>files</InlineCode> is controlled by the form. <InlineCode>onAdd</InlineCode> hands over the new
              files already checked, as <InlineCode>FileEntry</InlineCode> objects to append;{' '}
              <InlineCode>onRemove</InlineCode> gives the id of the one taken off. The caller sends the ready files when
              the form is confirmed.
            </React.Fragment>
          )}
        >
          <CodeBlock snippet={labels} title={labels.file} maxHeight={420} />
          <Prose>
            <p>
              The second line of the box, <InlineCode>labels.limits</InlineCode>, is written from the limits themselves,
              so the text and the check can never disagree. <InlineCode>formatSize</InlineCode> writes a size the way
              the application writes sizes.
            </p>
          </Prose>
        </Section>

        <Section
          title={'Limits and rejections'}
          lead={(
            <React.Fragment>
              <InlineCode>accept</InlineCode>, <InlineCode>maxSize</InlineCode> and <InlineCode>maxFiles</InlineCode> are
              checked on arrival, in that order, and the first rule that fails is the reason. A rejected file stays in
              the list with its reason, does not block the submit, and does not count towards the maximum. A second file
              with the same name says so.
            </React.Fragment>
          )}
        >
          <Example of={rejected} />
          <Prose>
            <p>
              The check is exported: <InlineCode>validateFiles(incoming, existing, limits)</InlineCode> is what the field
              runs, for a caller that needs it again, and <InlineCode>acceptsFile(file, accept)</InlineCode> tests one file
              against an <InlineCode>accept</InlineCode> list. The example builds its list with it.
            </p>
          </Prose>
        </Section>

        <Section
          title={'One file'}
          lead={(
            <React.Fragment>
              <InlineCode>{'maxFiles={1}'}</InlineCode> is the field for a single file. Once chosen, its row takes the
              place of the box, with “Replace”.
            </React.Fragment>
          )}
        >
          <Example of={single} />
        </Section>

        <Section
          title={'Dragging'}
          lead={(
            <React.Fragment>
              A drag lights the box only when it carries files, and says before the drop when it cannot be taken: too
              many, or of a kind not accepted. While the field is mounted, a file dropped beside it does not make the
              browser open the file and leave the form.
            </React.Fragment>
          )}
        />

        <Section
          title={'States'}
          lead={'Read only, the box is gone and the files stay. Invalid and disabled work as in every field.'}
        >
          <Example of={states} />
        </Section>

        <Section
          title={'The attachments of an element'}
          lead={(
            <React.Fragment>
              <InlineCode>AttachmentList</InlineCode> shows what an element already has: the name opens the file,
              “Download” stays in view, and the module’s own actions go behind a ⋯ from{' '}
              <InlineCode>renderActions</InlineCode>. A row is done, uploading, or failed with “Retry”.
            </React.Fragment>
          )}
        >
          <Example of={attachments} />
          <Callout>
            <InlineCode>onOpen</InlineCode> and <InlineCode>onDownload</InlineCode> are functions, not links: behind them is
            a hook of the application that asks for the file with the client’s token, which a plain link would not carry.
          </Callout>
        </Section>

        <Section title={'Accessibility'}>
          <Prose>
            <p>
              The whole box forwards a click to its one button, the only Tab stop, which the label of the field names.
              Every addition and removal is announced: “3 files added, 1 rejected”, “map.png removed”. After a removal
              the focus moves to the x of the row that took its place, or of the last row, or back to the button of the box.
            </p>
          </Prose>
          <DocTable
            head={[ 'Key', 'What it does' ]}
            rows={[
              [ <InlineCode key={'k'}>Enter</InlineCode>, 'On the button of the box, opens the window that chooses the files. Space does the same.' ],
              [ <InlineCode key={'k'}>Tab</InlineCode>, 'From the box to the x of each row.' ]
            ]}
          />
        </Section>

        <Customization theme={themeDoc} name={PAGE.title} />

        <Section title={'Slots and data attributes'}>
          <SubSection title={'FileUpload'} id={'slots-file-upload'}>
            <SlotsTable
              rows={[
                { slot: 'file-upload', part: 'The field', attributes: [ 'data-disabled', 'data-readonly', 'data-invalid', 'data-single' ] },
                { slot: 'file-upload-box', part: 'The box that takes a drag', attributes: [ 'data-drag', 'data-full', 'data-invalid' ] },
                { slot: 'file-upload-box-text', part: 'Its two lines' },
                { slot: 'file-upload-choose', part: 'The button that chooses the files' },
                { slot: 'file-upload-list', part: 'The list of the files' },
                { slot: 'file-upload-row', part: 'A file', attributes: [ 'data-rejected' ] },
                { slot: 'file-upload-row-text', part: 'Its name and detail' },
                { slot: 'file-upload-row-label', part: 'The name' },
                { slot: 'file-upload-row-detail', part: 'The size, or the reason of a rejection' },
                { slot: 'file-upload-row-actions', part: '“Replace” and the x' },
                { slot: 'file-upload-remove', part: 'The x of a row' },
                { slot: 'file-thumbnail', part: 'The thumbnail of an image, or the mark of a file' }
              ]}
            />
          </SubSection>
          <SubSection title={'AttachmentList'} id={'slots-attachment-list'}>
            <SlotsTable
              rows={[
                { slot: 'attachment-list', part: 'The list' },
                { slot: 'attachment-row', part: 'A file', attributes: [ 'data-status' ] },
                { slot: 'attachment-row-text', part: 'Its name and detail' },
                { slot: 'attachment-row-label', part: 'The line of the name' },
                { slot: 'attachment-name', part: 'The name, which opens the file' },
                { slot: 'attachment-row-detail', part: 'The detail, or the state' },
                { slot: 'attachment-row-actions', part: '“Download”, “Retry” and the ⋯' },
                { slot: 'file-thumbnail', part: 'The preview, or the mark of a file' }
              ]}
            />
          </SubSection>
        </Section>

        <Section title={'API'}>
          <SubSection title={'FileUpload'} id={'api-file-upload'}>
            <PropsTable props={fileUploadProps} rest={'Every other prop goes to the root <div>.'} />
          </SubSection>
          <SubSection title={'AttachmentList'} id={'api-attachment-list'}>
            <PropsTable props={attachmentListProps} rest={'Every other prop goes to the <ul>.'} />
          </SubSection>
        </Section>

        <Section title={'Guidelines'}>
          <GuidanceGrid>
            <Guidance kind={'do'} title={'Say the limits in the box'}>
              Write <InlineCode>labels.limits</InlineCode> from the limits, and the user knows what fits before trying.
            </Guidance>
            <Guidance kind={'dont'} title={'Upload on arrival'}>
              The field is part of a form. A file sent before the form is confirmed is a file to clean up when the user
              cancels.
            </Guidance>
            <Guidance kind={'do'} title={'Keep the rejected files in view'}>
              They do not block the submit, and the reason beside each is the whole explanation.
            </Guidance>
            <Guidance kind={'dont'} title={'A link to a protected file'}>
              Open and download through the client, with its token. A plain link opens a login page in a new tab.
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

export const Route = createFileRoute('/forms/file-upload')({
  component: FileUploadPage
});
