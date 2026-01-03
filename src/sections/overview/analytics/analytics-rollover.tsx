
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getBallColor, Ball as LottoBall } from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

type Props = {
    rounds: any[];
    includeBonus: boolean;
};

type LineCoords = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    count: number;
    showCount: boolean;
};

type RowConfig = {
    centerY: number;
    gapToNext: number;
    round: any;
};

export function AnalyticsRollover({ rounds, includeBonus }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Responsive constants
    const BALL_SIZE = isMobile ? 30 : 56;
    // Height of the content part of the row (ball + minimal padding)
    const ROW_CONTENT_HEIGHT = isMobile ? 44 : 80;
    const BALL_GAP = isMobile ? 6 : 20;
    const LEFT_PADDING = isMobile ? 70 : 100;
    const PLUS_GAP = isMobile ? 20 : 40;

    // Gap settings
    const GAP_SMALL = 0;
    const GAP_LARGE = isMobile ? 30 : 50;

    // Sort rounds descending (latest first)
    const sortedRounds = useMemo(() => {
        return [...rounds].sort((a, b) => b.drwNo - a.drwNo);
    }, [rounds]);

    // Helper to check if a round contains a number
    const roundHasNumber = (r: any, n: number) => {
        if (r.numbers.includes(n)) return true;
        if (includeBonus && r.bonus === n) return true;
        return false;
    };

    // Helper to check rollover between two rounds
    const checkRolloverBetween = (r1: any, r2: any) => {
        if (!r1 || !r2) return false;
        const nums1 = [...r1.numbers, ...(includeBonus ? [r1.bonus] : [])];
        const nums2 = [...r2.numbers, ...(includeBonus ? [r2.bonus] : [])];
        return nums1.some(n => nums2.includes(n));
    };

    // Calculate Layout (Y positions and Gaps)
    const { rowConfigs, totalHeight } = useMemo(() => {
        let currentY = 0;
        const configs: RowConfig[] = [];

        sortedRounds.forEach((round, index) => {
            const nextRound = sortedRounds[index + 1];
            const hasRollover = checkRolloverBetween(round, nextRound);
            const gap = hasRollover ? GAP_LARGE : GAP_SMALL;

            // Center Y of this row
            const centerY = currentY + ROW_CONTENT_HEIGHT / 2;

            configs.push({
                centerY,
                gapToNext: gap,
                round
            });

            // Advance Y
            if (index < sortedRounds.length - 1) {
                currentY += ROW_CONTENT_HEIGHT + gap;
            } else {
                currentY += ROW_CONTENT_HEIGHT;
            }
        });

        return { rowConfigs: configs, totalHeight: currentY };
    }, [sortedRounds, includeBonus, ROW_CONTENT_HEIGHT, GAP_SMALL, GAP_LARGE]);

    // Calculate lines
    const lines = useMemo(() => {
        const calculatedLines: LineCoords[] = [];

        rowConfigs.forEach((config, index) => {
            const nextIndex = index + 1;
            if (nextIndex >= rowConfigs.length) return;

            const currentRound = config.round;
            const prevRound = rowConfigs[nextIndex].round;

            const getDisplayBalls = (r: any) => {
                const nums = [...r.numbers].map((n, i) => ({ val: n, type: 'main', originalIdx: i }));
                if (includeBonus) {
                    nums.push({ val: r.bonus, type: 'bonus', originalIdx: 6 });
                }
                return nums;
            };

            const currentBalls = getDisplayBalls(currentRound);
            const prevBalls = getDisplayBalls(prevRound);

            currentBalls.forEach((currBall, currIdx) => {
                // Find this number in the previous round
                const prevBallIdx = prevBalls.findIndex(b => b.val === currBall.val);

                if (prevBallIdx !== -1) {
                    const ballNum = currBall.val;

                    // Calculate Streak Length
                    let streakCount = 1; // Start with 1 (Rollover count)
                    let k = nextIndex + 1;
                    while (k < rowConfigs.length) {
                        if (roundHasNumber(rowConfigs[k].round, ballNum)) {
                            streakCount++;
                            k++;
                        } else {
                            break;
                        }
                    }

                    // Determine if we should show the count
                    let isLatest = true;
                    if (index > 0) {
                        if (roundHasNumber(rowConfigs[index - 1].round, ballNum)) {
                            isLatest = false;
                        }
                    }

                    const showCount = isLatest;

                    // X computation
                    const getX = (idx: number, isBonus: boolean) => {
                        let x = LEFT_PADDING + idx * (BALL_SIZE + BALL_GAP);
                        if (idx >= 6) x += PLUS_GAP;
                        return x + BALL_SIZE / 2;
                    };

                    const startX = getX(currIdx, currBall.type === 'bonus');
                    const startY = config.centerY;

                    const endX = getX(prevBallIdx, prevBalls[prevBallIdx].type === 'bonus');
                    const endY = rowConfigs[nextIndex].centerY;

                    const color = getBallColor(currBall.val);

                    calculatedLines.push({
                        x1: startX,
                        y1: startY,
                        x2: endX,
                        y2: endY,
                        color,
                        count: streakCount,
                        showCount
                    });
                }
            });
        });

        return calculatedLines;
    }, [rowConfigs, includeBonus, BALL_SIZE, BALL_GAP, LEFT_PADDING, PLUS_GAP]);

    return (
        <Card sx={{ p: 3, borderRadius: 2, minHeight: 500 }}>
            {/* Center Container */}
            <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', pb: 2 }}>
                <Box sx={{ position: 'relative', width: 'fit-content' }}>
                    {/* SVG Overlay for Lines */}
                    <svg
                        width="100%"
                        height={totalHeight}
                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
                    >
                        {lines.map((line, i) => (
                            <g key={i}>
                                <line
                                    x1={line.x1}
                                    y1={line.y1}
                                    x2={line.x2}
                                    y2={line.y2}
                                    stroke={line.color}
                                    strokeWidth={isMobile ? "2" : "3"}
                                    strokeOpacity="0.6"
                                />

                                {line.showCount && (
                                    <text
                                        x={(line.x1 + line.x2) / 2}
                                        y={(line.y1 + line.y2) / 2}
                                        fill="text.primary"
                                        fontSize={isMobile ? "12" : "14"}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        style={{
                                            fill: '#000',
                                            paintOrder: 'stroke',
                                            stroke: '#fff',
                                            strokeWidth: '4px',
                                        }}
                                    >
                                        {line.count}
                                    </text>
                                )}
                            </g>
                        ))}
                    </svg>

                    {/* Rows */}
                    <Stack spacing={0}>
                        {rowConfigs.map((config, i) => (
                            <Stack
                                key={config.round.drwNo}
                                direction="row"
                                alignItems="center"
                                sx={{
                                    height: ROW_CONTENT_HEIGHT,
                                    mb: i < rowConfigs.length - 1 ? `${config.gapToNext}px` : 0,
                                    position: 'relative',
                                    zIndex: 2
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        width: LEFT_PADDING,
                                        pl: isMobile ? 1 : 2,
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        fontSize: isMobile ? '0.75rem' : '1rem'
                                    }}
                                >
                                    {config.round.drwNo}회
                                </Typography>

                                <Stack direction="row" alignItems="center" spacing={`${BALL_GAP}px`}>
                                    {config.round.numbers.map((num: number) => (
                                        <Ball key={num} num={num} size={BALL_SIZE} fontSize={isMobile ? '0.85rem' : '1.25rem'} />
                                    ))}

                                    {includeBonus && (
                                        <>
                                            <Typography sx={{ mx: isMobile ? 0.5 : 1, color: 'text.disabled', fontSize: isMobile ? '1rem' : '1.5rem' }}>+</Typography>
                                            <Ball num={config.round.bonus} size={BALL_SIZE} fontSize={isMobile ? '0.85rem' : '1.25rem'} />
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </Card>
    );
}

function Ball({ num, size, fontSize }: { num: number; size: number; fontSize: string }) {
    return (
        <LottoBall
            sx={{
                width: size,
                height: size,
                fontSize: fontSize,
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${getBallColor(
                    num
                )}`,
                zIndex: 2,
                boxShadow: (theme) => theme.shadows[4],
            }}
        >
            {num}
        </LottoBall>
    );
}
