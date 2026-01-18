const fs = require('fs');
const path = require('path');

/**
 * Parses the lotto_log.txt file to extract lottery draw information.
 * @param {string} [filePath] - Optional path to the log file. Defaults to 'lotto_log.txt' in the same directory.
 * @returns {object} - JSON object containing the parsed data.
 */
function parseLottoLog(filePathOrContent) {
    let htmlContent = '';
    
    // Check if input is content (starts with <) or file path
    if (filePathOrContent && typeof filePathOrContent === 'string' && (filePathOrContent.trim().startsWith('<') || filePathOrContent.includes('DOCTYPE'))) {
        htmlContent = filePathOrContent;
    } else {
        const targetPath = filePathOrContent || path.join(__dirname, 'lotto_log.txt');
        
        if (!fs.existsSync(targetPath)) {
            console.error(`File not found: ${targetPath}`);
            return { returnValue: "fail", message: "File not found" };
        }

        try {
            htmlContent = fs.readFileSync(targetPath, 'utf-8');
        } catch (err) {
            console.error('Error reading file:', err);
            return { returnValue: "fail", message: "Error reading file" };
        }
    }

    // Helper functions
    const getIntVal = (regex, content) => {
        const match = content.match(regex);
        return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    };
    
    // Extract Data
    
    // 1. Draw Number
    // <div class="round-num">\n 1207 \n <span
    const drwNo = getIntVal(/<div class="round-num">\s*([0-9]+)/, htmlContent);

    // 2. Date
    // <div class="today-date">\n 2026년 01월 17일 \n
    const dateArr = htmlContent.match(/<div class="today-date">\s*([0-9]{4})년 ([0-9]{2})월 ([0-9]{2})일/);
    const drwNoDate = dateArr ? `${dateArr[1]}-${dateArr[2]}-${dateArr[3]}` : "";

    // 3. Balls (Winning Numbers + Bonus)
    // Looks for: <div class="result-ball num-0n">\n 10 \n </div>
    const ballRegex = /<div class="result-ball[^"]*">\s*([0-9]+)\s*<\/div>/g;
    const balls = [];
    let bMatch;
    while ((bMatch = ballRegex.exec(htmlContent)) !== null) {
        balls.push(parseInt(bMatch[1], 10));
    }
    
    // 4. Winning Amounts & Counts
    // Matches patterns like: rnk1SumWnAmt">29,464,450,133
    // We look for the class name followed by optional characters, closing brace, and the value.
    const getRnkVal = (key) => {
        // Regex logic:
        // 1. match the key (e.g. rnk1SumWnAmt)
        // 2. until the closing tag char '>'
        // 3. capture the number inside the tag
        const re = new RegExp(`${key}[^>]*>\\s*([0-9,]+)`, 'i'); 
        return getIntVal(re, htmlContent);
    };

    const firstAccumamnt = getRnkVal('rnk1SumWnAmt');
    const firstPrzwnerCo = getRnkVal('rnk1WnNope');
    const firstWinamnt = getRnkVal('rnk1WnAmt');

    // Calculate Total Sell Amount: (Sum of total prizes for ranks 1-5) * 2
    const totalPrizeSum = 
        getRnkVal('rnk1SumWnAmt') +
        getRnkVal('rnk2SumWnAmt') +
        getRnkVal('rnk3SumWnAmt') +
        getRnkVal('rnk4SumWnAmt') +
        getRnkVal('rnk5SumWnAmt');
        
    const totSellamnt = totalPrizeSum * 2;

    const result = {
        totSellamnt,
        returnValue: "success",
        drwNoDate,
        firstWinamnt,
        drwtNo6: balls[5] || 0,
        drwtNo4: balls[3] || 0,
        firstPrzwnerCo,
        drwtNo5: balls[4] || 0,
        bnusNo: balls[6] || 0,
        firstAccumamnt,
        drwNo,
        drwtNo2: balls[1] || 0,
        drwtNo3: balls[2] || 0,
        drwtNo1: balls[0] || 0
    };

    return result;
}

module.exports = { parseLottoLog };

