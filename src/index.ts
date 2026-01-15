import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const PROJECT_ROOT = process.env.RN_DEV_HELPER_PROJECT_ROOT || "";
const ROOT = path.resolve(PROJECT_ROOT);

// Create server instance
const server = new McpServer({
  name: "rn-dev-helper-mcp",
  version: "1.0.0",
});

/* ==================================================
 * TOOLS
 * ================================================== */

/**
 * List all React Native screens
 */
server.registerTool(
  "get_screen_list",
  {
    description: "List all React Native screens in the project",
    inputSchema: z.object({}),
  },
  async () => {
    const files = await fg("app/modules/**/*Screen.tsx", { cwd: ROOT });

    return {
      content: files.map((file) => ({
        type: "text",
        text: path.basename(file, ".tsx"),
      })),
    };
  }
);

/**
 * Get screen source code
 */
server.registerTool(
  "get_screen_code",
  {
    description: "Get the source code of a React Native screen",
    inputSchema: z.object({
      screen: z.string(),
    }),
  },
  async ({ screen }) => {
    const files = await fg(`app/modules/**/${screen}.tsx`, { cwd: ROOT });

    if (!files.length) {
      throw new Error(`Screen not found: ${screen}`);
    }

    const code = await fs.readFile(path.join(ROOT, files[0]), "utf8");

    return {
      content: [{ type: "text", text: code }],
    };
  }
);

/**
 * Get navigation configuration
 */
server.registerTool(
  "get_navigation_map",
  {
    description: "Return all React Navigation configuration files",
    inputSchema: z.object({}),
  },
  async () => {
    const files = await fg("app/navigation/**/*.{ts,tsx}", { cwd: ROOT });

    let combined = "";

    for (const file of files) {
      combined += `\n\n// ${file}\n`;
      combined += await fs.readFile(path.join(ROOT, file), "utf8");
    }

    return {
      content: [{ type: "text", text: combined }],
    };
  }
);

/**
 * Search reusable components
 */
server.registerTool(
  "search_components",
  {
    description: "Search reusable components by name",
    inputSchema: z.object({
      query: z.string(),
    }),
  },
  async ({ query }) => {
    const files = await fg("app/components/**/*.tsx", { cwd: ROOT });

    const matches = files.filter((file) =>
      file.toLowerCase().includes(query.toLowerCase())
    );

    return {
      content: matches.map((file) => ({
        type: "text",
        text: file.replace("app/components/", ""),
      })),
    };
  }
);

/* ==================================================
 * PROMPTS
 * ================================================== */

/**
 * Create new screen prompt
 */
server.registerPrompt(
  "create_new_screen",
  {
    description: "Create a new React Native screen using project patterns",
  },
  async () => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "You are a Senior React Native engineer. Use existing navigation and reusable components from this project.",
          },
        },
      ],
    };
  }
);

/**
 * Refactor UI prompt (argument-driven)
 */
server.registerPrompt(
  "refactor_ui",
  {
    description: "Refactor UI of a React Native screen",
    argsSchema: {
      screenName: z.string(),
    },
  },
  async ({ screenName }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "You are a Senior React Native engineer. Refactor UI while following project patterns and reusable components.",
          },
        },
        {
          role: "assistant",
          content: {
            type: "text",
            text: `I'll help you refactor the UI of the screen "${screenName}".`,
          },
        },
      ],
    };
  }
);

/**
 * Connect API prompt
 */
server.registerPrompt(
  "connect_api",
  {
    description: "Connect a screen to backend using RTK Query",
    argsSchema: {
      screenName: z.string(),
    },
  },
  async ({ screenName }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Use existing RTK Query setup and API patterns from this project to connect backend data to the screen "${screenName}".`,
          },
        },
      ],
    };
  }
);

/* ==================================================
 * RESOURCES
 * ================================================== */

/**
 * Screens resource
 */
server.registerResource(
  "screens",
  "rn://screens",
  {
    description: "All React Native screens in the project",
    mimeType: "text/plain",
  },
  async () => {
    const files = await fg("app/modules/**/*Screen.tsx", { cwd: ROOT });

    return {
      contents: await Promise.all(
        files.map(async (file) => ({
          uri: `rn://screens/${file}`,
          text: await fs.readFile(path.join(ROOT, file), "utf8"),
          mimeType: "text/plain",
        }))
      ),
    };
  }
);

/**
 * Components resource
 */
server.registerResource(
  "components",
  "rn://components",
  {
    description: "Reusable UI components",
    mimeType: "text/plain",
  },
  async () => {
    const files = await fg("app/components/**/*.tsx", { cwd: ROOT });

    return {
      contents: await Promise.all(
        files.map(async (file) => ({
          uri: `rn://components/${file}`,
          text: await fs.readFile(path.join(ROOT, file), "utf8"),
          mimeType: "text/plain",
        }))
      ),
    };
  }
);

/**
 * Navigation resource
 */
server.registerResource(
  "navigation",
  "rn://navigation",
  {
    description: "React Navigation configuration files",
    mimeType: "text/plain",
  },
  async () => {
    const files = await fg("app/navigation/**/*.{ts,tsx}", { cwd: ROOT });

    return {
      contents: await Promise.all(
        files.map(async (file) => ({
          uri: `rn://navigation/${file}`,
          text: await fs.readFile(path.join(ROOT, file), "utf8"),
          mimeType: "text/plain",
        }))
      ),
    };
  }
);

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("RN Dev Helper MCP Server running on stdio");
};

main().catch((error) => {
  console.error("Fatal error in main():", error);
});
