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
  
  // ⭐ 점프 보기 토글 (0=OFF, 2,3,4,5)
  const [jumpInterval, setJumpInterval] = useState<number>(0);

  const { historyStats, predictCandidates, jumpHistoryStats, jumpPredictCandidates } = useLottoPattern(data, jumpInterval);
  const missingStats = useLottoMissing(data);
  
  const mergedPredictCandidates = useMemo(() => {
    const merged: Record<number, Set<number>> = {};
    
    if (showConsecutive) {
        Object.entries(predictCandidates).forEach(([k, v]) => {
            merged[Number(k)] = new Set(v);
        });
    }
    
    if (jumpInterval > 0) {
        Object.entries(jumpPredictCandidates).forEach(([k, v]) => {
            const n = Number(k);
            if (!merged[n]) merged[n] = new Set();
            v.forEach(d => merged[n].add(d));
        });
    }
    return merged;
  }, [predictCandidates, jumpPredictCandidates, showConsecutive, jumpInterval]);

  const traceStats = useMemo(() => {
    const stats: Record<number, Record<number, Set<number>>> = {};
    if (selectedNumbers.length === 0 || !data || data.length < 2) return stats;

    const latestRound = data[0]; 

    selectedNumbers.forEach((candidate) => {
      // Use merged candidates for trace? Ideally yes, but trace logic is tricky.
      // For now, let's look at mergedPredictCandidates to see "why" a number is selected.
      const diffs = mergedPredictCandidates[candidate];
      if (!diffs) return;

      diffs.forEach((absDiff) => {
        // Trace logic currently supports "Consecutive" (Interval 1)
        // Adjusting for Jump requires knowing which pattern caused this diff.
        // Since we merged them, we don't distinguish if diff comes from Jump or Consecutive here easily.
        // However, we can try both checks.
        
        // 1. Check Interval 1 (Consecutive)
        if (showConsecutive) {
             [candidate - absDiff, candidate + absDiff].forEach((n1) => {
                if (!latestRound.numbers.includes(n1)) return;
                const signedDiff = candidate - n1;
                if (Math.abs(signedDiff) !== absDiff) return;

                let currentNum = n1;
                let currentIdx = 0;
                // ... (Original logic for Interval 1)
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
        }
        
        // 2. Check Interval Jump (if active)
        if (jumpInterval > 0) {
            // Check previous point: (Latest - JumpInterval)? No.
            // Predict candidate is for NEXT round.
            // Jump pattern means: Next, Next - Jump, Next - 2*Jump ...
            // Points: Candidate, data[jumpInterval-1], data[2*jumpInterval-1] ...
            // We want to highlight the existing numbers in data.
            // Previous number is at data[jumpInterval - 1].
            
            const prevIdx = jumpInterval - 1;
            if (prevIdx < data.length) {
                const rPrev = data[prevIdx];
                [candidate - absDiff, candidate + absDiff].forEach((nPrev) => {
                    // Repeat logic only for diff 0? No, allow diff 0.
                    // If diff 0, nPrev === candidate.
                    
                    if (rPrev.numbers.includes(nPrev)) {
                        const signedDiff = candidate - nPrev; // If jumping 29->29, diff 0.
                        if (Math.abs(signedDiff) !== absDiff) return;

                        // Trace back
                        let currentNum = nPrev;
                        let currentIdx = prevIdx; // Start at first existing point in history
                        
                        // We found one point. Mark it.
                        if (!stats[rPrev.drwNo]) stats[rPrev.drwNo] = {};
                        if (!stats[rPrev.drwNo][currentNum]) stats[rPrev.drwNo][currentNum] = new Set();
                        stats[rPrev.drwNo][currentNum].add(absDiff);

                        // Keep going back by jumpInterval
                        while (true) {
                            const nextIdx = currentIdx + jumpInterval;
                            const nextNum = currentNum - signedDiff; // Arithmetic progression
                            
                            if (nextIdx >= data.length) break;
                            const rNext = data[nextIdx];
                            
                            if (rNext.numbers.includes(nextNum)) {
                                if (!stats[rNext.drwNo]) stats[rNext.drwNo] = {};
                                if (!stats[rNext.drwNo][nextNum]) stats[rNext.drwNo][nextNum] = new Set();
                                stats[rNext.drwNo][nextNum].add(absDiff);
                                
                                currentNum = nextNum;
                                currentIdx = nextIdx;
                            } else {
                                break;
                            }
                        }
                    }
                });
            }
        }
      });
    });
    return stats;
  }, [selectedNumbers, mergedPredictCandidates, data, showConsecutive, jumpInterval]); // Updated dependencies

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
          sx={{ mb: 1 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                      <ToggleButton value={themeKey} aria-label={THEME_NAMES[themeKey]} sx={{ width: 24, height: 24 }}>
                        <Iconify icon={themeKey === 'default' ? 'mdi:format-color-fill' : 'mdi:palette'} width={24} />
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
                  <ToggleButton value="showNumbers" aria-label="show numbers" sx={{ width: 24, height: 24 }}>
                    <Iconify icon="mdi:numeric" width={24} />
                  </ToggleButton>
                </Tooltip>
                
                <Tooltip title="보너스 번호">
                  <ToggleButton value="showBonus" aria-label="show bonus" sx={{ width: 24, height: 24 }}>
                    <Iconify icon="mdi:star-circle-outline" width={24} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="구분선">
                  <ToggleButton value="showDivider" aria-label="show divider" sx={{ width: 24, height: 24 }}>
                    <Iconify icon="mdi:view-week-outline" width={24} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="역순">
                  <ToggleButton value="isReversed" aria-label="reverse order" sx={{ width: 24, height: 24 }}>
                    <Iconify icon="mdi:sort" width={24} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="미출현">
                  <ToggleButton value="showMissing" aria-label="show missing" sx={{ width: 24, height: 24 }}>
                    <Iconify icon="mdi:gradient" width={24} />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
              
              {/* Pattern Button Group */}
              <ToggleButtonGroup
                size="small"
                exclusive
                value={showConsecutive ? 'consecutive' : jumpInterval > 0 ? 'jump' : null}
                onChange={(event, newPattern) => {
                    if (newPattern === 'consecutive') {
                        setShowConsecutive(true);
                        setJumpInterval(0);
                    } else if (newPattern === 'jump') {
                        setShowConsecutive(false);
                        setJumpInterval(2);
                    } else {
                         // Clicked the active toggle
                         if (showConsecutive) {
                             setShowConsecutive(false);
                         } else if (jumpInterval > 0) {
                             // Cycle jump interval
                            const next = jumpInterval === 2 ? 3 
                                       : jumpInterval === 3 ? 4 
                                       : jumpInterval === 4 ? 5 
                                       : 0;
                            setJumpInterval(next);
                         }
                    }
                }}
                aria-label="pattern settings"
              >
                <Tooltip title="연속">
                  <ToggleButton value="consecutive" aria-label="show consecutive" sx={{ width: 24, height: 24 }}>
                    <Iconify icon="mdi:link-variant" width={24} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title={jumpInterval === 0 ? "점프 (OFF)" : `점프 (${jumpInterval}회차)`}>
                    <ToggleButton value="jump" aria-label="jump pattern" sx={{ width: 24, height: 24 }}>
                        {jumpInterval > 0 ? (
                             <Box component="span" sx={{ fontWeight: 'bold', fontSize: 16, lineHeight: 1 }}>
                                {jumpInterval}
                             </Box>
                        ) : (
                             <Iconify icon="mdi:stairs" width={24} />
                        )}
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
                    showConsecutive={showConsecutive || jumpInterval > 0}
                    consecutiveCandidates={mergedPredictCandidates}
                  />
              )}

              {displayed.map((round) => {
                const roundHistory = historyStats[round.drwNo];
                const roundJump = jumpHistoryStats[round.drwNo];
                const roundTrace = traceStats[round.drwNo];
                
                // Merge consecutive and jump stats
                let mergedStats: Record<number, Set<number>> = {};
                
                if (showConsecutive && roundHistory) {
                    Object.entries(roundHistory).forEach(([k, v]) => {
                        mergedStats[Number(k)] = new Set(v);
                    });
                }

                if (jumpInterval > 0 && roundJump) {
                    Object.entries(roundJump).forEach(([k, v]) => {
                        const n = Number(k);
                        if (!mergedStats[n]) mergedStats[n] = new Set();
                        v.forEach(d => mergedStats[n].add(d));
                    });
                }

                if (roundTrace) {
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
                  showConsecutive={showConsecutive || jumpInterval > 0}
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
                    showConsecutive={showConsecutive || jumpInterval > 0}
                    consecutiveCandidates={mergedPredictCandidates}
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
