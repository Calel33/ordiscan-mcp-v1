import { LazyMCPServer } from "./utils/lazy-mcp-server.js";

// Get the port from environment variable with fallback to 1337
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 1337;

// Create server with HTTP Stream transport and lazy loading
const server = new LazyMCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: PORT,
      endpoint: "/mcp",
      responseMode: "stream"
    }
  },
  // Enable debug logging for development
  debug: true
});

// Start the server - tools will be lazily loaded on demand
server.start({
  // Optionally preload some frequently used tools for better user experience
  preloadTools: [
    "ordiscan_main"
  ]
}).then(() => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log('Registered tools for lazy loading:');
  console.log('- 1 Main Ordiscan Tool');
  console.log('- 6 Address Tools');
  console.log('- 3 Activity Tools');
  console.log('- 4 Transaction Tools');
  console.log('- 4 Inscription Tools');
  console.log('- 3 Collection Tools');
  console.log('- 3 Rune Tools');
  console.log('- 2 BRC-20 Tools');
  console.log('- 3 Sat Tools');
  console.log('Total: 29 Tools (loaded on demand)');
}).catch((error: Error) => {
  console.error('Failed to start MCP Server:', error);
}); 