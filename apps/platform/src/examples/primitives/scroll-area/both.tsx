import * as React from 'react';

import { ScrollArea } from '@proedis/ui/primitives';


const MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const DISTRICTS = [ 'North', 'South', 'East', 'West', 'Centre', 'Hills', 'Industrial area', 'Riverside' ];


export default function Example(): React.ReactNode {
  return (
    <ScrollArea
      orientation={'both'}
      maxHeight={200}
      tabIndex={0}
      role={'region'}
      aria-label={'Tonnes collected per district and month'}
      className={'w-full max-w-md rounded-xl border border-border'}
    >
      <table className={'text-sm whitespace-nowrap'}>
        <thead>
          <tr>
            <th className={'sticky left-0 bg-card px-3 py-2 text-start'}>District</th>
            {MONTHS.map((month) => <th key={month} className={'px-3 py-2 text-end font-medium'}>{month}</th>)}
          </tr>
        </thead>
        <tbody>
          {DISTRICTS.map((district, row) => (
            <tr key={district} className={'border-t border-border'}>
              <th className={'sticky left-0 bg-card px-3 py-2 text-start font-medium'}>{district}</th>
              {MONTHS.map((month, column) => (
                <td key={month} className={'px-3 py-2 text-end tabular-nums text-muted-foreground'}>{(row + 3) * 11 + column * 4}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
