import * as React from 'react';

import { Monitor, Moon, Sun } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';

import { useTheme } from './theme';

import type { ThemeChoice } from './theme';


/* --------
 * Constants Definition
 * -------- */

const ICONS: Readonly<Record<ThemeChoice, React.ReactNode>> = {
  light : <Sun />,
  dark  : <Moon />,
  system: <Monitor />
};


/* --------
 * Component Definition
 * -------- */

/** Light, dark, or whatever the system says */
export function ThemeMenu(): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const [ theme, setTheme ] = useTheme();


  // ----
  // Handlers
  // ----
  const handleChange = React.useCallback((value: string) => {
    setTheme(value as ThemeChoice);
  }, [ setTheme ]);


  // ----
  // Component Render
  // ----
  return (
    <Menu
      aria-label={'Theme'}
      trigger={<IconButton label={'Theme'} icon={ICONS[theme]} tooltipSide={'bottom'} />}
    >
      <Menu.RadioGroup value={theme} onValueChange={handleChange}>
        <Menu.RadioItem value={'light'}>Light</Menu.RadioItem>
        <Menu.RadioItem value={'dark'}>Dark</Menu.RadioItem>
        <Menu.RadioItem value={'system'}>System</Menu.RadioItem>
      </Menu.RadioGroup>
    </Menu>
  );

}

ThemeMenu.displayName = 'ThemeMenu';
