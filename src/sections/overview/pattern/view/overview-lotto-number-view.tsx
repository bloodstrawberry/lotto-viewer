'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";

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

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

type LottoCellProps = {
  num: number;
  bgColor: string;
  textColor: string;
  overlayColor?: string;
  content: string | number;
  showDivider: boolean;
  onClick?: () => void;
  cursor?: string;
  consecutiveColors?: string[];
};

const LottoCell = memo(({ 
  num, 
  bgColor, 
  textColor, 
  overlayColor, 
  content, 
  showDivider, 
  onClick, 
  cursor = "default",
  ...restProps 
}: LottoCellProps) => (
  <React.Fragment key={num}>
    <div
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        aspectRatio: "1/1",
        backgroundColor: bgColor,
        borderRadius: "20%",
        cursor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "clamp(0.1px, 1.8vw, 12px)",
        color: textColor,
        position: "relative",
        overflow: "hidden",
        boxShadow: restProps.consecutiveColors 
          ? (restProps.consecutiveColors.length === 1 
              ? `inset 0 0 0 5px ${restProps.consecutiveColors[0]}`
              : (() => {
                  const colors = restProps.consecutiveColors!;
                  // Map 4 sides: Top, Right, Bottom, Left
                  // Inset Logic: 
                  // Top: inset 0 5px 0 0
                  // Right: inset -5px 0 0 0
                  // Bottom: inset 0 -5px 0 0
                  // Left: inset 5px 0 0 0
                  
                  // Assignment strategy:
                  // 2 Colors: Top(0), Right(1), Bottom(1), Left(0) -> TopLeft=0, BottomRight=1
                  // 3 Colors: Top(0), Right(1), Bottom(2), Left(0) -> TopLeft=0, Right=1, Bottom=2
                  // 4 Colors: Top(0), Right(1), Bottom(2), Left(3)
                  
                  const getC = (idx: number) => colors[idx % colors.length];
                  
                  // If size 2, manually strict for clean diagonal look (or use side logic)
                  // Side logic for 2: T=0, R=1, B=1, L=0.
                  // Side logic for 3: T=0, R=1, B=2, L=0.
                  
                  // Construct 4 shadows
                  const sTop = `inset 0 5px 0 0 ${getC(0)}`;
                  const sRight = `inset -5px 0 0 0 ${getC(1)}`;
                  const sBot = `inset 0 -5px 0 0 ${colors.length > 2 ? getC(2) : getC(1)}`;
                  const sLeft = `inset 5px 0 0 0 ${colors.length > 3 ? getC(3) : getC(0)}`;
                  
                  return `${sTop}, ${sRight}, ${sBot}, ${sLeft}`;
              })()
            )
          : "none",
      }}
    >
      {overlayColor && overlayColor !== 'transparent' && (
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
        {content}
      </span>
    </div>

    {showDivider && (
      <div
        style={{
          width: "1px",
          backgroundColor: "#999",
        }}
      />
    )}
  </React.Fragment>
));

// ----------------------------------------------------------------------
// Helper
// ----------------------------------------------------------------------

const getConsecutiveColors = (diffSet?: Set<number>): string[] | undefined => {
  if (!diffSet || diffSet.size === 0) return undefined;
  
  // if (diffSet.size > 2) return ['#ffffff']; // Removed: Support multi-colors

  const getDiffColor = (d: number) => {
    switch(d) {
        case 1: return '#F50057'; 
        case 2: return '#89ff29ff'; 
        case 3: return '#ffe603ff'; 
        case 4: return '#ff1fffff'; 
        case 5: return '#26b12dff';
        default: return '#000000';
    }
  };

  const diffs = Array.from(diffSet).sort();
  return diffs.map(d => getDiffColor(d));
};


