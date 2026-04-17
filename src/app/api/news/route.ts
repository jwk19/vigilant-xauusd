import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure"],
    ],
  },
});

const FEEDS = [
  {
    name: "FXStreet",
    url: "https://www.fxstreet.com/rss/news",
    color: "#0385ff",
  },
  {
    name: "DailyForex",
    url: "https://www.dailyforex.com/rss/forex-news/gold/",
    color: "#0cd89a",
  },
  {
    name: "Investing.com",
    url: "https://www.investing.com/rss/news_11.rss",
    color: "#f6941d",
  },
];

export async function GET() {
  try {
    const feedPromises = FEEDS.map(async (feed) => {
      try {
        // Mocking user-agent to avoid blocks
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) throw new Error(`Failed to fetch ${feed.name}`);
        const xml = await response.text();
        const data = await parser.parseString(xml);

        return data.items.map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          source: feed.name,
          sourceColor: feed.color,
          summary: item.contentSnippet?.slice(0, 180) + "...",
          image: (item as any).enclosure?.url || (item as any).mediaContent?.$.url || null,
        }));
      } catch (err) {
        console.error(`Error fetching ${feed.name}:`, err);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allNews = results.flat().sort((a, b) => {
      return new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime();
    });

    return NextResponse.json(allNews.slice(0, 30));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
