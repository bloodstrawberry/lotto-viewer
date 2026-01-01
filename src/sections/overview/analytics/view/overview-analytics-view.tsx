'use client';

import { useState, useMemo } from 'react';

import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';

import { AnalyticsAppearance } from '../analytics-appearance';
import { AnalyticsCarryOver } from '../analytics-carry-over';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const allLotto = useMemo(() => getAllLottoNumbers(), []);
  const latestRound = allLotto.length > 0 ? allLotto[allLotto.length - 1].drwNo : 0;

  const [startRound, setStartRound] = useState(1);
  const [endRound, setEndRound] = useState(latestRound);
  const [includeBonus, setIncludeBonus] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const filteredRounds = useMemo(() => {
    return allLotto.filter((r) => r.drwNo >= startRound && r.drwNo <= endRound);
  }, [allLotto, startRound, endRound]);

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">통계분석</Typography>
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}>
        분석 범위: {startRound}회 ~ {endRound}회
      </Typography>

      <Card sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="시작 회차"
              type="number"
              size="small"
              value={startRound}
              onChange={(e) => setStartRound(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1, max: endRound }}
              sx={{ width: 110 }}
            />
            <Typography sx={{ color: 'text.disabled' }}>~</Typography>
            <TextField
              label="최신 회차"
              type="number"
              size="small"
              value={endRound}
              onChange={(e) => setEndRound(Math.min(latestRound, Number(e.target.value)))}
              inputProps={{ min: startRound, max: latestRound }}
              sx={{ width: 110 }}
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={includeBonus}
                onChange={(e) => setIncludeBonus(e.target.checked)}
                color="primary"
              />
            }
            label="보너스 번호 포함"
            sx={{ ml: { md: 2 } }}
          />
        </Stack>
      </Card>

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            fontSize: '1rem',
            fontWeight: 700,
            px: 3,
          },
        }}
      >
        <Tab label="출현 순위" />
        <Tab label="이월 순위" />
      </Tabs>

      {currentTab === 0 && (
        <AnalyticsAppearance rounds={filteredRounds} includeBonus={includeBonus} />
      )}

      {currentTab === 1 && (
        <AnalyticsCarryOver
          allLotto={allLotto}
          startRound={startRound}
          endRound={endRound}
          includeBonus={includeBonus}
        />
      )}
    </DashboardContent>
  );
}
