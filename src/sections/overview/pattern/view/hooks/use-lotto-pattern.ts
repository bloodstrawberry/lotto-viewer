import { useMemo } from "react";

// Option types: 0 (Off), 99 (All), 1-5 (Specific Diff)
export type PatternOption = number;

export function useLottoPattern(data: any[], consecutiveOption: PatternOption, jumpOption: PatternOption) {
  const { historyStats, predictCandidates, jumpHistoryStats, jumpPredictCandidates } = useMemo(() => {
    // Round -> Number -> Set<diff>
    const stats: Record<number, Record<number, Set<number>>> = {};
    const candidates: Record<number, Set<number>> = {}; 

    const jumpStats: Record<number, Record<number, Set<number>>> = {};
    const jumpCandidates: Record<number, Set<number>> = {};
    
    if (!data || data.length < 3) {
        return { 
            historyStats: stats, 
            predictCandidates: candidates,
            jumpHistoryStats: jumpStats,
            jumpPredictCandidates: jumpCandidates
        };
    }

    const addStat = (targetStats: Record<number, Record<number, Set<number>>>, drwNo: number, num: number, diff: number) => {
        if (!targetStats[drwNo]) targetStats[drwNo] = {};
        if (!targetStats[drwNo][num]) targetStats[drwNo][num] = new Set();
        targetStats[drwNo][num].add(diff);
    };

    // Helper to check if a diff matches the option
    const isDiffAllowed = (diff: number, option: PatternOption) => {
        if (option === 0) return false;
        if (option === 99) return true; // All
        return diff === option;
    };

    // 1. History Stats (Consecutive 3+) - Interval 1
    if (consecutiveOption !== 0) {
        for (let i = 0; i < data.length - 2; i++) {
            const r1 = data[i];     // Newer
            const r2 = data[i+1];
            const r3 = data[i+2];   // Older

            for (const n1 of r1.numbers) {
                for (const n2 of r2.numbers) {
                    const diff = n1 - n2; 
                    const absDiff = Math.abs(diff);

                    // Consecutive rule: diff != 0, absDiff <= 5
                    if (diff === 0 || absDiff > 5) continue;
                    
                    if (!isDiffAllowed(absDiff, consecutiveOption)) continue;

                    const n3 = n2 - diff;
                    if (r3.numbers.includes(n3)) {
                         addStat(stats, r1.drwNo, n1, absDiff);
                         addStat(stats, r2.drwNo, n2, absDiff);
                         addStat(stats, r3.drwNo, n3, absDiff);
                    }
                }
            }
        }

        // 2. Predict Candidates (Extension of latest sequence) - Interval 1
        if (data.length >= 2) {
            const r1 = data[0]; // Latest
            const r2 = data[1]; // Previous
            
            for (const n1 of r1.numbers) {
                for (const n2 of r2.numbers) {
                     const diff = n1 - n2;
                     const absDiff = Math.abs(diff);

                     if (diff !== 0 && absDiff <= 5 && isDiffAllowed(absDiff, consecutiveOption)) {
                         const candidate = n1 + diff;
                         if (candidate >= 1 && candidate <= 45) {
                             if (!candidates[candidate]) candidates[candidate] = new Set();
                             candidates[candidate].add(absDiff);
                         }
                     }
                }
            }
        }
    }

    // 3. Jump Stats (Intervals 2, 3, 4, 5)
    if (jumpOption !== 0) {
        const intervals = [2, 3, 4, 5];
        
        intervals.forEach(jumpInterval => {
            if (data.length <= 2 * jumpInterval) return;

            // History
            for (let i = 0; i < data.length - 2 * jumpInterval; i++) {
                const r1 = data[i];
                const r2 = data[i + jumpInterval];
                const r3 = data[i + 2 * jumpInterval];

                for (const n1 of r1.numbers) {
                    for (const n2 of r2.numbers) {
                        const diff = n1 - n2;
                        const absDiff = Math.abs(diff);

                        if (absDiff > 5) continue; // Allow 0, up to 5
                        if (!isDiffAllowed(absDiff, jumpOption)) continue;

                        const n3 = n2 - diff;
                        if (r3.numbers.includes(n3)) {
                            addStat(jumpStats, r1.drwNo, n1, absDiff);
                            addStat(jumpStats, r2.drwNo, n2, absDiff);
                            addStat(jumpStats, r3.drwNo, n3, absDiff);
                        }
                    }
                }
            }

            // Predict Candidates for Jump
            // Target: Next Round (Idx -1). Pattern: Next, Latest-Idx(Interval-1), Latest-Idx(2*Interval-1)
            const i1 = jumpInterval - 1;
            const i2 = 2 * jumpInterval - 1;

            if (i1 >= 0 && i2 < data.length) {
                const r1 = data[i1]; 
                const r2 = data[i2]; 

                for (const n1 of r1.numbers) {
                    for (const n2 of r2.numbers) {
                         const diff = n1 - n2;
                         const absDiff = Math.abs(diff);

                         if (absDiff <= 5 && isDiffAllowed(absDiff, jumpOption)) {
                             const candidate = n1 + diff;
                             if (candidate >= 1 && candidate <= 45) {
                                 if (!jumpCandidates[candidate]) jumpCandidates[candidate] = new Set();
                                 jumpCandidates[candidate].add(absDiff);
                             }
                         }
                    }
                }
            }
        });
    }

    return { 
        historyStats: stats, 
        predictCandidates: candidates,
        jumpHistoryStats: jumpStats,
        jumpPredictCandidates: jumpCandidates
    };
  }, [data, consecutiveOption, jumpOption]);

  return { historyStats, predictCandidates, jumpHistoryStats, jumpPredictCandidates };
}
