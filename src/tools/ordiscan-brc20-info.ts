import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface BRC20TokenInfo {
  tick: string;
  max_supply: number;
  minted: number;
  price: number | null;
}

interface OrdiscanInput {
  tick: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: BRC20TokenInfo;
}

class OrdiscanBRC20InfoTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_brc20_info";
  description = "Get detailed information about a specific BRC-20 token";

  schema = {
    tick: {
      type: z.string(),
      description: "The unique tick of the token. Can be either uppercase or lowercase.",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { tick, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/brc20/${tick}`, {
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
          tick: data.data.tick,
          supply: {
            max: data.data.max_supply.toLocaleString(),
            minted: data.data.minted.toLocaleString(),
            remaining: (data.data.max_supply - data.data.minted).toLocaleString(),
            percent_minted: ((data.data.minted / data.data.max_supply) * 100).toFixed(2) + '%'
          },
          market: data.data.price ? {
            price_usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.data.price),
            market_cap_usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.data.price * data.data.minted),
            fully_diluted_market_cap_usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.data.price * data.data.max_supply)
          } : null,
          status: this.getTokenStatus(data.data)
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Unknown error occurred' };
    }
  }

  private getTokenStatus(token: BRC20TokenInfo): {
    minting: string;
    price: string;
  } {
    return {
      minting: token.minted === 0 ? 'Not started' :
               token.minted === token.max_supply ? 'Completed' :
               'In progress',
      price: token.price ? 'Trading' : 'No market data'
    };
  }
}

export default OrdiscanBRC20InfoTool; 