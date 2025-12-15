import { useMemo } from "react";

export function useLottoPattern(data: any[], jumpInterval: number = 0) {
  const { historyStats, predictCandidates, jumpHistoryStats, jumpPredictCandidates } = useMemo(() => {
    // Round -> Number -> Set<diff>
    const stats: Record<number, Record<number, Set<number>>> = {};
    const candidates: Record<number, Set<number>> = {}; // Number -> Set<diff>

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

    // 1. History Stats (Consecutive 3+) - Interval 1
    // Existing logic: diff != 0, absDiff <= 5
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

    // 3. Jump Stats (Interval 2/3/4/5)
    // Logic: diff can be 0, absDiff <= 4
    if (jumpInterval >= 2 && data.length > 2 * jumpInterval) {
        // History
        // We need 3 points: i, i+jump, i+2*jump
        for (let i = 0; i < data.length - 2 * jumpInterval; i++) {
            const r1 = data[i];
            const r2 = data[i + jumpInterval];
            const r3 = data[i + 2 * jumpInterval];

            for (const n1 of r1.numbers) {
                for (const n2 of r2.numbers) {
                    const diff = n1 - n2;
                    const absDiff = Math.abs(diff);

                    if (absDiff > 4) continue; // Only 0, 1, 2, 3, 4

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
        // Based on latest round (index 0) and round at jumpInterval
        // If we have r1 (latest) and r2 (latest + jump), next would be "future". 
        // Wait, standard prediction is looking at r1 (latest), r2 (previous). Next is r0 (future).
        // For jump, we look at r1 (latest), r2 (latest + jumpInterval). Next is future.
        // E.g. Jump 2. Latest is 1189. Reference is 1187. Predict 1191 (Future).
        // Since we are predicting the NEXT round (usually +1 from latest),
        // If jump is 2, and we have ... 1185, 1187, 1189. Next in series is 1191.
        // But the user usually just wants prediction candidates for the UPCOMING round.
        // If the pattern is "Next number at jump interval", does it mean it predicts for 1190 or 1191?
        // Usually "Prediction" means candidates for the VERY NEXT drawing.
        // If the pattern is Jump 2, observing 1185, 1187, 1189.
        // The series is 1185, 1187, 1189... next is 1191.
        // 1191 is 2 rounds away from 1189.
        // So this pattern predicts for 1191, NOT 1190.
        // But the `PredictRow` usually shows candidates for the NEXT round.
        // Should I show candidates if "Jump" is enabled?
        // User request: "1178회차에 11, 1180회차에 12, 1182회차에 13, 1184회차에 14... 표시해야 해"
        // It does not explicitly ask for *predictions* for jump.
        // "연속 버튼" has prediction logic.
        // User: "그리고 연속 버튼을 참고하되 아예 독립적인 기능으로 다뤄지도록 코드를 작성 해"
        // (Write logic as independent feature, referring to consecutive button)
        // If I follow consecutive button logic, I should probably also do prediction?
        // But consecutive pattern (Jump 1) predicts for next round (Jump 1).
        // Jump 2 predicts for 2 rounds later.
        // If I show it in `PredictRow` (which assumes next round), it might be misleading?
        // Or maybe strictly speaking: `PredictRow` shows numbers relevant for "Next Round".
        // Using "Jump 2" logic: We check if `Latest` is the point that *completes* or *continues* a pattern landing on Next Round.
        // Next Round is `Latest + 1`.
        // To be part of Jump 2 pattern landing on `Latest + 1`:
        // We need `Latest + 1 - 2 = Latest - 1` ? No.
        // If Jump 2: `(Latest + 1)` and `(Latest + 1 - 2)` ...
        // `Latest - 1` is index 1? No, `Latest` is index 0. `Latest - 1` (future) is not available.
        // `Latest + 1 - 2` index is `0 + 1`? No.
        // Rounds: 100 (idx 0), 99 (idx 1), 98 (idx 2).
        // Next is 101.
        // Jump 2 pattern for 101 would involve 101, 99, 97.
        // So we need 99 (idx 1) and 97 (idx 3).
        // If 99 and 97 form a partial pattern, we predict 101.
        // So we look at `data[1]` and `data[1 + jump]`.
        // Validate: r[1] and r[1+jump] diff check. If valid, candidate = r[1] + diff.
        // BUT, `PredictRow` is displayed *above* `data[0]` (Latest).
        // It represents the *Next* round (101).
        // So yes, I should check `data[jumpInterval - 1]` ... wait.
        // Index 0 is Round 100.
        // Index 1 is Round 99.
        // Index 2 is Round 98.
        // Index 3 is Round 97.
        // Target: Round 101.
        // Jump 2 means 101, 99, 97.
        // So we check Round 99 (idx 1) and Round 97 (idx 1 + 2 = 3).
        // General: Target Next Round (Idx -1 effectively).
        // Sequence: Next, Next - Jump, Next - 2*Jump.
        // Next - Jump = (Latest + 1) - Jump.
        // If Jump=2, Next-2 = Latest-1 (Round 99, Idx 1).
        // Next-4 = Latest-3 (Round 97, Idx 3).
        // So we check `data[jumpInterval - 1]` and `data[2*jumpInterval - 1]`.
        // Indices: `jumpInterval - 1` and `2 * jumpInterval - 1`.
        // Constraints: `2 * jumpInterval - 1` < data.length.
        
        const i1 = jumpInterval - 1;
        const i2 = 2 * jumpInterval - 1;

        if (i1 >= 0 && i2 < data.length) {
            const r1 = data[i1]; // Closer to future
            const r2 = data[i2]; // Further back

            for (const n1 of r1.numbers) {
                for (const n2 of r2.numbers) {
                     const diff = n1 - n2;
                     const absDiff = Math.abs(diff);

                     if (absDiff <= 4) { // Allow diff 0
                         const candidate = n1 + diff;
                         if (candidate >= 1 && candidate <= 45) {
                             if (!jumpCandidates[candidate]) jumpCandidates[candidate] = new Set();
                             jumpCandidates[candidate].add(absDiff);
                         }
                     }
                }
            }
        }
    }

    return { 
        historyStats: stats, 
        predictCandidates: candidates,
        jumpHistoryStats: jumpStats,
        jumpPredictCandidates: jumpCandidates
    };
  }, [data, jumpInterval]);

  return { historyStats, predictCandidates, jumpHistoryStats, jumpPredictCandidates };
}
