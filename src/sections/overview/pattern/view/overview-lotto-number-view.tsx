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

  // ⭐ 연속 보기 토글 (0=OFF, 99=ALL, 1-5=Diff)
  const [consecutiveOption, setConsecutiveOption] = useState<number>(0);
  
  // ⭐ 점프 보기 토글 (0=OFF, 99=ALL, 1-5=Diff)
  const [jumpOption, setJumpOption] = useState<number>(0);

  const { historyStats, predictCandidates, jumpHistoryStats, jumpPredictCandidates } = useLottoPattern(data, consecutiveOption, jumpOption);
  const missingStats = useLottoMissing(data);
  
  const mergedPredictCandidates = useMemo(() => {
    const merged: Record<number, Set<number>> = {};
    
    if (consecutiveOption !== 0) {
        Object.entries(predictCandidates).forEach(([k, v]) => {
            merged[Number(k)] = new Set(v);
        });
    }
    
    if (jumpOption !== 0) {
        Object.entries(jumpPredictCandidates).forEach(([k, v]) => {
            const n = Number(k);
            if (!merged[n]) merged[n] = new Set();
            v.forEach(d => merged[n].add(d));
        });
    }
    return merged;
  }, [predictCandidates, jumpPredictCandidates, consecutiveOption, jumpOption]);

  const traceStats = useMemo(() => {
    const stats: Record<number, Record<number, Set<number>>> = {};
    if (selectedNumbers.length === 0 || !data || data.length < 2) return stats;

    const latestRound = data[0]; 

    selectedNumbers.forEach((candidate) => {
      const diffs = mergedPredictCandidates[candidate];
      if (!diffs) return;

      diffs.forEach((absDiff) => {
        // 1. Check Interval 1 (Consecutive)
        if (consecutiveOption !== 0) {
             // Filter by consecutiveOption if precise
             if (consecutiveOption !== 99 && consecutiveOption !== absDiff) {
                 // Skip if strict match required and fails
             } else {
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
             }
        }
        
        // 2. Check Interval Jump (if active) - Iterate all valid intervals
        if (jumpOption !== 0) {
            // Filter by jumpOption if precise
            if (jumpOption !== 99 && jumpOption !== absDiff) {
                // Skip
            } else {
                const intervals = [2, 3, 4, 5];
                intervals.forEach((jumpInterval) => {
                    const prevIdx = jumpInterval - 1;
                    if (prevIdx < data.length) {
                        const rPrev = data[prevIdx];
                        [candidate - absDiff, candidate + absDiff].forEach((nPrev) => {
                            if (rPrev.numbers.includes(nPrev)) {
                                const signedDiff = candidate - nPrev;
                                if (Math.abs(signedDiff) !== absDiff) return;

                                // Trace back
                                let currentNum = nPrev;
                                let currentIdx = prevIdx;
                                
                                if (!stats[rPrev.drwNo]) stats[rPrev.drwNo] = {};
                                if (!stats[rPrev.drwNo][currentNum]) stats[rPrev.drwNo][currentNum] = new Set();
                                stats[rPrev.drwNo][currentNum].add(absDiff);

                                while (true) {
                                    const nextIdx = currentIdx + jumpInterval;
                                    const nextNum = currentNum - signedDiff;
                                    
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
                });
            }
        }
      });
    });
    return stats;
  }, [selectedNumbers, mergedPredictCandidates, data, consecutiveOption, jumpOption]);

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

  const getNextOption = (current: number) => {
      if (current === 0) return 99; // Off -> All
      if (current === 99) return 1; // All -> 1
      if (current < 5) return current + 1; // 1->2->3->4->5
      return 0; // 5 -> Off
  };

  const getOptionLabel = (opt: number, label: string) => {
      if (opt === 0) return `${label} (OFF)`;
      if (opt === 99) return `${label} (ON)`;
      return `${label} (${opt}로 표시)`;
  };

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="패턴분석"
          sx={{
            mb: 0,
            '& .MuiCardHeader-content': { display: { xs: 'none', sm: 'block' } },
            '& .MuiCardHeader-action': { m: 0, width: { xs: '100%', sm: 'auto' } },
          }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
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
                      <ToggleButton value={themeKey} aria-label={THEME_NAMES[themeKey]} sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}>
                        <Iconify icon={themeKey === 'default' ? 'mdi:format-color-fill' : 'mdi:palette'} width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
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
                  <ToggleButton value="showNumbers" aria-label="show numbers" sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}>
                    <Iconify icon="mdi:numeric" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
                  </ToggleButton>
                </Tooltip>
                
                <Tooltip title="보너스 번호">
                  <ToggleButton value="showBonus" aria-label="show bonus" sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}>
                    <Iconify icon="mdi:star-circle-outline" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="구분선">
                  <ToggleButton value="showDivider" aria-label="show divider" sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}>
                    <Iconify icon="mdi:view-week-outline" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="역순">
                  <ToggleButton value="isReversed" aria-label="reverse order" sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}>
                    <Iconify icon="mdi:sort" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
                  </ToggleButton>
                </Tooltip>

                <Tooltip title="미출현">
                  <ToggleButton value="showMissing" aria-label="show missing" sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}>
                    <Iconify icon="mdi:gradient" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
              
              {/* Pattern Button Group */}
              <ToggleButtonGroup
                size="small"
                exclusive
                value={consecutiveOption > 0 ? 'consecutive' : jumpOption > 0 ? 'jump' : null}
                onChange={(event, newPattern) => {
                    // Logic to handle exclusive switching and internal cycling
                    // This onChange triggers when a NEW button is selected or current is deselected.
                    
                    if (newPattern === 'consecutive') {
                        // Switching TO consecutive (or clicking it again if not handled by exclusive?)
                        // Exclusive prop means if I click active, newPattern might be null.
                        // But we want to cycle. So we need to handle click manually or use onClick?
                        // ToggleButtonGroup onChange passes null if unselected.
                        
                        // We will handle logic in onClick of buttons instead for cycling?
                        // Or utilize the fact that if newPattern is same, it might be null?
                        // Actually, ToggleButtonGroup exclusive returns null if clicked again.
                    }
                }}
                aria-label="pattern settings"
              >
                <Tooltip title={getOptionLabel(consecutiveOption, "연속")}>
                  <ToggleButton 
                    value="consecutive" 
                    aria-label="show consecutive" 
                    selected={consecutiveOption > 0}
                    onClick={() => {
                        // Cycle
                        const next = getNextOption(consecutiveOption);
                        setConsecutiveOption(next);
                        // Ensure exclusive behavior manually if needed, or let Group handle visual selection
                        if (next > 0) setJumpOption(0);
                    }}
                    sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}
                  >
                    {consecutiveOption > 0 ? (
                         <Box component="span" sx={{ fontWeight: 'bold', fontSize: { xs: 10, sm: 11, md: 12 }, lineHeight: 1 }}>
                            {consecutiveOption === 99 ? 'On' : consecutiveOption}
                         </Box>
                    ) : (
                         <Iconify icon="mdi:link-variant" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
                    )}
                  </ToggleButton>
                </Tooltip>

                <Tooltip title={getOptionLabel(jumpOption, "점프")}>
                    <ToggleButton 
                        value="jump" 
                        aria-label="jump pattern" 
                        selected={jumpOption > 0}
                        onClick={() => {
                            const next = getNextOption(jumpOption);
                            setJumpOption(next);
                            if (next > 0) setConsecutiveOption(0);
                        }}
                        sx={{ width: { xs: 20, sm: 22, md: 24 }, height: { xs: 20, sm: 22, md: 24 } }}
                    >
                        {jumpOption > 0 ? (
                             <Box component="span" sx={{ fontWeight: 'bold', fontSize: { xs: 10, sm: 11, md: 12 }, lineHeight: 1 }}>
                                {jumpOption === 99 ? 'On' : jumpOption}
                             </Box>
                        ) : (
                             <Iconify icon="mdi:stairs" width={24} sx={{ width: { xs: 14, sm: 15, md: 16 } }} />
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
                    showConsecutive={consecutiveOption > 0 || jumpOption > 0}
                    consecutiveCandidates={mergedPredictCandidates}
                  />
              )}

              {displayed.map((round) => {
                const roundHistory = historyStats[round.drwNo];
                const roundJump = jumpHistoryStats[round.drwNo];
                const roundTrace = traceStats[round.drwNo];
                
                // Merge consecutive and jump stats
                let mergedStats: Record<number, Set<number>> = {};
                
                if (consecutiveOption !== 0 && roundHistory) {
                    Object.entries(roundHistory).forEach(([k, v]) => {
                        mergedStats[Number(k)] = new Set(v);
                    });
                }

                if (jumpOption !== 0 && roundJump) {
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
                  showConsecutive={consecutiveOption > 0 || jumpOption > 0}
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
                    showConsecutive={consecutiveOption > 0 || jumpOption > 0}
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
