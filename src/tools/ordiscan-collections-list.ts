import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "./ordiscan-utils.js";

import { z } from "zod";

interface CollectionInfo {
  name: string;
  slug: string;
  description: string;
  twitter_link: string | null;
  discord_link: string | null;
  website_link: string | null;
  item_count: number;
}

interface OrdiscanInput {
  page?: string | number;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: CollectionInfo[];
}

class OrdiscanCollectionsListTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_collections_list";
  description = "Get a paginated list of indexed collections";

  schema = {
    page: {
      type: z.union([z.string(), z.number()]).optional().transform(val => {
        if (typeof val === 'string') {
          const num = parseInt(val, 10);
          return isNaN(num) ? undefined : num;
        }
        return val;
      }),
      description: "Page number for pagination (20 collections per page)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { page, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const url = new URL('https://api.ordiscan.com/v1/collections');
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
          total_collections: data.data.length,
          collections: data.data.map(collection => ({
            name: collection.name,
            slug: collection.slug,
            description: collection.description,
            items: collection.item_count.toLocaleString(),
            links: {
              twitter: collection.twitter_link || 'N/A',
              discord: collection.discord_link || 'N/A',
              website: collection.website_link || 'N/A'
            },
            has_social: {
              twitter: !!collection.twitter_link,
              discord: !!collection.discord_link,
              website: !!collection.website_link
            }
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

export default OrdiscanCollectionsListTool; 