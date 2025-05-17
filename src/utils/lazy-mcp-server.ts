import { MCPServer, MCPServerConfig, MCPTool } from "mcp-framework";
import { loadTool, getRegisteredToolNames } from "./tool-registry.js";

/**
 * Extended configuration for LazyMCPServer
 */
export interface LazyMCPServerConfig extends MCPServerConfig {
  /**
   * Optional array of tool names to preload at startup
   */
  preloadTools?: string[];
  
  /**
   * Enable debug logging for lazy loading
   */
  debug?: boolean;
}

/**
 * Custom MCP Server implementation that lazily loads tools
 */
export class LazyMCPServer extends MCPServer {
  private toolLoadedListeners: Map<string, ((tool: MCPTool<any>) => void)[]> = new Map();
  private debug: boolean;
  private toolRegistry: Map<string, Promise<MCPTool<any>>> = new Map();
  
  constructor(config: LazyMCPServerConfig) {
    super(config);
    this.debug = config.debug || false;
    
    // Register all tools with the server but don't load them yet
    this.registerLazyTools();
  }
  
  /**
   * Register all tools with the server without loading them
   */
  private registerLazyTools(): void {
    const toolNames = getRegisteredToolNames();
    
    if (this.debug) {
      console.log(`[LazyMCPServer] Registering ${toolNames.length} tools for lazy loading`);
    }
    
    // For each tool, create a proxy that will load the tool when needed
    for (const toolName of toolNames) {
      // Create a loading promise that will be resolved when the tool is requested
      const loadingPromise = new Promise<MCPTool<any>>((resolve, reject) => {
        // Register a listener to resolve the promise when the tool is loaded
        this.onToolLoaded(toolName, (tool) => {
          resolve(tool);
        });
      });
      
      // Add the loading promise to the registry
      this.toolRegistry.set(toolName, loadingPromise);
    }
  }
  
  /**
   * Override the tool resolution method to lazily load tools
   */
  protected async resolveTool(toolName: string): Promise<MCPTool<any> | null> {
    try {
      return await this.getOrLoadTool(toolName);
    } catch (error) {
      console.error(`[LazyMCPServer] Error loading tool ${toolName}:`, error);
      return null;
    }
  }
  
  /**
   * Start the server and optionally preload specified tools
   */
  async start(options?: { preloadTools?: string[] }): Promise<void> {
    // Start the MCP server
    await super.start();
    
    // Preload tools if specified
    const toolsToPreload = options?.preloadTools || [];
    if (toolsToPreload.length > 0) {
      if (this.debug) {
        console.log(`[LazyMCPServer] Preloading ${toolsToPreload.length} tools: ${toolsToPreload.join(', ')}`);
      }
      
      for (const toolName of toolsToPreload) {
        try {
          await this.getOrLoadTool(toolName);
        } catch (error) {
          console.error(`[LazyMCPServer] Failed to preload tool ${toolName}:`, error);
        }
      }
    }
  }
  
  /**
   * Get a tool from cache or load it if not loaded yet
   */
  async getOrLoadTool(toolName: string): Promise<MCPTool<any>> {
    if (this.debug) {
      console.log(`[LazyMCPServer] Loading tool: ${toolName}`);
    }
    
    try {
      const tool = await loadTool(toolName);
      
      // Notify any listeners that the tool has been loaded
      this.notifyToolLoaded(toolName, tool);
      
      return tool;
    } catch (error) {
      throw new Error(`Failed to load tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Register a listener to be called when a specific tool is loaded
   */
  onToolLoaded(toolName: string, listener: (tool: MCPTool<any>) => void): void {
    if (!this.toolLoadedListeners.has(toolName)) {
      this.toolLoadedListeners.set(toolName, []);
    }
    
    this.toolLoadedListeners.get(toolName)!.push(listener);
  }
  
  /**
   * Notify listeners that a tool has been loaded
   */
  private notifyToolLoaded(toolName: string, tool: MCPTool<any>): void {
    const listeners = this.toolLoadedListeners.get(toolName) || [];
    
    for (const listener of listeners) {
      try {
        listener(tool);
      } catch (error) {
        console.error(`[LazyMCPServer] Error in tool loaded listener for ${toolName}:`, error);
      }
    }
  }
} 