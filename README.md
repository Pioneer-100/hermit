This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3009](http://localhost:3009) with your browser to see the result.

### Daily Google Search updates

The automated crawl also runs four focused Google News searches through SerpApi for stories from the past 24 hours: renewables and independent power producers (IPPs), food-water-energy nexus and circular-economy topics, clean-energy events and conferences, and clean-energy funding and tenders. The events query covers Zimbabwe, neighboring southern African countries, SADC, Africa, and international/global coverage. The funding query separately targets grants, calls for proposals/applications, tenders, and financing opportunities across the same markets. Search results go through the existing deduplication and relevance checks, then Gemini classifies them for the Renewables, Nexus, or Events & Funding trackers. Event deadlines, names, and funding amounts are saved when available. Google does not provide a single continent-wide `gl` location code, so geographic terms in the queries and the crawler's relevance checks are used to screen results. This uses up to four SerpApi searches per automated crawl. To enable it locally, add your SerpApi key to `.env.local`:

```env
SERPAPI_API_KEY=your_serpapi_key
```

Restart the development server after adding the key. Set the same variable in your deployment environment to enable the scheduled crawl there. Without the key, the existing crawler continues to run and reports that Google Search updates were skipped.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
