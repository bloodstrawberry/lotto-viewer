'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import { DashboardContent } from "src/layouts/dashboard";

// ----------------------------------------------------------------------

export function OverviewHistoryView() {

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="과거분석"
          sx={{
            mb: 0,
            '& .MuiCardHeader-content': { display: { xs: 'none', sm: 'block' } },
            '& .MuiCardHeader-action': { m: 0, width: { xs: '100%', sm: 'auto' } },
          }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>

            </Box>
          }
        />

      </Card>
    </DashboardContent>
  );
}
