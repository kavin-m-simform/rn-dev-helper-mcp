# rn-dev-helper-mcp

A Model Context Protocol (MCP) server for React Native development.

## Overview

This MCP server provides tools and resources to help with React Native development, including:

- Listing React Native screens
- Getting screen source code
- Accessing project file structure

## Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run server:build
   ```

## Usage in Another Project

To use this MCP server in another project (like Claude Desktop, Cline, or any MCP client), add the following configuration:

### Configuration

Add this to your MCP client's configuration file (e.g., `claude_desktop_config.json`, `mcp_config.json`, or similar):

```json
{
  "servers": {
    "my-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/my-mcp-server/build/index.js"],
      "dev": {
        "watch": "/absolute/path/to/my-mcp-server/src/**/*.js",
        "debug": {
          "type": "node"
        }
      }
    }
  },
  "inputs": []
}
```

### Important Notes

1. **Replace the path**: Change `/absolute/path/to/my-mcp-server` to the actual absolute path where you cloned this repository
   - Example: `/Users/username/Documents/my-mcp-server`
2. **Build first**: Make sure you've built the project with `npm run server:build` before using it

3. **Configure PROJECT_ROOT**: Update the `PROJECT_ROOT` constant in [src/index.ts](src/index.ts) to point to your React Native project:
   ```typescript
   const PROJECT_ROOT = "/path/to/your/react-native-project";
   ```

### Development Configuration

The `dev` section in the configuration enables:

- **watch**: Automatically reloads the server when source files change
- **debug**: Enables Node.js debugging capabilities

## Development

### Build Commands

- **Build once**: `npm run server:build`
- **Build and watch**: `npm run server:build:watch` - Automatically rebuilds on file changes
- **Run directly** (for testing): `npm run server:dev`

### Project Structure

```
my-mcp-server/
├── src/
│   └── index.ts          # Main server code
├── build/
│   └── index.js          # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Available Tools

Once connected, the MCP server provides the following tools:

- **get_screen_list**: Lists all React Native screens in the project
- **get_screen_code**: Retrieves the source code of a specific screen
- (Additional tools based on your implementation)

## Troubleshooting

### Server not starting

- Ensure you've run `npm run server:build`
- Check that the path in your configuration points to `build/index.js`
- Verify Node.js is installed and accessible

### Tools not working

- Make sure `PROJECT_ROOT` in [src/index.ts](src/index.ts) points to a valid React Native project
- Check that the target project has the expected structure (e.g., `app/modules/**/*Screen.tsx`)

## License

MIT
