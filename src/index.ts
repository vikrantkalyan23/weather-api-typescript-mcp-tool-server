#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

type OpenWeatherResponse = {
  name?: string;
  sys?: {
    country?: string;
  };
  weather?: Array<{
    main?: string;
    description?: string;
  }>;
  main?: {
    temp?: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
    humidity?: number;
  };
  wind?: {
    speed?: number;
    deg?: number;
    gust?: number;
  };
  clouds?: {
    all?: number;
  };
  visibility?: number;
};

const server = new McpServer({
  name: "weather-api-typescript-mcp-tool-server",
  version: "1.0.0"
});

const cityWeatherSchema = z.object({
  city: z
    .string()
    .trim()
    .min(1)
    .describe("City name to search, for example 'Chandigarh', 'Delhi', or 'Mumbai'.")
});

server.tool(
  "get_city_weather",
  "Get current weather for a city using OpenWeatherMap.",
  cityWeatherSchema.shape,
  async ({ city }) => {
    const weather = await fetchCityWeather(city);
    const condition = weather.weather?.[0];
    const place = [weather.name, weather.sys?.country].filter(Boolean).join(", ") || city;

    return textResult(
      [
        `Current weather for ${place}:`,
        `Conditions: ${condition?.description ?? condition?.main ?? "Unknown"}`,
        `Temperature: ${formatNumber(weather.main?.temp)} C`,
        `Feels like: ${formatNumber(weather.main?.feels_like)} C`,
        `Min/Max: ${formatNumber(weather.main?.temp_min)} C / ${formatNumber(weather.main?.temp_max)} C`,
        `Humidity: ${formatNumber(weather.main?.humidity, 0)}%`,
        `Pressure: ${formatNumber(weather.main?.pressure, 0)} hPa`,
        `Wind: ${formatNumber(weather.wind?.speed)} m/s${weather.wind?.deg === undefined ? "" : `, ${weather.wind.deg} deg`}`,
        `Cloudiness: ${formatNumber(weather.clouds?.all, 0)}%`,
        `Visibility: ${formatVisibility(weather.visibility)}`
      ].join("\n")
    );
  }
);

async function fetchCityWeather(city: string): Promise<OpenWeatherResponse> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is required. Set it in your environment before starting the MCP server.");
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("q", city);
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "weather-api-typescript-mcp-tool-server/1.0"
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenWeatherMap request failed with ${response.status} ${response.statusText}: ${errorBody}`);
  }

  return (await response.json()) as OpenWeatherResponse;
}

function formatNumber(value: number | undefined, digits = 1): string {
  return value === undefined ? "?" : value.toFixed(digits);
}

function formatVisibility(value: number | undefined): string {
  return value === undefined ? "?" : `${(value / 1000).toFixed(1)} km`;
}

function textResult(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text
      }
    ]
  };
}

const transport = new StdioServerTransport();
await server.connect(transport);
