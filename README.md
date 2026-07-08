# Weather API TypeScript MCP Tool Server

A TypeScript-based Model Context Protocol (MCP) tool server for exposing OpenWeatherMap current weather data to MCP-compatible clients and AI assistants.

## Description

This project provides a lightweight MCP server that connects OpenWeatherMap weather data with tools that support the Model Context Protocol. The API key is read from the `OPENWEATHER_API_KEY` environment variable.

## Tools

- `get_city_weather`: Prompts for a city name and returns current weather from OpenWeatherMap.

City examples: `London`, `Delhi`, `New York,US`.

## Getting Started

Install dependencies:

```bash
yarn install
```

Set your OpenWeatherMap API key:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your real API key.

Build the server:

```bash
yarn build
```

Run the server:

```bash
OPENWEATHER_API_KEY="your_api_key_here" yarn start
```

For local development:

```bash
yarn dev
```

Open the MCP Inspector:

```bash
yarn start:local
```

`yarn start:local` reads `.env.local`, builds the server, and opens MCP Inspector. The Inspector prints a session token and usually opens a URL with that token already included. If you see `Invalid Authorization Header`, open the tokenized URL from the terminal output or paste the printed token into the Inspector configuration under `Proxy Session Token`.

## MCP Client Configuration

After building, add the server to an MCP-compatible client using the generated JavaScript entrypoint:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["./dist/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Use an absolute path to `dist/index.js` if your MCP client runs from a different working directory.
