const fs = require('fs'); const content = fs.readFileSync('src/lib/mockData.ts', 'utf8'); fs.writeFileSync('src/lib/mockData.ts', content.replace(/v21/g, 'v22'));
