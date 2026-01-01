'use client';

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import { DashboardContent } from 'src/layouts/dashboard';

export function OverviewMarkingView() {
  return (
    <>
      <DashboardContent maxWidth="xl">
        <Card>
          <CardHeader
            title="마킹패턴"
            sx={{
              mb: 0,
              '& .MuiCardHeader-content': { display: { xs: 'none', sm: 'block' } },
              '& .MuiCardHeader-action': { m: 0, width: { xs: '100%', sm: 'auto' } },
            }}
          />
        </Card>
      </DashboardContent>
    </>
  );
}
