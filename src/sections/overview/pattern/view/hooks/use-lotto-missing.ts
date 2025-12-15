import { useState, useEffect } from "react";

export function useLottoMissing(data: any[]) {
  const [missingStats, setMissingStats] = useState<Record<number, Record<number, number>>>({});

  useEffect(() => {
    if (!data || data.length === 0) return;

    // 각 회차별 미출현 번호 누적 계산 (과거 -> 최신)
    const sortedAsc = [...data].sort((a, b) => a.drwNo - b.drwNo);
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
  }, [data]);

  return missingStats;
}
