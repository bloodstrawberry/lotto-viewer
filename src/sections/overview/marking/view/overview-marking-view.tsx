'use client';

import { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';
import { Iconify } from 'src/components/iconify';
import { LottoPaper } from 'src/components/lotto/lotto-paper';

import RoundSlider from '../round-slider';

// ----------------------------------------------------------------------

export function OverviewMarkingView() {
  const [data, setData] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<number | ''>('');
  const [showGrid, setShowGrid] = useState(false);

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

  const gridData = useMemo(() => {
    if (!selectedRound || data.length === 0) return [];
    const index = data.findIndex((d) => d.drwNo === selectedRound);
    if (index === -1) return [];
    return data.slice(index, index + 10);
  }, [data, selectedRound]);

  const minRound = data.length > 0 ? data[data.length - 1].drwNo : 1;
  const maxRound = data.length > 0 ? data[0].drwNo : 1;

  return (
    <DashboardContent maxWidth="xl">
      <Card sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title="마킹패턴"
          action={
            <Tooltip title={showGrid ? '단일 보기' : '10개 모아보기'}>
              <IconButton onClick={() => setShowGrid(!showGrid)}>
                <Iconify icon={showGrid ? 'solar:list-bold' : 'solar:widget-5-bold'} />
              </IconButton>
            </Tooltip>
          }
          sx={{ mb: 0 }}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.5,
            bgcolor: 'background.neutral',
            overflow: 'hidden',
          }}
        >
          {showGrid ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(5, 1fr)',
                },
                gap: 1,
                p: 0,
                transform: { md: 'scale(0.75)', lg: 'scale(0.85)' },
                transformOrigin: 'center center',
              }}
            >
              {gridData.map((d) => (
                <LottoPaper
                  key={d.drwNo}
                  headerText={`${d.drwNo}회`}
                  selectedNumbers={d.numbers}
                  readOnly
                  color="#FF0000"
                  showLines
                />
              ))}
            </Box>
          ) : (
            currentData && (
              <LottoPaper
                headerText={`${currentData.drwNo}회`}
                selectedNumbers={currentData.numbers}
                readOnly
                color="#FF0000"
                showLines
              />
            )
          )}
        </Box>

        {data.length > 0 && selectedRound !== '' && (
          <Box
            sx={{
              px: { xs: 1.5, md: 5 },
              py: 0.5,
              bgcolor: 'background.neutral',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <RoundSlider
                min={minRound}
                max={maxRound}
                value={Number(selectedRound)}
                onChange={(val) => setSelectedRound(val)}
              />
            </Box>
          </Box>
        )}
      </Card>
    </DashboardContent>
  );
}
