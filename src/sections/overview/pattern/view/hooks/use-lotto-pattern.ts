import { useMemo } from "react";

export function useLottoPattern(data: any[]) {
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

  return { historyStats, predictCandidates };
}
