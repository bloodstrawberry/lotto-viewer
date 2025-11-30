'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';


import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const allData = getAllLottoNumbers();
    // Sort by draw number ascending (oldest first)
    const sortedData = [...allData].sort((a, b) => a.drwNo - b.drwNo);
    setData(sortedData);
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader title="로또 번호 전체 회차 시각화" sx={{ mb: 2 }} />
        
        <Box sx={{ p: 2, overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {data.map((round) => (
              <div 
                key={round.drwNo} 
                style={{ 
                  display: 'flex', 
                  gap: '2px', 
                  alignItems: 'center',
                  height: '10px' // Force row height to match squares
                }}
                title={`${round.drwNo}회 (${round.drwNoDate})`}
              >
                <div style={{ 
                  width: '50px', 
                  fontSize: '9px', 
                  lineHeight: '10px',
                  textAlign: 'right', 
                  marginRight: '8px',
                  color: '#666'
                }}>
                  {round.drwNo}회
                </div>
                {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
                  const isWinning = round.numbers.includes(num);
                  return (
                    <div
                      key={num}
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: isWinning ? '#000' : 'transparent', // Black for filled, transparent for empty
                        border: '1px solid #e0e0e0', // Light gray border
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Box>
      </Card>
    </DashboardContent>
  );
}
