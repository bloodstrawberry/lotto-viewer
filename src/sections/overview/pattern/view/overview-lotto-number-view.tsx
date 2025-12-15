'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

import { DashboardContent } from "src/layouts/dashboard";
import { getAllLottoNumbers, ThemeType, THEME_NAMES } from "src/api/lottolibrary";

import { PredictRow } from "./components/predict-row";
import { DataRow } from "./components/data-row";
import { useLottoPattern } from "./hooks/use-lotto-pattern";
import { useLottoMissing } from "./hooks/use-lotto-missing";

// ----------------------------------------------------------------------

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

  // ⭐ 연속 보기 토글
  const [showConsecutive, setShowConsecutive] = useState(false);

  const { historyStats, predictCandidates } = useLottoPattern(data);
  const missingStats = useLottoMissing(data);

  const traceStats = useMemo(() => {
    const stats: Record<number, Record<number, Set<number>>> = {};
    if (selectedNumbers.length === 0 || !data || data.length < 2) return stats;

    const latestRound = data[0]; 

    selectedNumbers.forEach((candidate) => {
      const diffs = predictCandidates[candidate];
      if (!diffs) return;

      diffs.forEach((absDiff) => {
        [candidate - absDiff, candidate + absDiff].forEach((n1) => {
          if (!latestRound.numbers.includes(n1)) return;
          const signedDiff = candidate - n1;
          if (Math.abs(signedDiff) !== absDiff) return;

          let currentNum = n1;
          let currentIdx = 0;
          while (currentIdx < data.length) {
             const r = data[currentIdx];
             if (r.numbers.includes(currentNum)) {
                if (!stats[r.drwNo]) stats[r.drwNo] = {};
                if (!stats[r.drwNo][currentNum]) stats[r.drwNo][currentNum] = new Set();
                stats[r.drwNo][currentNum].add(absDiff);
                currentNum -= signedDiff;
                currentIdx++;
             } else {
                break;
             }
          }
        });
      });
    });
    return stats;
  }, [selectedNumbers, predictCandidates, data]);

  useEffect(() => {
    const allData = getAllLottoNumbers();
    const sortedDesc = [...allData].sort((a, b) => b.drwNo - a.drwNo);
    setData(sortedDesc);
    setVisibleCount(30);
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

              {displayed.map((round) => {
                const roundHistory = historyStats[round.drwNo];
                const roundTrace = traceStats[round.drwNo];
                
                let mergedStats = roundHistory;
                if (roundTrace) {
                    mergedStats = roundHistory ? { ...roundHistory } : {};
                    Object.entries(roundTrace).forEach(([numStr, set]) => {
                        const num = Number(numStr);
                        if (mergedStats[num]) {
                            mergedStats[num] = new Set([...mergedStats[num], ...set]);
                        } else {
                            mergedStats[num] = set;
                        }
                    });
                }
                
                return (
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
                  consecutiveMap={mergedStats}
                />
              )})}

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
