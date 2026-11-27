import type { DocsData } from './data';
import type { IndexItem, ItemKind } from './types';


/* --------
 * Types Definition
 * -------- */

export interface SearchOptions {
  readonly query: string;
  readonly kind?: ItemKind;
  readonly limit?: number;
}

export interface SearchHit {
  readonly id: string;
  readonly name: string;
  readonly kind: ItemKind;
  readonly subpath: string | null;
  readonly description: string;

  /** The section of the page the hit is in, when the match is there rather than on the page as a whole */
  readonly section?: { heading: string; slug: string };

  /** A few words around the match, from the section */
  readonly snippet?: string;
  readonly score: number;
}

interface Entry {
  readonly item: IndexItem;
  readonly section?: { heading: string; slug: string; body: string };

  /** How many times each word occurs, the words of a title counted several times over */
  readonly terms: ReadonlyMap<string, number>;
  readonly length: number;
}


/* --------
 * Constants Definition
 * -------- */

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'its',
  'of', 'on', 'or', 'the', 'to', 'use', 'what', 'when', 'with', 'without'
]);

const DEFAULT_LIMIT = 12;

/** BM25's two knobs, at their usual values: saturation of a repeated word, and the weight of a text's length */
const K1 = 1.2;

const B = 0.75;

/** A word in a title counts as this many words of the body */
const TITLE_WEIGHT = 3;

/**
 * The sections every component page closes with: reference, reached through get_item_props and
 * get_item_theming. Their tables name every slot and prop, so they match almost any query about the
 * component and would crowd out the section that explains it.
 */
const REFERENCE_SECTIONS = new Set([ 'api', 'customization', 'slots-and-data-attributes' ]);

const REFERENCE_WEIGHT = 0.6;

const MAX_LIMIT = 50;


/* --------
 * Helpers
 * -------- */

/** Lowercase words, split on anything that is not a letter or a digit, the stop words dropped */
export function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/** The words of a text counted, the title's weighted */
function termsOf(title: string, body: string): { terms: Map<string, number>; length: number } {
  const terms = new Map<string, number>();
  const add = (token: string, weight: number): void => {
    terms.set(token, (terms.get(token) ?? 0) + weight);
  };

  const titleTokens = tokenize(title);
  const bodyTokens = tokenize(body);
  titleTokens.forEach((token) => add(token, TITLE_WEIGHT));
  bodyTokens.forEach((token) => add(token, 1));

  return { terms, length: titleTokens.length * TITLE_WEIGHT + bodyTokens.length };
}

/** A name compared as a reader types it: `text-input`, `TextInput` and `text input` are one name */
export function compact(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function snippetOf(body: string, tokens: readonly string[]): string {
  const flat = body.replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = flat.toLowerCase();
  const at = tokens.map((token) => lower.indexOf(token)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, at - 80);

  return `${start > 0 ? '…' : ''}${flat.slice(start, start + 240).trim()}${start + 240 < flat.length ? '…' : ''}`;
}


/* --------
 * Search
 * -------- */

/**
 * Pages and their `##` sections scored together with BM25: each word of the query weighted by how
 * rare it is across the documentation, saturated when repeated, discounted in a long text, the words
 * of a title counting more; plus a bonus when the query names the component or the section. No
 * embeddings: the documentation is small and its vocabulary is precise.
 */
export class DocsSearch {

  // ----
  // Private properties
  // ----
  private readonly _entries: readonly Entry[];

  private readonly _idf: ReadonlyMap<string, number>;

  private readonly _average: number;


  // ----
  // Constructor
  // ----
  constructor(data: DocsData) {
    const entries: Entry[] = [];

    for (const item of data.index.items) {
      const doc = data.doc(item.id);
      const props = doc.props.flatMap((table) => table.props.map((prop) => prop.name)).join(' ');

      const title = `${item.name} ${item.name} ${item.description}`;
      entries.push({ item, ...termsOf(title, `${item.group} ${item.subpath ?? ''} ${props} ${doc.intro}`) });

      for (const section of doc.sections) {
        /* A section's code is the example of its prose: its words count, its identifiers mostly do not */
        entries.push({ item, section, ...termsOf(section.heading, section.body.replace(/```[\s\S]*?```/g, ' ')) });
      }
    }

    const counts = new Map<string, number>();
    entries.forEach((entry) => entry.terms.forEach((_count, token) => counts.set(token, (counts.get(token) ?? 0) + 1)));

    this._entries = entries;
    this._average = entries.reduce((sum, entry) => sum + entry.length, 0) / (entries.length || 1);
    this._idf = new Map([ ...counts ].map(([ token, count ]) => (
      [ token, Math.log(1 + (entries.length - count + 0.5) / (count + 0.5)) ]
    )));
  }


  // ----
  // Public methods
  // ----
  search(options: SearchOptions): SearchHit[] {
    const tokens = [ ...new Set(tokenize(options.query)) ];
    const name = compact(options.query);
    const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

    if (!tokens.length && !name) {
      return [];
    }

    /* The best a text could score on this query: every word present, saturated. Scores are a share of it */
    const ceiling = tokens.reduce((sum, token) => sum + (this._idf.get(token) ?? 0) * (K1 + 1), 0) || 1;

    const hits = this._entries
      .filter((entry) => !options.kind || entry.item.kind === options.kind)
      .map((entry) => {
        const norm = K1 * (1 - B + B * (entry.length / this._average));
        const covered = tokens.reduce((sum, token) => {
          const frequency = entry.terms.get(token) ?? 0;
          return sum + (frequency ? (this._idf.get(token) ?? 0) * ((frequency * (K1 + 1)) / (frequency + norm)) : 0);
        }, 0);
        const itemName = compact(entry.item.name);
        const heading = entry.section ? compact(entry.section.heading) : '';

        let bonus = 0;

        if (itemName === name) {
          bonus += entry.section ? 20 : 60;
        }
        else if (name.length > 2 && itemName.includes(name)) {
          bonus += entry.section ? 10 : 25;
        }

        if (heading && name.length > 2 && heading.includes(name)) {
          bonus += 30;
        }

        const weight = entry.section && REFERENCE_SECTIONS.has(entry.section.slug) ? REFERENCE_WEIGHT : 1;

        return { entry, score: ((covered / ceiling) * 100 + bonus) * weight };
      })
      .filter((hit) => hit.score > 5)
      .sort((a, b) => b.score - a.score);

    /* One hit per section, and a page's own hit only once */
    const seen = new Set<string>();
    const results: SearchHit[] = [];

    for (const { entry, score } of hits) {
      const key = `${entry.item.id}#${entry.section?.slug ?? ''}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      results.push({
        id         : entry.item.id,
        name       : entry.item.name,
        kind       : entry.item.kind,
        subpath    : entry.item.subpath,
        description: entry.item.description,
        section    : entry.section && { heading: entry.section.heading, slug: entry.section.slug },
        snippet    : entry.section && snippetOf(entry.section.body, tokens),
        score      : Math.round(score)
      });

      if (results.length >= limit) {
        break;
      }
    }

    return results;
  }

}
