'use client';

import { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';
import { LottoPaper } from 'src/components/lotto/lotto-paper';

import RoundSlider from '../round-slider';

// ----------------------------------------------------------------------

export function OverviewMarkingView() {
  const [data, setData] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | ''>('');

  useEffect(() => {
    const allData = getAllLottoNumbers();
    // Sort descending by round
    const sorted = [...allData].sort((a, b) => b.drwNo - a.drwNo);
    setData(sorted);
    if (sorted.length > 0) {
      setSelectedRound(sorted[0].drwNo);
    }
  }, []);

  const currentData = useMemo(() => {
    if (!selectedRound) return null;
    return data.find((d) => d.drwNo === selectedRound);
  }, [data, selectedRound]);

  const minRound = data.length > 0 ? data[data.length - 1].drwNo : 1;
  const maxRound = data.length > 0 ? data[0].drwNo : 1;

  return (
    <DashboardContent maxWidth="xl">
      <Card sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title="마킹패턴"
          subheader="회차를 선택하여 해당 회차의 번호를 확인하세요."
          sx={{ mb: 0 }}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.neutral',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            {currentData && (
              <LottoPaper
                headerText={`${currentData.drwNo}회`}
                selectedNumbers={currentData.numbers}
                readOnly
                color="#FF0000"
                showLines
              />
            )}
          </Box>

          {data.length > 0 && selectedRound !== '' && (
            <Box sx={{ width: '100%', maxWidth: 800, mt: 4 }}>
              <RoundSlider
                min={minRound}
                max={maxRound}
                value={Number(selectedRound)}
                onChange={(val) => setSelectedRound(val)}
              />
            </Box>
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
