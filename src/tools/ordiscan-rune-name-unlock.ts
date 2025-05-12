import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

import { z } from "zod";

interface RuneNameInfo {
  name: string;
  status: 'ETCHED' | 'AVAILABLE' | 'LOCKED' | 'RESERVED';
  unlock_block_height: number;
  unlock_block_timestamp: string;
}

interface OrdiscanInput {
  name: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: RuneNameInfo;
}

class OrdiscanRuneNameUnlockTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_rune_name_unlock";
  description = "Check when a specific rune name becomes available to etch";

  schema = {
    name: {
      type: z.string(),
      description: "The desired name of the rune (without spacers)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { name, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/rune-name/${name}`, {
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

      const data: OrdiscanResponse = await response.json();
      
      return {
        success: true,
        data: data.data,
        formatted: {
          name: data.data.name,
          status: data.data.status,
          status_description: this.getStatusDescription(data.data.status),
          unlock: {
            block: data.data.unlock_block_height,
            timestamp: new Date(data.data.unlock_block_timestamp).toLocaleString(),
            relative_time: this.getRelativeTime(data.data.unlock_block_timestamp)
          }
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  private getStatusDescription(status: string): string {
    switch (status) {
      case 'ETCHED':
        return 'This name has already been taken';
      case 'AVAILABLE':
        return 'This name is available for etching';
      case 'LOCKED':
        return 'This name is not yet available for etching';
      case 'RESERVED':
        return 'This name is too long and can only be assigned randomly';
      default:
        return 'Unknown status';
    }
  }

  private getRelativeTime(timestamp: string): string {
    const unlockDate = new Date(timestamp);
    const now = new Date();
    const diffMs = unlockDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Already unlocked';
    } else if (diffDays === 0) {
      return 'Unlocks today';
    } else if (diffDays === 1) {
      return 'Unlocks tomorrow';
    } else {
      return `Unlocks in ${diffDays} days`;
    }
  }
}

export default OrdiscanRuneNameUnlockTool; 