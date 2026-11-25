import type { TableSort } from '@proedis/ui/data/table';
import type { AvatarGroupItem, AvatarIdentity } from '@proedis/ui/display/person';


/*
 * The data of the Data examples: collection rounds, the people who drive them, the customers of the
 * service. Generated once, from a fixed seed, so every visit shows the same rows and a screenshot of
 * a page is comparable with the next one. Nothing here is random at render.
 */


/* --------
 * Types Definition
 * -------- */

export type RoundStatus = 'planned' | 'running' | 'completed' | 'late' | 'cancelled';

export interface Person {
  readonly id: string;
  readonly name: string;
  readonly avatar: AvatarIdentity;
}

export interface Round {
  readonly id: string;

  /** The code of the round, what an operator reads on the phone: `RD-24017` */
  readonly code: string;

  readonly district: string;
  readonly driver: Person;
  readonly crew: readonly AvatarGroupItem[];
  readonly vehicle: string;
  readonly status: RoundStatus;

  /** The day it is planned for, `2026-11-16` */
  readonly scheduledAt: string;

  /** When it left the depot, an ISO date and time, `null` while it has not */
  readonly startedAt: string | null;

  readonly stops: number;
  readonly weightKg: number;
  readonly distanceKm: number;

  /** How full the vehicle came back, 0 to 1 */
  readonly fillRate: number;

  readonly durationMin: number;
  readonly costEur: number;
  readonly electric: boolean;
  readonly notes: string | null;
}

export type ContractType = 'domestic' | 'business' | 'public';

export interface Customer {
  readonly id: string;

  /** `CL-004813` */
  readonly code: string;

  readonly name: string;
  readonly town: string;
  readonly contract: ContractType;
  readonly bins: number;
  readonly since: string;
  readonly active: boolean;

  /** A customer with unpaid invoices cannot be given a new contract */
  readonly blocked: boolean;
}


/* --------
 * Seeded generator
 * -------- */

