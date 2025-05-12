# OrdiscanMCP v1

An MCP Framework HTTP server implementation with Ordiscan API integration.

## Features

- HTTP Stream transport on port 1337
- Stream response mode for real-time communication
- Comprehensive Ordiscan API integration (29 tools)
- TypeScript implementation with Zod schema validation
- Detailed error handling and response formatting
- Direct API connection (no proxy required)
- Bearer token authentication
- Rate limiting handled by Ordiscan API

## API Connection & Authentication

### Direct Connection
All tools connect directly to the Ordiscan API (`api.ordiscan.com`) without requiring any proxy. This ensures:
- Faster response times
- Reduced latency
- No additional configuration needed
- Direct error handling
- Automatic rate limiting by Ordiscan API

### Authentication
Every tool requires authentication using a Bearer token:
- API key must be provided either:
  1. As a parameter in each tool call (`apiKey` parameter)
  2. Through the `ORDISCAN_API_KEY` environment variable
- Authentication uses Bearer token format
- All requests include the `Authorization: Bearer <your-api-key>` header
- Invalid or missing API keys will result in authentication errors

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
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
      ]
    }
  }
}
```
url: (http://localhost:1337/mcp) Remote: (https://ordiscan-mcp-v1.onrender.com/mcp)

4. Start the server:
```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```
Pass in the key with a request one time, good to go.

## Project Structure

```
ordiscanmcpv1/
├── src/
│   ├── tools/
│   │   ├── ordiscan-utils.ts
│   │   ├── ordiscan.ts            # Main Ordiscan Tool
│   │   │
│   │   ├── # Address Tools
│   │   ├── ordiscan-utxo.ts
│   │   ├── ordiscan-inscriptions.ts
│   │   ├── ordiscan-inscriptions-detail.ts
│   │   ├── ordiscan-runes-balance.ts
│   │   ├── ordiscan-brc20-balance.ts
│   │   ├── ordiscan-rare-sats.ts
│   │   │
│   │   ├── # Activity Tools
│   │   ├── ordiscan-inscriptions-activity.ts
│   │   ├── ordiscan-runes-activity.ts
│   │   ├── ordiscan-brc20-activity.ts
│   │   │
│   │   ├── # Transaction Tools
│   │   ├── ordiscan-tx-info.ts
│   │   ├── ordiscan-tx-inscriptions.ts
│   │   ├── ordiscan-tx-inscription-transfers.ts
│   │   ├── ordiscan-tx-runes.ts
│   │   │
│   │   ├── # Inscription Tools
│   │   ├── ordiscan-inscription-info.ts
│   │   ├── ordiscan-inscription-traits.ts
│   │   ├── ordiscan-inscriptions-list.ts
│   │   ├── ordiscan-inscriptions-detail.ts
│   │   │
│   │   ├── # Collection Tools
│   │   ├── ordiscan-collections-list.ts
│   │   ├── ordiscan-collection-info.ts
│   │   ├── ordiscan-collection-inscriptions.ts
│   │   │
│   │   ├── # Rune Tools
│   │   ├── ordiscan-runes-list.ts
│   │   ├── ordiscan-rune-market.ts
│   │   ├── ordiscan-rune-name-unlock.ts
│   │   │
│   │   ├── # BRC-20 Tools
│   │   ├── ordiscan-brc20-list.ts
│   │   ├── ordiscan-brc20-info.ts
│   │   │
│   │   ├── # Sat Tools
│   │   ├── ordiscan-sat-info.ts
│   │   ├── ordiscan-utxo-rare-sats.ts
│   │   └── ordiscan-utxo-sat-ranges.ts
│   │
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Parameter Handling

All tools use robust parameter handling utilities from `ordiscan-utils.ts`:

### Flexible Number Handling
- `flexibleNumber()`: Accepts both string and number inputs for numeric parameters
  - Automatically converts string numbers to integers
  - Validates numeric ranges where applicable
  - Used for pagination, ordinal numbers, and block heights

### Flexible Enum Handling
- `flexibleEnum()`: Validates string inputs against predefined values
  - Used for sort orders ('newest'/'oldest')
  - Used for type filters and other enumerated values
  - Provides clear error messages for invalid inputs

These utilities ensure consistent parameter handling across all tools while maintaining type safety and validation.

## Available Tools (29 Total)

### 1. Main Tool
- **ordiscan_main**: General-purpose tool for rune information and status

### 2. Address Tools (6)
- **UTXO Tool**: Get all UTXOs owned by a Bitcoin address
- **Basic and Detailed Inscription Tools**: Get inscription information for an address
- **Runes Balance Tool**: Get rune balances for an address
- **BRC-20 Balance Tool**: Get BRC-20 token balances for an address
- **Rare Sats Tool**: Get rare sats owned by an address

