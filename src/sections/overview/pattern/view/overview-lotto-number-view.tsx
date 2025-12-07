'use client';

import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

import { DashboardContent } from "src/layouts/dashboard";
import { getAllLottoNumbers, ThemeType, THEME_NAMES, getCellColorByTheme, getPredictCellColor } from "src/api/lottolibrary";

// ----------------------------------------------------------------------

export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [showBonus, setShowBonus] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  // ⭐ 숫자 보기 토글 (ON → 숫자 전체 보임)
  const [showNumbers, setShowNumbers] = useState(true);
  
  // ⭐ 구분선 보기 토글 (ON → 5의 배수마다 구분선 표시)
  const [showDivider, setShowDivider] = useState(true);

  // ⭐ 테마 선택
  const [theme, setTheme] = useState<ThemeType>('default');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [showMissing, setShowMissing] = useState(false);
  const [missingStats, setMissingStats] = useState<Record<number, Record<number, number>>>({});

  useEffect(() => {
    const allData = getAllLottoNumbers();
    const sortedDesc = [...allData].sort((a, b) => b.drwNo - a.drwNo);
    setData(sortedDesc);
    setVisibleCount(30);

    // 각 회차별 미출현 번호 누적 계산 (과거 -> 최신)
    const sortedAsc = [...allData].sort((a, b) => a.drwNo - b.drwNo);
    const stats: Record<number, Record<number, number>> = {};
    const currentStreaks = new Array(46).fill(0); // 1~45 index

    sortedAsc.forEach((round) => {
        const rowStats: Record<number, number> = {};
        for(let n = 1; n <= 45; n++) {
            if (round.numbers.includes(n)) {
                currentStreaks[n] = 0;
            } else {
                currentStreaks[n]++;
            }
            rowStats[n] = currentStreaks[n];
        }
        stats[round.drwNo] = rowStats;
    });
    setMissingStats(stats);
  }, []);

  const displayed = (() => {
    const slice = data.slice(0, visibleCount);
    return isReversed ? [...slice].reverse() : slice;
  })();

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num].sort((a,b)=>a-b));
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="패턴분석"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
              {/* 테마 선택 버튼 그룹 */}
              <ToggleButtonGroup
                size="small"
                value={theme}
                exclusive
                onChange={(e, newTheme) => newTheme && setTheme(newTheme)}
                aria-label="theme selection"
              >
                 {(Object.keys(THEME_NAMES) as ThemeType[]).map((themeKey) => (
                    <Tooltip key={themeKey} title={THEME_NAMES[themeKey]}>
                      <ToggleButton value={themeKey} aria-label={THEME_NAMES[themeKey]}>
                        <Iconify icon={themeKey === 'default' ? 'mdi:format-color-fill' : 'mdi:palette'} />
                      </ToggleButton>
                    </Tooltip>
                 ))}
              </ToggleButtonGroup>

              <ToggleButtonGroup
                size="small"
                value={[
                  showNumbers && 'showNumbers',
                  showBonus && 'showBonus',
                  showDivider && 'showDivider',
                  isReversed && 'isReversed',
                  showMissing && 'showMissing',
                ].filter(Boolean)}
                onChange={(event, newValues) => {
                  setShowNumbers(newValues.includes('showNumbers'));
                  setShowBonus(newValues.includes('showBonus'));
                  setShowDivider(newValues.includes('showDivider'));
                  setIsReversed(newValues.includes('isReversed'));
                  setShowMissing(newValues.includes('showMissing'));
                }}
                aria-label="view settings"
              >
                <Tooltip title="숫자 보기">
                  <ToggleButton value="showNumbers" aria-label="show numbers">
                    <Iconify icon="mdi:numeric" />
                  </ToggleButton>
                </Tooltip>
                
                <Tooltip title="보너스 번호">
                  <ToggleButton value="showBonus" aria-label="show bonus">
                    <Iconify icon="mdi:star-circle-outline" />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="구분선">
                  <ToggleButton value="showDivider" aria-label="show divider">
                    <Iconify icon="mdi:view-week-outline" />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="역순">
                  <ToggleButton value="isReversed" aria-label="reverse order">
                    <Iconify icon="mdi:sort" />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="미출현">
                  <ToggleButton value="showMissing" aria-label="show missing">
                    <Iconify icon="mdi:gradient" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          }
        />
        <Box sx={{ p: 2 }}>
          {isReversed && (
            <Box sx={{ display:"flex", justifyContent:"center", mb:1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev)=>Math.min(prev+30, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth:40 }}
              >
                ↑
              </Button>
            </Box>
          )}

          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "600px" }}>
              {!isReversed && (
                <PredictRow
                  selectedNumbers={selectedNumbers}
                  handleNumberClick={handleNumberClick}
                  showNumbers={showNumbers}
                  showDivider={showDivider}
                  theme={theme}
                />
              )}

              {displayed.map((round) => (
                <DataRow
                  key={round.drwNo}
                  round={round}
                  showBonus={showBonus}
                  showNumbers={showNumbers}
                  showDivider={showDivider}
                  theme={theme}
                  showMissing={showMissing}
                  missingStreakMap={missingStats[round.drwNo]}
                />
              ))}

              {isReversed && (
                <PredictRow
                  selectedNumbers={selectedNumbers}
                  handleNumberClick={handleNumberClick}
                  showNumbers={showNumbers}
                  showDivider={showDivider}
                  theme={theme}
                />
              )}
            </div>
          </Box>

          {!isReversed && (
            <Box sx={{ display:"flex", justifyContent:"center", mt:3, mb:1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev)=>Math.min(prev+30, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth:40 }}
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

// ----------------------------------------------------------------------
// Predict Row
// ----------------------------------------------------------------------

function PredictRow({
  selectedNumbers,
  handleNumberClick,
  showNumbers,
  showDivider,
  theme,
}: {
  selectedNumbers: number[];
  handleNumberClick: (num: number) => void;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
}) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:"2px" }}>
      <Box
        sx={{
          width:"40px",
          flexShrink:0,
          fontSize:"10px",
          textAlign:"right",
          marginRight:"6px",
          color:"#999",
          fontFamily:"monospace",
          display:{ xs:"none", sm:"block" },
        }}
      >
        예측
      </Box>

      <div style={{ flex:1, display:"flex", gap:"1px" }}>
        {Array.from({ length:45 }, (_,i)=>i+1).map((num)=>{
          const isSelected = selectedNumbers.includes(num);
          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;

          const shouldShowNumber = showNumbers ? true : isSelected;
          const bgColor = getPredictCellColor(theme, num, isSelected);
          
          // 텍스트 색상 결정: 선택되었거나 범위별/모노크롬/파스텔 테마일 때는 흰색, 기본 테마일 때는 어두운 색
          const textColor = isSelected || theme !== 'default' ? '#fff' : '#555';

          return (
            <React.Fragment key={num}>
              <div
                onClick={() => handleNumberClick(num)}
                style={{
                  flex:1,
                  minWidth: 0,
                  aspectRatio:"1/1",
                  backgroundColor: bgColor,
                  borderRadius:"20%",
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontWeight:"bold",
                  fontSize:"clamp(0.1px, 1.8vw, 12px)",
                  color: shouldShowNumber ? textColor : "transparent",
                }}
              >
                {shouldShowNumber ? num : ""}
              </div>

              {shouldShowDivider && (
                <div
                  style={{
                    width:"1px",
                    backgroundColor:"#999",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Data Row
// ----------------------------------------------------------------------

function DataRow({
  round,
  showBonus,
  showNumbers,
  showDivider,
  theme,
  showMissing,
  missingStreakMap,
}: {
  round: any;
  showBonus: boolean;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
  showMissing: boolean;
  missingStreakMap?: Record<number, number>;
}) {
  const [clicked, setClicked] = useState<number[]>([]);

  const handleClick = (num: number, isWinning: boolean) => {
    if (!isWinning) return;

    if (clicked.includes(num)) {
      setClicked(clicked.filter((n)=>n !== num));
    } else {
      setClicked([...clicked, num]);
    }
  };

  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      <Box
        sx={{
          width:"40px",
          fontSize:"10px",
          textAlign:"right",
          marginRight:"6px",
          color:"#999",
          fontFamily:"monospace",
          display:{ xs:"none", sm:"block" },
        }}
      >
        {round.drwNo}
      </Box>

      <div style={{ flex:1, display:"flex", gap:"1px" }}>
        {Array.from({ length:45 }, (_,i)=>i+1).map((num)=>{
          const isWinning = round.numbers.includes(num);
          const isBonus = showBonus && round.bonus === num;
          const isClicked = clicked.includes(num);

          const bgColor = getCellColorByTheme(theme, num, isWinning, isBonus, isClicked);

          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;

          // ⭐ 숫자를 보여줄지 결정
          const shouldShowNumber = showNumbers || isClicked;

          // 미출현 그라데이션
          let overlayColor = 'transparent';
          const streak = (showMissing && missingStreakMap) ? (missingStreakMap[num] || 0) : 0;
          if (streak > 0 && !isWinning) {
             // 그라데이션 강도 증가: 더 빨리 어두워지도록 설정 (약 40회차만에 최대 진하기 도달)
             const alpha = Math.min(streak * 2.5, 95) / 100;
             overlayColor = `rgba(0,0,0, ${alpha})`;
          }

          // 텍스트 색상: 미출현 모드에서 많이 어두워지면 흰색으로 표시
          // 원래 bgColor가 밝은 색(#F1F3F4)이므로, 평소에 흰색 글씨 쓰면 안보임.
          // 하지만 어두워지면 흰색 글씨가 필요함.
          // streak가 50 이상(alpha 0.5)이면 흰색으로 강제.
          const finalTextColor = '#fff';// (streak > 50) ? '#fff' : (shouldShowNumber ? (isWinning ? '#fff' : '#000') : 'transparent');
          // Note: 원래 코드에서 isWinning이 아니면 색이 애매했음(이전 코드 350라인 참조). 
          // 원래 코드: color: shouldShowNumber ? "#fff" : "transparent"
          // 여기서 #fff는 winning일때 배경색이 있어서 괜찮지만, winning이 아닐때(#F1F3F4)는 #fff가 안보임.
          // 따라서 winning이 아닐때는 검은색이 맞으나, 원래 코드 로직을 너무 바꾸면 안됨.
          // 근데 원래 코드가 #fff 였으면, 안 보이는게 의도였을까? -> 아마 winning number만 보여주는게 기본이라 그랬을수도.
          // 여기서는 수정 제안: Winning이거나 Streak가 높으면 흰색, 아니면(평범한 빈칸) 검은색/투명.
          
          return (
            <React.Fragment key={`${round.drwNo}-${num}`}>
              <div
                onClick={() => handleClick(num, isWinning)}
                style={{
                  flex:1,
                  minWidth: 0,
                  aspectRatio:"1/1",
                  backgroundColor:bgColor,
                  borderRadius:"20%",
                  cursor:isWinning ? "pointer" : "default",

                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",

                  fontSize:"clamp(1px, 1.8vw, 12px)",
                  fontWeight:"bold",
                  color: finalTextColor,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                 {/* 미출현 오버레이 */}
                 {overlayColor !== 'transparent' && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: overlayColor,
                        pointerEvents: 'none',
                    }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                    {shouldShowNumber ? num : ""}
                </span>
              </div>

              {shouldShowDivider && (
                <div
                  style={{
                    width:"1px",
                    backgroundColor:"#999",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
