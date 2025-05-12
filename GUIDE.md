# Building Your Own MCP Server

This guide walks you through the process of building your own MCP Framework server, using our Ordiscan implementation as an example.

## 1. Project Setup

### Initialize Project
```bash
mkdir your-mcp-server
cd your-mcp-server
npm init -y
```

### Install Dependencies
```bash
npm install mcp-framework typescript zod @types/node
npm install --save-dev ts-node nodemon
```

### Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## 2. Project Structure

Create the following directory structure:
```
your-mcp-server/
├── src/
│   ├── tools/
│   │   ├── your-tool-1.ts
│   │   ├── your-tool-2.ts
│   │   └── utils.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 3. Create Utility Functions

Create `src/tools/utils.ts` for common functionality:
```typescript
import { z } from "zod";

// Flexible number handling
export const flexibleNumber = () => z.union([z.string(), z.number()]).optional().transform(val => {
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  }
  return val;
});

// Flexible enum handling
export const flexibleEnum = <T extends readonly string[]>(values: T) => 
  z.string().optional().refine(val => !val || values.includes(val as T[number]), {
    message: `Value must be one of: ${values.join(', ')}`
  });
```

## 4. Implement Your First Tool

Create a new tool in `src/tools/`:
```typescript
import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { flexibleNumber } from "./utils";

interface ToolInput {
  param1: string;
  param2?: number;
}

interface ToolResponse {
  data: any;
}

class YourFirstTool extends MCPTool<ToolInput> {
  name = "your_tool_name";
  description = "Description of what your tool does";

  schema = {
    param1: {
      type: z.string(),
      description: "Description of param1",
    },
    param2: {
      type: flexibleNumber(),
      description: "Description of param2",
    },
  };

  async execute(input: ToolInput) {
    try {
      // Your tool logic here
      return {
        success: true,
        data: {/* your data */},
        formatted: {/* formatted data */}
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }
}

export default YourFirstTool;
```

## 5. Set Up Server Entry Point

Create `src/index.ts`:
```typescript
import { MCPServer } from "mcp-framework";
import YourFirstTool from "./tools/your-first-tool";

const server = new MCPServer({
  port: 1337,
  cors: true
});

// Register your tools
server.registerTool(new YourFirstTool());

// Start the server
server.start().then(() => {
  console.log('MCP Server running on port 1337');
}).catch(error => {
  console.error('Failed to start server:', error);
});
```

## 6. Add NPM Scripts

Update `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts"
  }
}
```

## 7. Best Practices

### Error Handling
- Always wrap API calls in try/catch blocks
- Return structured error messages
- Include both raw and formatted data in responses
- Validate all inputs using Zod schemas

### Type Safety
- Use TypeScript interfaces for all data structures
- Implement proper type checking
- Use utility functions for common operations

### Code Organization
- Keep files under 500 lines
- Group related tools in directories
- Use consistent naming conventions
- Document all parameters and return types

### Testing
- Write unit tests for each tool
- Test edge cases and error conditions
- Validate response formats
- Test parameter validation

## 8. Running Your Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 9. Documentation

Create comprehensive documentation including:
- Tool descriptions and parameters
- Example requests and responses
- Error handling guidelines
- Setup instructions
- API authentication if required

## 10. Maintenance

- Keep dependencies updated
- Monitor server performance
- Log errors and usage metrics
- Implement proper security measures
- Regular code reviews and updates 