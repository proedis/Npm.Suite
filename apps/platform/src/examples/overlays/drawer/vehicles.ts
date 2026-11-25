/** The vehicles the Drawer examples list: a shared fixture, not part of any example's API */
export interface Vehicle {
  readonly plate: string;
  readonly model: string;
  readonly depot: string;
  readonly driver: string;
  readonly status: string;
}

export const VEHICLES: readonly Vehicle[] = [
  { plate: 'FT-234-KL', model: 'Iveco Eurocargo 120E', depot: 'North depot, Chieri', driver: 'Luca Ferrero', status: 'On route' },
  { plate: 'GA-118-PR', model: 'Mercedes Econic 1830', depot: 'North depot, Chieri', driver: 'Giulia Bianco', status: 'In the depot' },
  { plate: 'EZ-902-MT', model: 'Volvo FE Electric', depot: 'South depot, Moncalieri', driver: 'Marco Rosso', status: 'Charging' },
  { plate: 'FB-457-CC', model: 'Iveco Daily 35S', depot: 'South depot, Moncalieri', driver: 'Elena Gallo', status: 'On route' },
  { plate: 'DX-031-SA', model: 'Renault D Wide', depot: 'North depot, Chieri', driver: 'Paolo Conti', status: 'In the workshop' }
];
