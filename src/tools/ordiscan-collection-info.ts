import { MCPTool } from "mcp-framework";
import { flexibleNumber, flexibleEnum } from "../utils/ordiscan-utils.js";

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
  slug: string;
  apiKey?: string;
}

interface OrdiscanResponse {
  data: CollectionInfo;
}

class OrdiscanCollectionInfoTool extends MCPTool<OrdiscanInput> {
  name = "ordiscan_collection_info";
  description = "Get detailed information about a specific collection";

  schema = {
    slug: {
      type: z.string(),
      description: "The unique identifier for a collection (e.g. taproot-wizards)",
    },
    apiKey: {
      type: z.string().optional(),
      description: "Your Ordiscan API key. If not provided, will use environment variable ORDISCAN_API_KEY",
    },
  };

  async execute(input: OrdiscanInput) {
    const { slug, apiKey } = input;
    const apiKeyToUse = apiKey || process.env.ORDISCAN_API_KEY;

    if (!apiKeyToUse) {
      return {
        error: "API key is required. Either provide it as a parameter or set ORDISCAN_API_KEY environment variable."
      };
    }

    try {
      const response = await fetch(`https://api.ordiscan.com/v1/collection/${slug}`, {
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
          slug: data.data.slug,
          description: data.data.description,
          stats: {
            total_items: data.data.item_count.toLocaleString(),
            has_social_presence: !!(data.data.twitter_link || data.data.discord_link || data.data.website_link)
          },
          links: {
            twitter: data.data.twitter_link ? {
              url: data.data.twitter_link,
              handle: this.extractTwitterHandle(data.data.twitter_link)
            } : null,
            discord: data.data.discord_link ? {
              url: data.data.discord_link,
              invite_code: this.extractDiscordInvite(data.data.discord_link)
            } : null,
            website: data.data.website_link || null
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

  private extractTwitterHandle(url: string): string {
    try {
      const match = url.match(/twitter\.com\/([^/]+)/);
      return match ? `@${match[1]}` : url;
    } catch {
      return url;
    }
  }

  private extractDiscordInvite(url: string): string {
    try {
      const match = url.match(/discord\.(?:gg|com\/invite)\/([^/]+)/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  }
}

export default OrdiscanCollectionInfoTool; 