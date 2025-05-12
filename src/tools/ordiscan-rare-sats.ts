import { MCPTool } from "mcp-framework";
import { z } from "zod";

// Define interfaces for the tool's input and response types
interface OrdiscanRareSatsInput {
  address: string;
  apiKey?: string;
}

interface RareSat {
  satributes: string[];
  ranges: [number, number][];
}

interface OrdiscanRareSatsResponse {
  data: RareSat[];
}

class OrdiscanRareSatsTool extends MCPTool<OrdiscanRareSatsInput> {
  name = "ordiscan_address_rare_sats";
  description = "Get all rare sats owned by a Bitcoin address";

  schema = {
    address: {
      type: z.string(),
      description: "A valid Bitcoin address",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanRareSatsInput) {
    const { address, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/address/${address}/rare-sats`, {
        headers: {
          'Authorization': `Bearer ${apiKeyToUse}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: `API request failed: ${response.status} ${response.statusText}`,
          details: errorText
        };
      }

      const data: OrdiscanRareSatsResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        // Provide a formatted view for easier consumption
        formatted: {
          total_rare_sats: data.data.reduce((acc, sat) => 
            acc + sat.ranges.reduce((sum, [start, end]) => sum + (end - start), 0), 0),
          categories: data.data.map(sat => ({
            satributes: sat.satributes,
            ranges: sat.ranges.map(([start, end]) => ({
              start: start.toLocaleString(),
              end: end.toLocaleString(),
              count: (end - start).toLocaleString()
            }))
          }))
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }
}

export default OrdiscanRareSatsTool; 