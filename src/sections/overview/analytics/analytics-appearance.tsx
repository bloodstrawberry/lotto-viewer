'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TableSortLabel from '@mui/material/TableSortLabel';

import { getBallColor } from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

type Props = {
  rounds: any[];
  includeBonus: boolean;
};

type Order = 'asc' | 'desc';

export function AnalyticsAppearance({ rounds, includeBonus }: Props) {
  const [orderBy, setOrderBy] = useState<string>('count');
  const [order, setOrder] = useState<Order>('desc');

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const appearanceStats = useMemo(() => {
    const stats = Array.from({ length: 45 }, (_, i) => ({
      number: i + 1,
      count: 0,
      probability: 0,
    }));

    rounds.forEach((r) => {
      r.numbers.forEach((n: number) => {
        if (n >= 1 && n <= 45) stats[n - 1].count += 1;
      });
      if (includeBonus) {
        if (r.bonus >= 1 && r.bonus <= 45) stats[r.bonus - 1].count += 1;
      }
    });

    const totalRounds = rounds.length;
    stats.forEach((s) => {
      s.probability = totalRounds > 0 ? (s.count / totalRounds) * 100 : 0;
    });

    return stats;
  }, [rounds, includeBonus]);

  const sortedData = useMemo(() => {
    return [...appearanceStats].sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a];
      const bValue = b[orderBy as keyof typeof b];
      if (order === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }, [appearanceStats, orderBy, order]);

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                <TableSortLabel
                  active={orderBy === 'number'}
                  direction={orderBy === 'number' ? order : 'asc'}
                  onClick={() => handleRequestSort('number')}
                >
                  번호
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                <TableSortLabel
                  active={orderBy === 'count'}
                  direction={orderBy === 'count' ? order : 'asc'}
                  onClick={() => handleRequestSort('count')}
                >
                  출현 빈도수
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                <TableSortLabel
                  active={orderBy === 'probability'}
                  direction={orderBy === 'probability' ? order : 'asc'}
                  onClick={() => handleRequestSort('probability')}
                >
                  출현 확률
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow key={row.number} hover>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: getBallColor(row.number),
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        boxShadow: (theme) => `inset 0 0 8px rgba(255,255,255,0.3), ${theme.shadows[2]}`,
                      }}
                    >
                      {row.number}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.number}번
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {row.count}회
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.probability.toFixed(2)}%
                    </Typography>
                    <Box
                      sx={{
                        height: 6,
                        width: 60,
                        bgcolor: 'divider',
                        borderRadius: 3,
                        overflow: 'hidden',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${Math.min(row.probability * 2, 100)}%`,
                          bgcolor: 'primary.main',
                          opacity: 0.6,
                        }}
                      />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
