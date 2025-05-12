# Ordiscan MCP Framework Server Guide

This guide walks you through understanding and using the Ordiscan MCP Framework server, which provides tools for interacting with the Ordiscan API to fetch Bitcoin Ordinals and Runes data.

## 1. Project Setup

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager
- An Ordiscan API key

### Installation
```bash
git clone [your-repository-url]
cd ordiscanmcpv1
npm install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
ORDISCAN_API_KEY=your-api-key-here
```

## 2. Project Structure
```
ordiscanmcpv1/
├── src/
│   ├── tools/
│   │   ├── ordiscan.ts       # Main Ordiscan API tool
│   │   ├── address.ts        # Address-related tools
│   │   ├── inscription.ts    # Inscription-related tools
│   │   ├── rune.ts          # Rune-related tools
│   │   ├── brc20.ts         # BRC-20 token tools
│   │   └── utils.ts         # Shared utilities
│   └── index.ts             # Server entry point
├── dist/                    # Compiled JavaScript files
├── package.json
├── tsconfig.json
└── README.md
```

## 3. Available Tools

### Main Ordiscan Tool
- `ordiscan_main`: General rune information and status
- Parameters:
  - `runeName`: The unique name of the rune
  - `apiKey`: (Optional) Your Ordiscan API key
  - `blockHeight`: (Optional) Current block height

### Address Tools
- `ordiscan_address_brc20`: Get BRC-20 token balances
- `ordiscan_address_inscriptions`: Get inscription IDs
- `ordiscan_address_rare_sats`: Get rare sats
- `ordiscan_address_runes`: Get rune balances
- `ordiscan_address_utxos`: Get UTXOs and associated data

### BRC-20 Tools
- `ordiscan_brc20_info`: Get token information
- `ordiscan_brc20_list`: List BRC-20 tokens

### Collection Tools
- `ordiscan_collection_info`: Get collection details
- `ordiscan_collections_list`: List indexed collections

### Inscription Tools
- `ordiscan_inscription_info`: Get inscription details
- `ordiscan_inscription_traits`: Get inscription traits

### Transaction Tools
- `ordiscan_tx_info`: Get transaction information
- `ordiscan_tx_inscription_transfers`: Get inscription transfers
- `ordiscan_tx_inscriptions`: Get new inscriptions
- `ordiscan_tx_runes`: Get minted and transferred runes

### UTXO Tools
- `ordiscan_utxo_rare_sats`: Get rare sats in UTXO
- `ordiscan_utxo_sat_ranges`: Get sat ranges in UTXO

## 4. Using the Tools

### Example: Fetching Rune Information
```typescript
const response = await mcpClient.call("ordiscan_main", {
  runeName: "example",
  apiKey: process.env.ORDISCAN_API_KEY
});
```

### Example: Getting Address Balances
```typescript
const response = await mcpClient.call("ordiscan_address_brc20", {
  address: "bc1...",
  apiKey: process.env.ORDISCAN_API_KEY
});
```

## 5. Error Handling

All tools implement comprehensive error handling:
```typescript
try {
  const response = await tool.execute(input);
  if (response.error) {
    console.error('Tool execution failed:', response.error);
    return;
  }
  console.log('Success:', response.data);
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## 6. Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## 7. Best Practices

### API Key Management
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement API key rotation if needed

### Rate Limiting
- Respect Ordiscan API rate limits
- Implement caching where appropriate
- Add retry logic for failed requests

### Error Handling
- Validate all inputs using Zod schemas
- Handle API-specific error codes
- Provide meaningful error messages

### Type Safety
- Use TypeScript interfaces for API responses
- Implement proper type checking
- Use utility types for common patterns

## 8. Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

3. Configure your MCP client:
```json
{
  "mcpServers": {
    "ordiscanmcpv1": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-deployed-server.com/mcp"
      ],
      "env": {
        "ORDISCAN_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 9. Troubleshooting

### Common Issues
1. API Key Issues
   - Verify API key is set in environment
   - Check API key permissions
   - Ensure key is properly formatted

2. Connection Issues
   - Verify server is running
   - Check network connectivity
   - Confirm port availability

3. Type Errors
   - Update TypeScript definitions
   - Check input validation
   - Verify API response types

### Getting Help
- Check the [Ordiscan API Documentation](https://docs.ordiscan.com)
- Review GitHub Issues
- Contact support team

## 10. Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please follow our coding standards:
- Use TypeScript
- Add comprehensive tests
- Document all changes
- Follow ESLint rules

## 11. License

This project is licensed under the MIT License - see the LICENSE file for details. 