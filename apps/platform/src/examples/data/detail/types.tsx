import * as React from 'react';

import { Detail, DETAIL_SPAN } from '@proedis/ui/data/detail';

import type { DetailValueType } from '@proedis/ui/data/detail';
import { detailLabels } from '../labels';


/** A value of each kind: the kind gives the columns, out of six */
const SAMPLES: readonly [ DetailValueType, React.ReactNode ][] = [
  [ 'text-short', 'B2' ],
  [ 'text-code', 'RD-24017' ],
  [ 'text', 'Borgo Po' ],
  [ 'text-long', 'Via Monferrato 14, 10131 Torino' ],
  [ 'date', '16/11/2026' ],
  [ 'number', '38' ],
  [ 'boolean', false ],
  [ 'choice', 'Weekly' ],
  [ 'person', 'Rossi Anna' ],
  [ 'record', 'Contract CT-2291' ],
  [ 'list', 'Paper, glass, plastic' ],
  [ 'paragraph', 'Bins behind the gate on the left. The porter opens from 6:30; ring twice and wait, the gate is slow.' ]
];


export default function Example(): React.ReactNode {
  return (
    <Detail labels={detailLabels} className={'w-full'}>
      <Detail.Section>
        <Detail.Grid>
          {SAMPLES.map(([ type, value ]) => (
            <Detail.Item key={type} label={`${type} · ${DETAIL_SPAN[type]}`} type={type}>{value}</Detail.Item>
          ))}
        </Detail.Grid>
      </Detail.Section>
    </Detail>
  );
}
