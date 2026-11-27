import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { CodeBlock } from '@/docs/CodeBlock';
import { InlineCode } from '@/docs/InlineCode';
import { PageBody, PageHeader, Prose, Section, SubSection } from '@/docs/Page';
import { bash, json } from '@/docs/snippet';
import { DocTable } from '@/docs/Tables';
import { pageAt } from '@/nav';


/* --------
 * Constants Definition
 * -------- */

const PAGE = pageAt('/ui/ai');

const LINK = 'font-medium text-primary hover:underline';

const SITE = 'https://platform.container.proedis.com';


/* --------
 * Page
 * -------- */

function AiPage(): React.ReactNode {
  return (
    <React.Fragment>
      <PageHeader
        page={PAGE}
        lead={(
          <React.Fragment>
            The documentation of Proedis UI, ready for a coding agent: as text an assistant reads, as an MCP server it
            asks, and as skills that tell it how the package is meant to be used. All three come from these pages, so
            an agent reads what you read.
          </React.Fragment>
        )}
      />

      <PageBody>
        <Section
          title={'Which one'}
          lead={'They add up rather than compete: the plugin of Claude Code installs the server and the skills together.'}
        >
          <DocTable
            head={[ 'You use', 'Reach for' ]}
            rows={[
              [ 'Claude Code', 'The plugin: the server and the three skills in one install' ],
              [ 'Cursor, Codex, VS Code, any MCP client', 'The MCP server, then the skills where the client reads them' ],
              [ 'A chat assistant with no tools', 'llms.txt, or the Markdown of the one page you need' ]
            ]}
          />
        </Section>

        <Section
          title={'Documentation as text'}
          lead={(
            <React.Fragment>
              Every page of this section as Markdown, written while the site is built: the examples are the files the
              site runs, the props tables come from the types. Give an assistant the index and say which version you
              use.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'File', 'What it holds' ]}
            rows={[
              [ <a key={'f'} href={`${SITE}/llms.txt`} className={LINK}>/llms.txt</a>, 'The index, one link per page, by group' ],
              [ <a key={'f'} href={`${SITE}/llms-full.txt`} className={LINK}>/llms-full.txt</a>, 'Every page in one file, about 1.3 MB' ],
              [ <InlineCode key={'f'}>/llms/&lt;page&gt;.md</InlineCode>, 'One page: /llms/ui-forms-text-input.md for TextInput' ]
            ]}
          />
        </Section>

        <Section
          title={'The MCP server'}
          lead={(
            <React.Fragment>
              <InlineCode>@proedis/mcp</InlineCode> answers an agent with the pages, the props and the theme variables of
              each component. Its data ships in the package, nothing is fetched, and at start it compares the version it
              documents with the <InlineCode>@proedis/ui</InlineCode> the project installs: when they differ, every
              answer says so. Start it from the root of the project.
            </React.Fragment>
          )}
        >
          <SubSection title={'Claude Code'}>
            <CodeBlock snippet={bash`claude mcp add proedis -- npx -y @proedis/mcp`} />
          </SubSection>
          <SubSection title={'Cursor'} lead={'In .cursor/mcp.json of the project, or ~/.cursor/mcp.json for every project.'}>
            <CodeBlock
              snippet={json`
                {
                  "mcpServers": {
                    "proedis": { "command": "npx", "args": [ "-y", "@proedis/mcp" ] }
                  }
                }
              `}
            />
          </SubSection>
          <SubSection title={'VS Code'} lead={'In .vscode/mcp.json, the same entry under servers instead of mcpServers.'}>
            <CodeBlock
              snippet={json`
                {
                  "servers": {
                    "proedis": { "command": "npx", "args": [ "-y", "@proedis/mcp" ] }
                  }
                }
              `}
            />
          </SubSection>
          <SubSection title={'Codex'}>
            <CodeBlock snippet={bash`codex mcp add proedis -- npx -y @proedis/mcp`} />
          </SubSection>
          <Prose>
            <p>
              Five tools, all read only: <InlineCode>search_docs</InlineCode>, <InlineCode>list_items</InlineCode>,{' '}
              <InlineCode>get_item_doc</InlineCode> (the outline of a page, one section, or all of it),{' '}
              <InlineCode>get_item_props</InlineCode> and <InlineCode>get_item_theming</InlineCode> (the variables a
              component reads and its slots).
            </p>
          </Prose>
        </Section>

        <Section
          title={'The Claude Code plugin'}
          lead={'The server and the skills together, from the repository of the packages.'}
        >
          <CodeBlock
            snippet={bash`
              /plugin marketplace add proedis/Npm.Suite
              /plugin install proedis-ui@proedis
            `}
          />
          <Prose>
            <p>
              To offer it to everyone who opens a project, declare the marketplace and the plugin in the{' '}
              <InlineCode>.claude/settings.json</InlineCode> of that project; each person still confirms the install
              once.
            </p>
          </Prose>
          <CodeBlock
            snippet={json`
              {
                "extraKnownMarketplaces": {
                  "proedis": { "source": { "source": "github", "repo": "proedis/Npm.Suite" } }
                },
                "enabledPlugins": { "proedis-ui@proedis": true }
              }
            `}
          />
        </Section>

        <Section
          title={'Skills'}
          lead={(
            <React.Fragment>
              Where the documentation says what each piece is, a skill says how to work with the package: the steps, the
              choices and the mistakes an agent makes when it only knows a component&apos;s props. Each one looks things
              up through the server when it is connected, and through llms.txt when it is not.
            </React.Fragment>
          )}
        >
          <DocTable
            head={[ 'Skill', 'What it covers' ]}
            rows={[
              [
                <InlineCode key={'s'}>proedis-ui-layout</InlineCode>,
                'A screen: setup and imports, the layout primitives instead of flex and gap, the spacing scale, responsive maps, Surface and Item'
              ],
              [
                <InlineCode key={'s'}>proedis-ui-forms</InlineCode>,
                'A form: which piece to reach for, BoundForm with a Zod schema, Form and Field with your own state, dialogs, server errors'
              ],
              [
                <InlineCode key={'s'}>proedis-ui-theming</InlineCode>,
                'A product: where a value goes, the tokens to turn, dark mode, restyling one variant through its slots'
              ]
            ]}
          />
          <Prose>
            <p>
              They come with the plugin. For another agent, the same files install with the skills command line, one
              skill at a time:
            </p>
          </Prose>
          <CodeBlock
            snippet={bash`
              npx skills add https://github.com/proedis/Npm.Suite --skill proedis-ui-layout
              npx skills add https://github.com/proedis/Npm.Suite --skill proedis-ui-forms
              npx skills add https://github.com/proedis/Npm.Suite --skill proedis-ui-theming
            `}
          />
        </Section>
      </PageBody>
    </React.Fragment>
  );
}

export const Route = createFileRoute('/ui/ai')({
  component: AiPage
});
