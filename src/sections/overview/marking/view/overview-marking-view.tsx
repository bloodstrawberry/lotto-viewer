'use client';

import { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';
import { LottoPaper } from 'src/components/lotto/lotto-paper';

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

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedRound(Number(event.target.value));
  };

  const currentData = useMemo(() => {
    if (!selectedRound) return null;
    return data.find((d) => d.drwNo === selectedRound);
  }, [data, selectedRound]);

  return (
    <DashboardContent maxWidth="xl">
      <Card sx={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title="마킹패턴"
          action={
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="round-select-label">회차 선택</InputLabel>
              <Select
                labelId="round-select-label"
                value={selectedRound}
                label="회차 선택"
                onChange={handleChange}
                MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
              >
                {data.map((row) => (
                  <MenuItem key={row.drwNo} value={row.drwNo}>
                    {row.drwNo}회
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
          sx={{
            mb: 0,
            '& .MuiCardHeader-content': { display: { xs: 'none', sm: 'block' } },
            '& .MuiCardHeader-action': { m: 0, width: { xs: '100%', sm: 'auto' } },
          }}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: 'background.neutral',
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
      </Card>
    </DashboardContent>
  );
}