### 3. Activity Tools (3)
- **Inscriptions Activity Tool**: Track inscription transfers for an address
- **Runes Activity Tool**: Track rune transfers for an address
- **BRC-20 Activity Tool**: Track BRC-20 token transfers for an address

### 4. Transaction Tools (4)
- **Transaction Info Tool**: Get detailed transaction information
- **Transaction Inscriptions Tool**: Get inscriptions in a transaction
- **Transaction Inscription Transfers Tool**: Track inscription transfers in a transaction
- **Transaction Runes Tool**: Track rune transfers in a transaction

### 5. Inscription Tools (4)
- **Inscription Info Tool**: Get detailed information about an inscription
- **Inscription Traits Tool**: Get traits for an inscription
- **Inscriptions List Tool**: Get a paginated list of all inscriptions
- **Inscription Transfers Tool**: Track transfers of an inscription

### 6. Collection Tools (3)
- **Collections List Tool**: Get a paginated list of collections
- **Collection Info Tool**: Get detailed information about a collection
- **Collection Inscriptions Tool**: Get inscriptions in a collection

### 7. Rune Tools (3)
- **Runes List Tool**: Get a list of all runes
- **Rune Market Info Tool**: Get market information for a rune
- **Rune Name Unlock Tool**: Check rune name availability

### 8. BRC-20 Tools (2)
- **BRC-20 List Tool**: Get a list of all BRC-20 tokens
- **BRC-20 Token Info Tool**: Get detailed information about a BRC-20 token

### 9. Sat Tools (3)
- **Sat Info Tool**: Get information about a specific sat
- **UTXO Rare Sats Tool**: Get rare sats in a UTXO
- **UTXO Sat Ranges Tool**: Get sat ranges in a UTXO

## Tool Examples

### Inscription Info Tool

Get detailed information about a specific inscription.

**Tool Name:** `ordiscan_inscription_info`

**Parameters:**
- `id` (string): The inscription ID (e.g. b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735i0)
- `apiKey` (string, optional): Your Ordiscan API key

**Example Response:**
```json
{
  "success": true,
  "formatted": {
    "id": "b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735i0",
    "number": 123456,
    "type": "image/png",
    "timestamp": "2024-01-01 12:00:00",
    "sat": "1,234,567",
    "content_url": "https://ordinals.com/content/...",
    "collection": "example-collection",
    "owner": {
      "address": "bc1...",
      "output": "txid:vout"
    },
    "genesis": {
      "address": "bc1...",
      "output": "txid:vout"
    }
  }
}
```

### Rune Market Tool

Get market information for a specific rune.

**Tool Name:** `ordiscan_rune_market`

**Parameters:**
- `name` (string): The unique name of the rune (without spacers)
- `apiKey` (string, optional): Your Ordiscan API key

**Example Response:**
```json
{
  "success": true,
  "formatted": {
    "price": {
      "sats": "1,234.56",
      "usd": "$0.50"
    },
    "market_cap": {
      "btc": "12.3456",
      "usd": "$500,000"
    }
  }
}
```

### BRC-20 Info Tool

Get detailed information about a BRC-20 token.

**Tool Name:** `ordiscan_brc20_info`

**Parameters:**
- `tick` (string): The unique tick of the token
- `apiKey` (string, optional): Your Ordiscan API key

**Example Response:**
```json
{
  "success": true,
  "formatted": {
    "tick": "ORDI",
    "supply": {
      "max": "21,000,000",
      "minted": "15,000,000",
      "remaining": "6,000,000",
      "percent_minted": "71.43%"
    },
    "market": {
      "price_usd": "$1.23",
      "market_cap_usd": "$18,450,000",
      "fully_diluted_market_cap_usd": "$25,830,000"
    }
  }
}
```

## Error Handling

All tools include comprehensive error handling:
- API key validation
- Network request errors
- Invalid input validation
- Rate limiting responses from Ordiscan API
- Detailed error messages

## Response Formatting

Each tool provides both raw and formatted responses:
- Raw data in the `data` field
- Human-readable formatted data in the `formatted` field
- Consistent error format across all tools
- Proper number formatting and date localization

## Security Recommendations

### API Key Management
- Never hardcode API keys in your code
- Use environment variables for API key storage
- Rotate API keys periodically
- Use different API keys for development and production

### Error Handling
The server implements secure error handling:
- No sensitive information in error messages
- Proper HTTP status codes
- Structured error responses
- Logging of errors without exposing internals

### Input Validation
All tools use strict input validation:
- Zod schema validation for all parameters
- Type checking with TypeScript
- Flexible number handling for numeric inputs
- String validation for enumerated values

### Rate Limiting
Rate limiting is handled by the Ordiscan API:
- No additional rate limiting needed
- API key-based rate limits
- Proper error responses for rate limit exceeded
- Automatic rate limit handling
