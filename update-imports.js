import fs from 'fs';
import path from 'path';

const toolsDir = './src/tools';

// Read all TypeScript files in the tools directory
fs.readdirSync(toolsDir)
  .filter(file => file.endsWith('.ts'))
  .forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove all existing ordiscan-utils imports
    content = content.replace(/import\s*{[^}]*}\s*from\s*['"]\.?\.?\/.*ordiscan-utils\.js['"]\s*;?\s*\n?/g, '');
    content = content.replace(/import\s*utils\s*from\s*['"]\.?\.?\/.*ordiscan-utils\.js['"]\s*;?\s*\n?/g, '');

    // Add the new import at the top of the file after other imports
    if (!content.includes('from "../utils/ordiscan-utils.js"')) {
      content = content.replace(
        /(import.*from.*[\r\n]+)/,
        `$1import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";\n\n`
      );
    }

    // Replace any remaining utils.flexibleNumber() with flexibleNumber()
    content = content.replace(/utils\.flexibleNumber\(\)/g, 'flexibleNumber()');
    content = content.replace(/utils\.flexibleEnum\(/g, 'flexibleEnum(');

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }); 