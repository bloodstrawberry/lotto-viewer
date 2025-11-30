'use client';

import Stack from '@mui/material/Stack';

import { HomeLottoDisplay } from '../home-lotto-display';

// ----------------------------------------------------------------------

export function HomeView() {
  return (
    <>
      <Stack sx={{ position: 'relative', bgcolor: 'background.default', gap: 3, alignItems: 'center', py: 5 }}>
        <HomeLottoDisplay />        
      </Stack>
    </>
  );
}
