'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';


import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    const allData = getAllLottoNumbers();
    // Sort by draw number ascending (oldest first)
    const sortedData = [...allData].sort((a, b) => a.drwNo - b.drwNo);
    setData(sortedData);
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader 
          title="로또 번호 전체 회차 시각화" 
          sx={{ mb: 2 }}
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={showBonus}
                  onChange={(e) => setShowBonus(e.target.checked)}
                  color="primary"
                />
              }
              label="보너스 번호 보기"
            />
          }
        />
        
        <Box sx={{ p: 2, overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {data.map((round) => (
              <div 
                key={round.drwNo} 
                style={{ 
                  display: 'flex', 
                  gap: '3px', 
                  alignItems: 'center',
                  height: '12px' // Force row height to match squares
                }}
                title={`${round.drwNo}회 (${round.drwNoDate})`}
              >
                <div style={{ 
                  width: '50px', 
                  fontSize: '10px', 
                  lineHeight: '12px',
                  textAlign: 'right', 
                  marginRight: '8px',
                  color: '#999',
                  fontFamily: 'monospace'
                }}>
                  {round.drwNo}회
                </div>
                {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
                  const isWinning = round.numbers.includes(num);
                  const isBonus = showBonus && round.bonus === num;
                  const isActive = isWinning || isBonus;
                  
                  let bgColor = '#F1F3F4';
                  if (isWinning) bgColor = '#658effff';
                  if (isBonus) bgColor = '#FFB74D'; // Orange for bonus

                  return (
                    <div
                      key={num}
                      title={`${num}번`}
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: bgColor,
                        borderRadius: '3px', // Rounded corners
                        boxShadow: isActive 
                          ? 'inset 0 -2px 0 rgba(0,0,0,0.15)' // 3D effect for winning/bonus
                          : 'inset 0 -1px 0 rgba(0,0,0,0.05)', // Subtle depth for empty
                        boxSizing: 'border-box',
                        cursor: 'pointer',
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
