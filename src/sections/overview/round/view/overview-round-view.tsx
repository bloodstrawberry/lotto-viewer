'use client';

import { varAlpha } from 'minimal-shared/utils';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DashboardContent } from 'src/layouts/dashboard';
import { getBallColor, getAllLottoNumbers } from 'src/api/lottolibrary';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

// Responsive Lotto Ball Component
type LottoBallProps = {
  number: number;
  size?: number;
  highlighted?: boolean;
};

function LottoBall({ number, size = 36, highlighted = true }: LottoBallProps) {
  const color = getBallColor(number);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: highlighted ? color : 'grey.300',
        color: highlighted ? '#fff' : 'text.disabled',
        fontWeight: 'bold',
        fontSize: size * 0.45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: highlighted
          ? 'inset -2px -2px 4px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.1)'
          : 'none',
        border: highlighted ? '1px solid rgba(255,255,255,0.2)' : '1px dashed rgba(0,0,0,0.1)',
        opacity: highlighted ? 1 : 0.25,
        transition: 'all 0.2s ease',
      }}
    >
      {number}
    </Box>
  );
}

// Generate combinations of size k from an array of numbers
function getCombinations(arr: number[], k: number): number[][] {
  const result: number[][] = [];
  function backtrack(start: number, current: number[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i += 1) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

export function OverviewRoundView() {
  const allLotto = useMemo(() => getAllLottoNumbers(), []);
  const latestRound = useMemo(
    () => (allLotto.length > 0 ? allLotto[allLotto.length - 1].drwNo : 0),
    [allLotto]
  );

  // Mode Selection State
  const [analysisMode, setAnalysisMode] = useState<'round' | 'custom'>('round');
  const [customNumbers, setCustomNumbers] = useState<number[]>([]);

  const [X, setX] = useState<number>(0);
  const [A, setA] = useState<number>(1);
  const [B, setB] = useState<number>(1);
  const [includeBonus, setIncludeBonus] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [comboSize, setComboSize] = useState<number>(2);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalRounds, setModalRounds] = useState<any[]>([]);
  const [highlightNumbers, setHighlightNumbers] = useState<number[]>([]);
  const [modalSortOrder, setModalSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedModalRounds = useMemo(() => [...modalRounds].sort((a, b) => {
      if (modalSortOrder === 'desc') {
        return b.drwNo - a.drwNo;
      }
      return a.drwNo - b.drwNo;
    }), [modalRounds, modalSortOrder]);

  // Initialize values when component mounts and data is loaded
  useEffect(() => {
    if (latestRound > 0) {
      setX(latestRound);
      setB(latestRound - 1);
    }
  }, [latestRound]);

  // Target draw numbers based on mode
  const targetDraw = useMemo(() => allLotto.find((item) => item.drwNo === X), [allLotto, X]);
  const targetNumbers = useMemo(() => {
    if (analysisMode === 'round') {
      return targetDraw ? targetDraw.numbers : [];
    }
    return [...customNumbers].sort((a, b) => a - b);
  }, [analysisMode, targetDraw, customNumbers]);
  const targetBonus = useMemo(() => (targetDraw ? targetDraw.bonus : 0), [targetDraw]);

  // Check if analysis is ready
  const isAnalysisReady = useMemo(() => targetNumbers.length === 6, [targetNumbers]);

  // Mode change handler
  const handleModeChange = (newMode: 'round' | 'custom') => {
    setAnalysisMode(newMode);
    if (newMode === 'round') {
      const maxB = X - 1;
      setB((prevB) => Math.min(prevB, maxB));
      setA((prevA) => Math.min(prevA, maxB));
    } else {
      // In custom mode, max B can go up to latestRound
      setB(latestRound);
    }
  };

  // Safe handlers that enforce constraints
  const handleXChange = (val: number) => {
    const nextX = Math.min(latestRound, Math.max(2, val));
    setX(nextX);
    if (analysisMode === 'round') {
      setB((prevB) => Math.min(prevB, nextX - 1));
      setA((prevA) => Math.min(prevA, nextX - 1));
    }
  };

  const handleAChange = (val: number) => {
    const nextA = Math.min(B, Math.max(1, val));
    setA(nextA);
  };

  const handleBChange = (val: number) => {
    const maxB = analysisMode === 'round' ? X - 1 : latestRound;
    const nextB = Math.min(maxB, Math.max(A, val));
    setB(nextB);
  };

  const applyPreset = (presetType: 'all' | '100' | '200' | '500') => {
    const reference = analysisMode === 'round' ? X : latestRound + 1;
    if (reference < 2) return;
    const maxB = reference - 1;
    let nextA = 1;

    if (presetType === '100') nextA = Math.max(1, reference - 100);
    else if (presetType === '200') nextA = Math.max(1, reference - 200);
    else if (presetType === '500') nextA = Math.max(1, reference - 500);

    setA(nextA);
    setB(maxB);
  };

  // Custom Selection Actions
  const handleToggleCustomNumber = (num: number) => {
    setCustomNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 6) {
        return prev;
      }
      return [...prev, num];
    });
  };

  const handleRandomSelect = () => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const rand = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(rand)) {
        numbers.push(rand);
      }
    }
    setCustomNumbers(numbers.sort((a, b) => a - b));
  };

  const handleFillLatest = () => {
    const latest = allLotto.length > 0 ? allLotto[allLotto.length - 1] : null;
    if (latest) {
      setCustomNumbers([...latest.numbers].sort((a, b) => a - b));
    }
  };

  const handleClearCustom = () => {
    setCustomNumbers([]);
  };

  // 1. Calculate Match Count Statistics
  const matchCountStats = useMemo(() => {
    if (!isAnalysisReady || A > B) {
      return { 2: [], 3: [], 4: [], 5: [] };
    }

    const historicalRounds = allLotto.filter((r) => r.drwNo >= A && r.drwNo <= B);
    const m2: any[] = [];
    const m3: any[] = [];
    const m4: any[] = [];
    const m5: any[] = [];

    historicalRounds.forEach((r) => {
      const pool = includeBonus ? [...r.numbers, r.bonus] : r.numbers;
      const matched = pool.filter((n) => targetNumbers.includes(n));
      const matchCount = matched.length;

      const roundData = {
        drwNo: r.drwNo,
        numbers: r.numbers,
        bonus: r.bonus,
        drwNoDate: r.drwNoDate,
        matchedNumbers: matched,
      };

      if (matchCount === 2) m2.push(roundData);
      else if (matchCount === 3) m3.push(roundData);
      else if (matchCount === 4) m4.push(roundData);
      else if (matchCount === 5) m5.push(roundData);
    });

    return { 2: m2, 3: m3, 4: m4, 5: m5 };
  }, [isAnalysisReady, targetNumbers, A, B, includeBonus, allLotto]);

  // 2. Calculate Combination Occurrence Statistics
  const combinationStats = useMemo(() => {
    if (!isAnalysisReady || A > B) return [];

    const combos = getCombinations(targetNumbers, comboSize);
    const historicalRounds = allLotto.filter((r) => r.drwNo >= A && r.drwNo <= B);

    const stats = combos.map((combo) => {
      const matchedRounds = historicalRounds.filter((r) => {
        const pool = includeBonus ? [...r.numbers, r.bonus] : r.numbers;
        return combo.every((num) => pool.includes(num));
      });

      return {
        combo: [...combo].sort((a, b) => a - b),
        count: matchedRounds.length,
        matchedRounds,
      };
    });

    return stats.sort((a, b) => b.count - a.count);
  }, [isAnalysisReady, targetNumbers, A, B, comboSize, includeBonus, allLotto]);

  // 3. Calculate Single Number Statistics
  const singleNumberStats = useMemo(() => {
    if (!isAnalysisReady || A > B) return [];

    const historicalRounds = allLotto.filter((r) => r.drwNo >= A && r.drwNo <= B);

    const stats = targetNumbers.map((num) => {
      const matchedRounds = historicalRounds.filter((r) => {
        const pool = includeBonus ? [...r.numbers, r.bonus] : r.numbers;
        return pool.includes(num);
      });

      return {
        number: num,
        count: matchedRounds.length,
        matchedRounds,
      };
    });

    return stats.sort((a, b) => b.count - a.count);
  }, [isAnalysisReady, targetNumbers, A, B, includeBonus, allLotto]);

  const totalRounds = B - A + 1;

  const handleOpenMatchModal = (k: number) => {
    const rounds = matchCountStats[k as 2 | 3 | 4 | 5] || [];
    setModalTitle(`${k}개 번호 일치 회차 목록 (총 ${rounds.length}회)`);
    setModalRounds(rounds);
    setHighlightNumbers(targetNumbers);
    setModalOpen(true);
  };

  const handleOpenComboModal = (combo: number[], count: number, matchedRounds: any[]) => {
    const comboText = combo.length === 1 ? `번호 ${combo[0]}` : `조합 [${combo.join(', ')}]`;
    setModalTitle(`${comboText} 출현 회차 목록 (총 ${count}회)`);
    setModalRounds(matchedRounds);
    setHighlightNumbers(combo);
    setModalOpen(true);
  };

  const getRoundGapInfo = useCallback(
    (currentRoundNo: number, highlightNums: number[]) => {
      if (highlightNums.length === 0) return { gap: 0, isFirst: false };

      for (let i = currentRoundNo - 2; i >= 0; i -= 1) {
        const r = allLotto[i];
        const pool = includeBonus ? [...r.numbers, r.bonus] : r.numbers;
        const isMatch = highlightNums.every((num) => pool.includes(num));
        if (isMatch) {
          return { gap: currentRoundNo - r.drwNo, isFirst: false };
        }
      }
      return { gap: 0, isFirst: true };
    },
    [allLotto, includeBonus]
  );

  const handleSelectRoundFromModal = (roundNo: number) => {
    if (analysisMode === 'round') {
      handleXChange(roundNo);
    } else {
      const target = allLotto.find((item) => item.drwNo === roundNo);
      if (target) {
        setCustomNumbers([...target.numbers].sort((a, b) => a - b));
      }
    }
    setModalOpen(false);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">회차분석</Typography>
      <Typography sx={{ mt: 1, mb: 4, color: 'text.secondary' }}>
        분석할 당첨 번호(특정 회차 혹은 사용자 직접 선택)가 지정한 분석 범위(A ~ B회차) 내에서 동반
        출현한 통계를 분석합니다.
      </Typography>

      <Grid container spacing={3}>
        {/* Left Settings Panel & Target Input/Selection */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Settings Card */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                분석 설정
              </Typography>

              <ToggleButtonGroup
                value={analysisMode}
                exclusive
                onChange={(e, val) => val !== null && handleModeChange(val)}
                fullWidth
                color="primary"
                sx={{ mb: 2.5 }}
                size="small"
              >
                <ToggleButton value="round" sx={{ fontWeight: 'bold' }}>
                  회차별 당첨번호
                </ToggleButton>
                <ToggleButton value="custom" sx={{ fontWeight: 'bold' }}>
                  사용자 직접선택
                </ToggleButton>
              </ToggleButtonGroup>

              <Stack spacing={2.5}>
                {analysisMode === 'round' && (
                  <TextField
                    label="대상 회차 (X)"
                    type="number"
                    value={X || ''}
                    onChange={(e) => handleXChange(Number(e.target.value))}
                    inputProps={{ min: 2, max: latestRound }}
                    fullWidth
                    size="small"
                  />
                )}

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="시작 회차 (A)"
                    type="number"
                    value={A || ''}
                    onChange={(e) => handleAChange(Number(e.target.value))}
                    inputProps={{ min: 1, max: B }}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="종료 회차 (B)"
                    type="number"
                    value={B || ''}
                    onChange={(e) => handleBChange(Number(e.target.value))}
                    inputProps={{ min: A, max: analysisMode === 'round' ? X - 1 : latestRound }}
                    fullWidth
                    size="small"
                  />
                </Stack>

                {/* Preset Ranges */}
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    범위 간편 설정
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('all')}>
                      전체
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('100')}>
                      최근 100회
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('200')}>
                      최근 200회
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => applyPreset('500')}>
                      최근 500회
                    </Button>
                  </Stack>
                </Stack>

                <FormControlLabel
                  control={
                    <Switch
                      checked={includeBonus}
                      onChange={(e) => setIncludeBonus(e.target.checked)}
                    />
                  }
                  label="과거 회차 보너스 번호 포함"
                />
              </Stack>
            </Card>

            {/* Target Display/Selector Card */}
            {analysisMode === 'round' ? (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {X}회차 당첨 정보
                </Typography>
                {targetDraw ? (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      추첨일: {targetDraw.drwNoDate}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      {targetNumbers.map((num) => (
                        <LottoBall key={num} number={num} />
                      ))}
                      <Typography variant="h6" sx={{ mx: 0.5, color: 'text.secondary' }}>
                        +
                      </Typography>
                      <Stack alignItems="center">
                        <LottoBall number={targetBonus} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          보너스
                        </Typography>
                      </Stack>
                    </Stack>
                  </>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    회차 정보를 찾을 수 없습니다.
                  </Typography>
                )}
              </Card>
            ) : (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  직접 번호 선택
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  분석에 사용할 번호 6개를 아래 숫자 판에서 선택하세요.
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    minHeight: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2,
                    p: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  {customNumbers.length === 0 ? (
                    <Typography variant="body2" color="text.disabled">
                      번호를 선택해 주세요 (0/6)
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={0.8}>
                      {customNumbers.map((num) => (
                        <LottoBall key={num} number={num} size={32} />
                      ))}
                      {customNumbers.length < 6 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ alignSelf: 'center', ml: 1 }}
                        >
                          ({customNumbers.length}/6)
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Stack>

                {/* 1-45 Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 0.8,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  {LOTTO_NUMBERS.map((num) => {
                    const isSelected = customNumbers.includes(num);
                    const ballColor = getBallColor(num);
                    return (
                      <Box
                        key={num}
                        onClick={() => handleToggleCustomNumber(num)}
                        sx={{
                          aspectRatio: '1/1',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          bgcolor: isSelected ? ballColor : 'background.paper',
                          color: isSelected ? '#fff' : 'text.primary',
                          border: (theme) =>
                            `1px solid ${isSelected ? 'transparent' : theme.vars.palette.divider}`,
                          boxShadow: isSelected ? '1px 1px 3px rgba(0,0,0,0.15)' : 'none',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            bgcolor: isSelected ? ballColor : 'grey.200',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {num}
                      </Box>
                    );
                  })}
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="space-between">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearCustom}
                    sx={{ flex: 1 }}
                  >
                    초기화
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRandomSelect}
                    sx={{ flex: 1 }}
                  >
                    무작위
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleFillLatest}
                    sx={{ flex: 1 }}
                  >
                    최근당첨
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Right Analysis Tabs */}
        <Grid size={{ xs: 12, md: 8 }}>
          {!isAnalysisReady ? (
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 480,
                textAlign: 'center',
                p: 4,
              }}
            >
              <Iconify
                icon="solar:info-circle-bold-duotone"
                width={64}
                height={64}
                sx={{ color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                분석할 번호 6개를 선택해 주세요
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1, maxWidth: 320 }}>
                왼쪽 &apos;직접 번호 선택&apos; 영역에서 번호 6개를 모두 선택하면 분석 결과가
                나타납니다.
              </Typography>
            </Card>
          ) : (
            <Card sx={{ height: 1 }}>
              {/* Tab Headers */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 2,
                  bgcolor: 'background.neutral',
                }}
              >
                <ToggleButtonGroup
                  value={currentTab}
                  exclusive
                  onChange={(e, val) => val !== null && setCurrentTab(val)}
                  sx={{ py: 1.5 }}
                  size="small"
                >
                  <ToggleButton value={0} sx={{ px: 2, fontWeight: 'bold' }}>
                    번호 조합별 분석
                  </ToggleButton>
                  <ToggleButton value={1} sx={{ px: 2, fontWeight: 'bold' }}>
                    일치 개수별 통계
                  </ToggleButton>
                  <ToggleButton value={2} sx={{ px: 2, fontWeight: 'bold' }}>
                    개별 번호 통계
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Tab 0: Combinations Analysis */}
              {currentTab === 0 && (
                <Box sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {analysisMode === 'round' ? (
                        <>
                          {X}회차의 6개 번호 중에서 선택한 개수만큼 조합을 생성해 {A} ~ {B}회차 내
                          동반 출현 횟수를 분석합니다.
                        </>
                      ) : (
                        <>
                          선택한 6개 번호 중에서 선택한 개수만큼 조합을 생성해 {A} ~ {B}회차 내 동반
                          출현 횟수를 분석합니다.
                        </>
                      )}
                    </Typography>

                    <ToggleButtonGroup
                      value={comboSize}
                      exclusive
                      onChange={(e, val) => val !== null && setComboSize(val)}
                      size="small"
                      color="primary"
                    >
                      {[2, 3, 4, 5].map((size) => (
                        <ToggleButton key={size} value={size}>
                          {size}개 조합
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Stack>

                  <TableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>
                            조합 번호
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}
                          >
                            출현 횟수
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}
                          >
                            출현 비율
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}
                          >
                            조회
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {combinationStats.map((stat, idx) => {
                          const percentage =
                            totalRounds > 0
                              ? ((stat.count / totalRounds) * 100).toFixed(2)
                              : '0.00';
                          return (
                            <TableRow key={idx} hover>
                              <TableCell>
                                <Stack direction="row" spacing={0.8}>
                                  {stat.combo.map((num) => (
                                    <LottoBall key={num} number={num} size={28} />
                                  ))}
                                </Stack>
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 'bold', color: 'primary.main' }}
                              >
                                {stat.count}회
                              </TableCell>
                              <TableCell align="center">{percentage}%</TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="soft"
                                  onClick={() =>
                                    handleOpenComboModal(stat.combo, stat.count, stat.matchedRounds)
                                  }
                                  disabled={stat.count === 0}
                                  startIcon={<Iconify icon="solar:eye-bold" />}
                                >
                                  회차 보기
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Tab 1: Match Count Summary */}
              {currentTab === 1 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {analysisMode === 'round' ? (
                      <>
                        {X}회차 당첨 번호 6개와{' '}
                        <strong>
                          {A} ~ {B}회차
                        </strong>
                        의 과거 당첨 번호가 몇 개 일치하는지 분석한 결과입니다.
                      </>
                    ) : (
                      <>
                        선택한 번호 6개와{' '}
                        <strong>
                          {A} ~ {B}회차
                        </strong>
                        의 과거 당첨 번호가 몇 개 일치하는지 분석한 결과입니다.
                      </>
                    )}
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>구분</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            출현 횟수
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            출현 비율
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            조회
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[5, 4, 3, 2].map((k) => {
                          const count = matchCountStats[k as 2 | 3 | 4 | 5]?.length || 0;
                          const percentage =
                            totalRounds > 0 ? ((count / totalRounds) * 100).toFixed(2) : '0.00';
                          return (
                            <TableRow key={k} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{k}개 번호 일치</TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 'bold', color: 'primary.main' }}
                              >
                                {count}회
                              </TableCell>
                              <TableCell align="center">{percentage}%</TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="soft"
                                  onClick={() => handleOpenMatchModal(k)}
                                  disabled={count === 0}
                                  startIcon={<Iconify icon="solar:eye-bold" />}
                                >
                                  회차 보기
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Tab 2: Individual Number Stats */}
              {currentTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    선택한 6개 번호가 각각{' '}
                    <strong>
                      {A} ~ {B}회차
                    </strong>
                    의 과거 당첨 번호에 단독으로 출현한 횟수를 분석한 결과입니다.
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}>
                            번호
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}
                          >
                            출현 횟수
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}
                          >
                            출현 비율
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 'bold', bgcolor: 'background.neutral' }}
                          >
                            조회
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {singleNumberStats.map((stat, idx) => {
                          const percentage =
                            totalRounds > 0
                              ? ((stat.count / totalRounds) * 100).toFixed(2)
                              : '0.00';
                          return (
                            <TableRow key={idx} hover>
                              <TableCell>
                                <LottoBall number={stat.number} size={32} />
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 'bold', color: 'primary.main' }}
                              >
                                {stat.count}회
                              </TableCell>
                              <TableCell align="center">{percentage}%</TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="soft"
                                  onClick={() =>
                                    handleOpenComboModal(
                                      [stat.number],
                                      stat.count,
                                      stat.matchedRounds
                                    )
                                  }
                                  disabled={stat.count === 0}
                                  startIcon={<Iconify icon="solar:eye-bold" />}
                                >
                                  회차 보기
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Modal Dialog for displaying matched rounds */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h6">{modalTitle}</Typography>
          <Typography variant="caption" color="text.secondary">
            회차 클릭 시 해당 회차 번호 정보를 가져옵니다.
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2, px: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              회차를 클릭하면 해당 회차 정보를 가져옵니다.
            </Typography>
            <ToggleButtonGroup
              value={modalSortOrder}
              exclusive
              onChange={(e, val) => val !== null && setModalSortOrder(val)}
              size="small"
              color="primary"
            >
              <ToggleButton value="desc" sx={{ px: 2, py: 0.5, fontWeight: 'bold' }}>
                최신순 (내림차순)
              </ToggleButton>
              <ToggleButton value="asc" sx={{ px: 2, py: 0.5, fontWeight: 'bold' }}>
                과거순 (오름차순)
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
            <Grid container spacing={2}>
              {sortedModalRounds.map((r, idx) => {
                const gapInfo = getRoundGapInfo(r.drwNo, highlightNumbers);
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Card
                      onClick={() => handleSelectRoundFromModal(r.drwNo)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: (theme) =>
                            varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                          transform: 'translateY(-2px)',
                          boxShadow: (theme) => theme.shadows[4],
                        },
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 'bold', color: 'text.primary' }}
                            >
                              {r.drwNo}회차
                            </Typography>
                            {gapInfo.isFirst ? (
                              <Box
                                sx={{
                                  px: 0.8,
                                  py: 0.1,
                                  borderRadius: 0.5,
                                  fontSize: '0.675rem',
                                  fontWeight: 'bold',
                                  bgcolor: (theme) =>
                                    varAlpha(theme.vars.palette.info.mainChannel, 0.1),
                                  color: 'info.main',
                                }}
                              >
                                첫 출현
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  px: 0.8,
                                  py: 0.1,
                                  borderRadius: 0.5,
                                  fontSize: '0.675rem',
                                  fontWeight: 'bold',
                                  bgcolor: (theme) =>
                                    varAlpha(theme.vars.palette.success.mainChannel, 0.1),
                                  color: 'success.main',
                                }}
                              >
                                +{gapInfo.gap}회차 만에
                              </Box>
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {r.drwNoDate}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.8} alignItems="center">
                          {r.numbers.map((num: number) => {
                            const isHighlighted = highlightNumbers.includes(num);
                            return (
                              <LottoBall
                                key={num}
                                number={num}
                                size={28}
                                highlighted={isHighlighted}
                              />
                            );
                          })}
                          <Typography variant="body2" sx={{ mx: 0.2, color: 'text.secondary' }}>
                            +
                          </Typography>
                          <LottoBall
                            number={r.bonus}
                            size={28}
                            highlighted={includeBonus && highlightNumbers.includes(r.bonus)}
                          />
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
