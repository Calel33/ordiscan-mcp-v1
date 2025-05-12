import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface BRC20TokenInfo {
  tick: string;
  max_supply: number;
  minted: number;
  price: number | null;
}

interface OrdiscanInput {
  sort?: string;
  page?: string | number;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: BRC20TokenInfo[];
}

class OrdiscanBRC20ListTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_brc20_list";
  description = "Get a paginated list of BRC-20 tokens";

  schema = {
    sort: {
      type: z.string().optional().refine(val => !val || ['newest', 'oldest'].includes(val), {
        message: "Sort must be either 'newest' or 'oldest'"
      }),
      description: "Sort order: 'newest' or 'oldest' (default)",
    },
    page: {
      type: z.union([z.string(), z.number()]).optional().transform(val => {
        if (typeof val === 'string') {
          const num = parseInt(val, 10);
          return isNaN(num) ? undefined : num;
        }
        return val;
      }),
      description: "Page number for pagination (20 tokens per page)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { sort, page, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL('https://api.ordiscan.com/v1/brc20');
      if (sort) {
        url.searchParams.append('sort', sort);
      }
      if (page) {
        url.searchParams.append('page', page.toString());
      }

      const response = await fetch(url.toString(), {
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
          total_tokens: data.data.length,
          tokens: data.data.map(token => ({
            tick: token.tick,
            supply: {
              max: token.max_supply.toLocaleString(),
              minted: token.minted.toLocaleString(),
              percent_minted: ((token.minted / token.max_supply) * 100).toFixed(2) + '%'
            },
            price: token.price ? {
              usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(token.price),
              market_cap: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(token.price * token.minted)
            } : null,
            status: this.getTokenStatus(token)
          })),
          page_info: {
            current_page: page || 1,
            items_per_page: 20,
            has_more: data.data.length === 20
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

  private getTokenStatus(token: BRC20TokenInfo): string {
    if (token.minted === 0) return 'Not minted';
    if (token.minted === token.max_supply) return 'Fully minted';
    return 'Minting in progress';
  }
}

export default OrdiscanBRC20ListTool; 