/** A small linear congruential generator: the same sequence on every load */
function generator(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function pick<T>(next: () => number, items: readonly T[]): T {
  return items[Math.floor(next() * items.length)] as T;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}


/* --------
 * Vocabularies
 * -------- */

const GIVEN = [ 'Anna', 'Marco', 'Laura', 'Paolo', 'Giulia', 'Luca', 'Sara', 'Andrea', 'Elena', 'Davide', 'Chiara', 'Matteo' ];

const SURNAMES = [ 'Rossi', 'Bianchi', 'Ferrari', 'Esposito', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti' ];

export const DISTRICTS = [
  'Centro storico', 'Borgo Po', 'Madonna del Pilone', 'San Salvario', 'Crocetta', 'Santa Rita',
  'Mirafiori Nord', 'Lingotto', 'Barriera di Milano', 'Vanchiglia', 'Aurora', 'Pozzo Strada'
] as const;

const TOWNS = [ 'Chieri', 'Moncalieri', 'Pino Torinese', 'Pecetto', 'Cambiano', 'Santena', 'Poirino', 'Riva presso Chieri' ];

const BUSINESS = [ 'Panificio', 'Ristorante', 'Officina', 'Farmacia', 'Hotel', 'Studio dentistico', 'Supermercato', 'Bar', 'Scuola', 'Palestra' ];

const STATUSES: readonly RoundStatus[] = [ 'planned', 'planned', 'running', 'completed', 'completed', 'completed', 'late', 'cancelled' ];

const NOTES = [ null, null, null, 'Access through the courtyard', 'Bins behind the gate, ask the porter', null, 'Narrow street: small vehicle only' ];


/* --------
 * Data
 * -------- */

const nextPerson = generator(7);

/** Twelve people, each with the two letters the avatar shows */
export const PEOPLE: readonly Person[] = Array.from({ length: 12 }, (_, index) => {
  const given = GIVEN[index] as string;
  const surname = pick(nextPerson, SURNAMES);
  const name = `${surname} ${given}`;

  return {
    id    : `person-${index + 1}`,
    name,
    avatar: { kind: 'person', name, initials: `${surname[0]}${given[0]}` }
  };
});

const nextRound = generator(42);

/** Today of the examples, fixed: the data do not age between two visits */
export const TODAY = new Date('2026-11-16T07:00:00Z');

/** Three hundred and twelve rounds over three months */
export const ROUNDS: readonly Round[] = Array.from({ length: 312 }, (_, index) => {
  const driver = pick(nextRound, PEOPLE);
  const status = pick(nextRound, STATUSES);
  const day = new Date(TODAY.getTime() + Math.round((nextRound() - 0.7) * 90) * 86400000);
  const stops = 20 + Math.floor(nextRound() * 60);
  const crewSize = Math.floor(nextRound() * 3);

  const crew = Array.from({ length: crewSize }, () => pick(nextRound, PEOPLE))
    .filter((person, position, all) => person.id !== driver.id && all.findIndex((other) => other.id === person.id) === position)
    .map((person) => ({ id: person.id, avatar: person.avatar, name: person.name, description: 'Operator' }));

  const started = status === 'planned' || status === 'cancelled'
    ? null
    : new Date(day.getTime() + (5 + Math.floor(nextRound() * 3)) * 3600000).toISOString();

  return {
    id         : `round-${index + 1}`,
    code       : `RD-${24001 + index}`,
    district   : pick(nextRound, DISTRICTS),
    driver,
    crew,
    vehicle    : `F${String.fromCharCode(65 + Math.floor(nextRound() * 26))}-${100 + Math.floor(nextRound() * 900)}-${String.fromCharCode(65 + Math.floor(nextRound() * 26))}${String.fromCharCode(65 + Math.floor(nextRound() * 26))}`,
    status,
    scheduledAt: isoDay(day),
    startedAt  : started,
    stops,
    weightKg   : stops * (90 + Math.floor(nextRound() * 80)),
    distanceKm : Math.round((18 + nextRound() * 60) * 10) / 10,
    fillRate   : Math.round((0.45 + nextRound() * 0.55) * 100) / 100,
    durationMin: 150 + Math.floor(nextRound() * 240),
    costEur    : Math.round((260 + nextRound() * 540) * 100) / 100,
    electric   : nextRound() > 0.7,
    notes      : pick(nextRound, NOTES)
  };
});

const nextCustomer = generator(1981);

/** Two hundred customers of the service */
export const CUSTOMERS: readonly Customer[] = Array.from({ length: 200 }, (_, index) => {
  const contract = pick(nextCustomer, [ 'domestic', 'domestic', 'business', 'business', 'public' ] as const);
  const surname = pick(nextCustomer, SURNAMES);
  const given = pick(nextCustomer, GIVEN);

  const name = contract === 'domestic'
    ? `${surname} ${given}`
    : `${pick(nextCustomer, BUSINESS)} ${surname}`;

  return {
    id      : `customer-${index + 1}`,
    code    : `CL-${String(4800 + index * 7).padStart(6, '0')}`,
    name,
    town    : pick(nextCustomer, TOWNS),
    contract,
    bins    : 1 + Math.floor(nextCustomer() * (contract === 'domestic' ? 3 : 12)),
    since   : isoDay(new Date(Date.UTC(
      2012 + Math.floor(nextCustomer() * 14),
      Math.floor(nextCustomer() * 12),
      1 + Math.floor(nextCustomer() * 27)
    ))),
    active  : nextCustomer() > 0.12,
    blocked : nextCustomer() > 0.92
  };
});


/* --------
 * Simulated server
 * -------- */

export interface RoundsQuery {
  readonly sorting: readonly { field: string; desc: boolean }[];
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly search?: string;
  readonly status?: readonly string[];
  readonly district?: string | null;
  readonly driver?: readonly string[];
  readonly scheduled?: { from: string | null; to: string | null };
}

export interface Page<T> {
  readonly rows: T[];
  readonly total: number;
}

/** How long the simulated server takes to answer */
export const LATENCY = 450;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** The value a round sorts by, for a field the server knows */
function sortField(round: Round, field: string): string | number {
  switch (field) {
    case 'driver':
      return round.driver.name;

    case 'startedAt':
      return round.startedAt ?? '';

    default: {
      const value = (round as unknown as Record<string, unknown>)[field];
      return typeof value === 'number' ? value : String(value ?? '');
    }
  }
}

/**
 * What a list endpoint does: filter, sort by the fields asked and then by id, so a row never shows on
 * two pages, and cut the page. Answers after `LATENCY`.
 */
export async function fetchRounds(query: RoundsQuery): Promise<Page<Round>> {
  await wait(LATENCY);

  const term = query.search?.trim().toLowerCase() ?? '';

  const filtered = ROUNDS.filter((round) => (
    (!term || [ round.code, round.district, round.vehicle ].some((text) => text.toLowerCase().includes(term)))
    && (!query.status?.length || query.status.includes(round.status))
    && (!query.district || round.district === query.district)
    && (!query.driver?.length || query.driver.includes(round.driver.id))
    && (!query.scheduled?.from || round.scheduledAt >= query.scheduled.from)
    && (!query.scheduled?.to || round.scheduledAt <= query.scheduled.to)
  ));

  const sorted = [ ...filtered ].sort((a, b) => {
    for (const { desc, field } of query.sorting) {
      const left = sortField(a, field);
      const right = sortField(b, field);

      if (left !== right) {
        return (left < right ? -1 : 1) * (desc ? -1 : 1);
      }
    }

    return a.id.localeCompare(b.id, 'en', { numeric: true });
  });

  const start = query.pageIndex * query.pageSize;

  return { rows: sorted.slice(start, start + query.pageSize), total: sorted.length };
}

/** The customers whose name or code holds the text, the first `limit`, and how many in all */
export async function searchCustomers(
  text: string,
  options: { contract?: string | null; limit: number }
): Promise<Page<Customer>> {
  await wait(LATENCY);

  const term = text.trim().toLowerCase();

  const found = CUSTOMERS.filter((customer) => (
    (!term || customer.name.toLowerCase().includes(term) || customer.code.toLowerCase().includes(term))
    && (!options.contract || customer.contract === options.contract)
  ));

  /* The exact code first, as a server ranks by relevance */
  const ranked = [ ...found ].sort((a, b) => Number(b.code.toLowerCase() === term) - Number(a.code.toLowerCase() === term));

  return { rows: ranked.slice(0, options.limit + 1), total: found.length };
}

/** The default order of the rounds: the most recent first */
export const ROUNDS_SORTING: readonly TableSort[] = [ { id: 'scheduledAt', desc: true } ];
