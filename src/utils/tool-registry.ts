import { MCPTool } from "mcp-framework";

// Map of tool names to their file paths for lazy loading
const toolPathMap: Record<string, string> = {
  // Main Ordiscan Tool
  "ordiscan_main": "./tools/ordiscan",
  
  // Address Tools
  "ordiscan_address_utxo": "./tools/ordiscan-utxo",
  "ordiscan_address_inscriptions": "./tools/ordiscan-inscriptions",
  "ordiscan_address_inscriptions_detail": "./tools/ordiscan-inscriptions-detail",
  "ordiscan_address_runes_balance": "./tools/ordiscan-runes-balance",
  "ordiscan_address_brc20_balance": "./tools/ordiscan-brc20-balance",
  "ordiscan_address_rare_sats": "./tools/ordiscan-rare-sats",
  
  // Activity Tools
  "ordiscan_inscriptions_activity": "./tools/ordiscan-inscriptions-activity",
  "ordiscan_runes_activity": "./tools/ordiscan-runes-activity",
  "ordiscan_brc20_activity": "./tools/ordiscan-brc20-activity",
  
  // Transaction Tools
  "ordiscan_tx_info": "./tools/ordiscan-tx-info",
  "ordiscan_tx_inscriptions": "./tools/ordiscan-tx-inscriptions",
  "ordiscan_tx_inscription_transfers": "./tools/ordiscan-tx-inscription-transfers",
  "ordiscan_tx_runes": "./tools/ordiscan-tx-runes",
  
  // Inscription Tools
  "ordiscan_inscription_info": "./tools/ordiscan-inscription-info",
  "ordiscan_inscription_traits": "./tools/ordiscan-inscription-traits",
  "ordiscan_inscriptions_list": "./tools/ordiscan-inscriptions-list",
  "ordiscan_inscriptions_detail": "./tools/ordiscan-inscriptions-detail",
  
  // Collection Tools
  "ordiscan_collections_list": "./tools/ordiscan-collections-list",
  "ordiscan_collection_info": "./tools/ordiscan-collection-info",
  "ordiscan_collection_inscriptions": "./tools/ordiscan-collection-inscriptions",
  
  // Rune Tools
  "ordiscan_runes_list": "./tools/ordiscan-runes-list",
  "ordiscan_rune_market": "./tools/ordiscan-rune-market",
  "ordiscan_rune_name_unlock": "./tools/ordiscan-rune-name-unlock",
  
  // BRC-20 Tools
  "ordiscan_brc20_list": "./tools/ordiscan-brc20-list",
  "ordiscan_brc20_info": "./tools/ordiscan-brc20-info",
  
  // Sat Tools
  "ordiscan_sat_info": "./tools/ordiscan-sat-info",
  "ordiscan_utxo_rare_sats": "./tools/ordiscan-utxo-rare-sats",
  "ordiscan_utxo_sat_ranges": "./tools/ordiscan-utxo-sat-ranges"
};

// Cache of loaded tool instances
const toolCache: Record<string, MCPTool<any>> = {};

/**
 * Lazily loads a tool by its name
 * 
 * @param toolName The name of the tool to load
 * @returns A promise that resolves to the tool instance
 * @throws Error if the tool is not found in the registry
 */
export async function loadTool(toolName: string): Promise<MCPTool<any>> {
  // If the tool is already loaded, return it from cache
  if (toolCache[toolName]) {
    return toolCache[toolName];
  }
  
  // Check if the tool path exists in our map
  const toolPath = toolPathMap[toolName];
  if (!toolPath) {
    throw new Error(`Tool not found in registry: ${toolName}`);
  }
  
  try {
    // Dynamically import the tool module
    const module = await import(toolPath);
    
    // Instantiate the tool (default export should be the tool class)
    const ToolClass = module.default;
    const toolInstance = new ToolClass();
    
    // Cache the tool instance
    toolCache[toolName] = toolInstance;
    
    return toolInstance;
  } catch (error) {
    throw new Error(`Failed to load tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets all registered tool names
 * 
 * @returns Array of tool names
 */
export function getRegisteredToolNames(): string[] {
  return Object.keys(toolPathMap);
}

/**
 * Lazily loads all tools
 * 
 * @returns A promise that resolves to an array of tool instances
 */
export async function loadAllTools(): Promise<MCPTool<any>[]> {
  const toolNames = getRegisteredToolNames();
  const toolPromises = toolNames.map(name => loadTool(name));
  return Promise.all(toolPromises);
}

/**
 * Preloads a specific set of tools
 * 
 * @param toolNames Array of tool names to preload
 * @returns A promise that resolves when all specified tools are loaded
 */
export async function preloadTools(toolNames: string[]): Promise<void> {
  const toolPromises = toolNames.map(name => loadTool(name));
  await Promise.all(toolPromises);
} 