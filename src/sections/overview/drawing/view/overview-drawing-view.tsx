'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { _drawings, _drawingNew, _drawingReview, _drawingsOverview } from 'src/_mock';

// ----------------------------------------------------------------------

export function OverviewDrawingView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        번호생성
      </Typography>

    </DashboardContent>
  );
}
