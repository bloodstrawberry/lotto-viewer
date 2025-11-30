'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { getAllLottoNumbers } from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [showBonus, setShowBonus] = useState(false);

  useEffect(() => {
    const allData = getAllLottoNumbers();
    // Sort by draw number ascending (oldest first)
    const sortedData = [...allData].sort((a, b) => b.drwNo - a.drwNo);
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
        
        <Box sx={{ p: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {data.slice(0, visibleCount).map((round) => (
              <div 
                key={round.drwNo} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                }}
                title={`${round.drwNo}회 (${round.drwNoDate})`}
              >
                <div style={{ 
                  width: '40px', 
                  flexShrink: 0,
                  fontSize: '10px', 
                  lineHeight: 1,
                  textAlign: 'right', 
                  marginRight: '6px',
                  color: '#999',
                  fontFamily: 'monospace'
                }}>
                  {round.drwNo}회
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '1px' }}>
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
                          flex: 1,
                          aspectRatio: '1/1',
                          backgroundColor: bgColor,
                          borderRadius: '20%', // Responsive rounded corners
                          boxShadow: isActive 
                            ? 'inset 0 -2px 0 rgba(0,0,0,0.15)' 
                            : 'inset 0 -1px 0 rgba(0,0,0,0.05)',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          minWidth: 0, // Allow shrinking
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {visibleCount < data.length && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
              <Button 
                variant="soft" 
                color="inherit"
                onClick={() => setVisibleCount((prev) => prev + 50)}
                sx={{ minWidth: 200 }}
              >
                ↓
              </Button>
            </Box>
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