export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [showBonus, setShowBonus] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  // ⭐ 숫자 보기 토글 (ON → 숫자 전체 보임)
  const [showNumbers, setShowNumbers] = useState(true);
  
  // ⭐ 구분선 보기 토글 (ON → 5의 배수마다 구분선 표시)
  const [showDivider, setShowDivider] = useState(false);

  // ⭐ 테마 선택
  const [theme, setTheme] = useState<ThemeType>('default');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [showMissing, setShowMissing] = useState(true);
  const [missingStats, setMissingStats] = useState<Record<number, Record<number, number>>>({});

  // ⭐ 연속 보기 토글
  const [showConsecutive, setShowConsecutive] = useState(false);

  const { historyStats, predictCandidates } = useMemo(() => {
    // Round -> Number -> Set<diff>
    const stats: Record<number, Record<number, Set<number>>> = {};
    const candidates: Record<number, Set<number>> = {}; // Number -> Set<diff>

    if (!data || data.length < 3) return { historyStats: stats, predictCandidates: candidates };

    const addStat = (drwNo: number, num: number, diff: number) => {
        if (!stats[drwNo]) stats[drwNo] = {};
        if (!stats[drwNo][num]) stats[drwNo][num] = new Set();
        stats[drwNo][num].add(diff);
    };

    // 1. History Stats (Consecutive 3+)
    for (let i = 0; i < data.length - 2; i++) {
        const r1 = data[i];     // Newer
        const r2 = data[i+1];
        const r3 = data[i+2];   // Older

        for (const n1 of r1.numbers) {
            for (const n2 of r2.numbers) {
                const diff = n1 - n2; 
                // diff can be positive or negative. Absolute logic handles step.
                const absDiff = Math.abs(diff);

                if (diff === 0 || absDiff > 5) continue;

                const n3 = n2 - diff;
                if (r3.numbers.includes(n3)) {
                     addStat(r1.drwNo, n1, absDiff);
                     addStat(r2.drwNo, n2, absDiff);
                     addStat(r3.drwNo, n3, absDiff);
                }
            }
        }
    }

    // 2. Predict Candidates (Extension of latest sequence)
    if (data.length >= 2) {
        const r1 = data[0]; // Latest
        const r2 = data[1]; // Previous
        
        for (const n1 of r1.numbers) {
            for (const n2 of r2.numbers) {
                 const diff = n1 - n2;
                 const absDiff = Math.abs(diff);

                 if (diff !== 0 && absDiff <= 5) {
                     const candidate = n1 + diff;
                     if (candidate >= 1 && candidate <= 45) {
                         if (!candidates[candidate]) candidates[candidate] = new Set();
                         candidates[candidate].add(absDiff);
                     }
                 }
            }
        }
    }

    return { historyStats: stats, predictCandidates: candidates };
  }, [data]);
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

  const displayed = useMemo(() => {
    const slice = data.slice(0, visibleCount);
    return isReversed ? [...slice].reverse() : slice;
  }, [data, visibleCount, isReversed]);

  const handleNumberClick = useCallback((num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers((prev) => [...prev, num].sort((a,b)=>a-b));
    }
  }, [selectedNumbers]);

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
                  showConsecutive && 'showConsecutive',
                ].filter(Boolean)}
                onChange={(event, newValues) => {
                  setShowNumbers(newValues.includes('showNumbers'));
                  setShowBonus(newValues.includes('showBonus'));
                  setShowDivider(newValues.includes('showDivider'));
                  setIsReversed(newValues.includes('isReversed'));
                  setShowMissing(newValues.includes('showMissing'));
                  setShowConsecutive(newValues.includes('showConsecutive'));
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

                <Tooltip title="연속">
                  <ToggleButton value="showConsecutive" aria-label="show consecutive">
                    <Iconify icon="mdi:link-variant" />
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
                    showConsecutive={showConsecutive}
                    consecutiveCandidates={predictCandidates}
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
                  showConsecutive={showConsecutive}
                  consecutiveMap={historyStats[round.drwNo]}
                />
              ))}

              {isReversed && (
                  <PredictRow
                    selectedNumbers={selectedNumbers}
                    handleNumberClick={handleNumberClick}
                    showNumbers={showNumbers}
                    showDivider={showDivider}
                    theme={theme}
                    showConsecutive={showConsecutive}
                    consecutiveCandidates={predictCandidates}
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

const PredictRow = memo(function PredictRow({
  selectedNumbers,
  handleNumberClick,
  showNumbers,
  showDivider,
  theme,
  showConsecutive,
  consecutiveCandidates,
}: {
  selectedNumbers: number[];
  handleNumberClick: (num: number) => void;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
  showConsecutive: boolean;
  consecutiveCandidates: Record<number, Set<number>>;
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
        {LOTTO_NUMBERS.map((num)=>{
          const isSelected = selectedNumbers.includes(num);
          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;
          const shouldShowNumber = showNumbers || isSelected; // Simplified logic
          const bgColor = getPredictCellColor(theme, num, isSelected);
          const textColor = (isSelected || theme !== 'default') ? '#fff' : '#555';
          
          let consecutiveColors;
          if (showConsecutive && isSelected) {
              consecutiveColors = getConsecutiveColors(consecutiveCandidates[num]);
          }

          return (
            <LottoCell
              key={num}
              num={num}
              bgColor={bgColor}
              textColor={shouldShowNumber ? textColor : "transparent"}
              content={shouldShowNumber ? num : ""}
              showDivider={shouldShowDivider}
              onClick={() => handleNumberClick(num)}
              cursor="pointer"
              consecutiveColors={consecutiveColors}
            />
          );
        })}
      </div>
    </div>
  );
});

// ----------------------------------------------------------------------
// Data Row
// ----------------------------------------------------------------------

const DataRow = memo(function DataRow({
  round,
  showBonus,
  showNumbers,
  showDivider,
  theme,
  showMissing,
  missingStreakMap,
  showConsecutive,
  consecutiveMap,
}: {
  round: any;
  showBonus: boolean;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
  showMissing: boolean;
  missingStreakMap?: Record<number, number>;
  showConsecutive: boolean;
  consecutiveMap?: Record<number, Set<number>>;
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
        {LOTTO_NUMBERS.map((num)=>{
          const isWinning = round.numbers.includes(num);
          const isBonus = showBonus && round.bonus === num;
          const isClicked = clicked.includes(num);

          const bgColor = getCellColorByTheme(theme, num, isWinning, isBonus, isClicked);
          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;
          const shouldShowNumber = showNumbers || isClicked;

          // 미출현 오버레이 계산
          const streak = (showMissing && missingStreakMap) ? (missingStreakMap[num] || 0) : 0;
          let overlayColor = 'transparent';
          if (streak > 0 && !isWinning) {
             const alpha = Math.min(streak * 2.5, 95) / 100;
             overlayColor = `rgba(0,0,0, ${alpha})`;
          }

          return (
            <LottoCell
              key={num}
              num={num}
              bgColor={bgColor}
              textColor="#fff" // Optimized logic: Always whites if shown (as per previous logic refinement)
              content={shouldShowNumber ? num : ""}
              showDivider={shouldShowDivider}
              overlayColor={overlayColor}
              onClick={() => handleClick(num, isWinning)}
              cursor={isWinning ? "pointer" : "default"}
              consecutiveColors={showConsecutive ? getConsecutiveColors(consecutiveMap?.[num]) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
});
