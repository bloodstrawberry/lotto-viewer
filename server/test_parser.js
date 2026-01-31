const { parseLottoLog } = require('./lotto_html_parser.js');
const path = require('path');

const result = parseLottoLog(path.join(__dirname, 'crawler.html'));
console.log(JSON.stringify(result, null, 2));
