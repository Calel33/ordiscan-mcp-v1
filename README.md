# Ordiscan MCP API with Lazy Loading

A Model Context Protocol (MCP) server for the Ordiscan API with optimized lazy tool loading.

## Features

- **Lazy Tool Loading**: Tools are only loaded when they're actually used, reducing memory usage and startup time
- **HTTP Stream Transport**: Uses the MCP HTTP Stream transport for reliable API access
- **Tool Registry**: Central registry of all available tools with their file paths
- **Tool Caching**: Once loaded, tools are cached to prevent redundant loading
- **Optional Preloading**: Ability to preload frequently used tools at startup
- **Environment-Based Configuration**: Server port configurable via environment variables

## Architecture

The server is built using the following components:

### 1. Lazy MCP Server

A custom extension of the MCP Server that handles lazy loading of tools on demand. It automatically registers tools with the MCP server but delays loading their implementation until they're requested.

Key features:
- Overrides the tool resolution method to load tools dynamically
- Maintains a cache of loaded tools for performance
- Supports preloading of specified tools at startup
- Provides detailed logging for debugging

### 2. Tool Registry

A central registry that maps tool names to their file paths, with utility functions to:
- Load tools on demand
- Get a list of all registered tools
- Preload specific tools
- Cache loaded tool instances

## Available Tools

The API provides 29 tools for interacting with the Ordiscan API:

- 1 Main Ordiscan Tool
- 6 Address Tools
- 3 Activity Tools
- 4 Transaction Tools
- 4 Inscription Tools
- 3 Collection Tools
- 3 Rune Tools
- 2 BRC-20 Tools
- 3 Sat Tools

All tools are loaded on demand to optimize performance.

## Usage

Start the server:

```bash
npm start
```

The server will run on port 1337 by default (or the port specified by the PORT environment variable) and automatically handle tool loading as needed.

### Running on a Specific Port

You can specify a custom port using the PORT environment variable:

```bash
PORT=8080 npm start
```

## Development

To build the project:

```bash
npm run build
```

To run in development mode with live reloading:

```bash
npm run dev
```

## Configuration

The server can be configured in several ways:

### Environment Variables

- `PORT`: Sets the HTTP port for the server (default: 1337)
- `ORDISCAN_API_KEY`: The API key for Ordiscan (can also be passed as a parameter to individual tools)

### Code Configuration

The server can also be configured by modifying the `src/index.ts` file:

- Configure which tools to preload by modifying the `preloadTools` array
- Toggle debug logging by setting the `debug` property

## License

MIT License
