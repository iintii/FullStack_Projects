import { openrouter } from "@/lib/openrouter";
import { streamText } from "ai";
export const dynamic = "force-dynamic"; 
export const maxDuration = 30
/* remember that if a post request hits this endpoint the route.ts ie this file will run the POST function*/
export async function POST(req: Request) {
    //generatedevlog button on client side will send a post req to this route with the commits as the body. req.json will reads the body and we can destructure it to get the commits. We rename prompt to commits for clarity.
    const {prompt: commits} = await req.json();

    const result = streamText({
    // We are using a Qwen 2.5 Coder model. It is exceptionally good at dev tasks.
    model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"), //from the openrouter sdk config file
    system: `You are an expert Technical Writer and Product Manager. I will provide a list of raw git commits. 
    Your job is to synthesize them into a beautiful, human-readable Release Changelog in Markdown.
    
    Rules:
    1. Categorize into these exact sections (only use them if relevant): 
       '✨ New Features', '🐛 Bug Fixes', and '🛠️ Under the Hood'.
    2. DO NOT just copy-paste the commit messages. Translate developer jargon into clear, professional updates explaining the "what" and "why".
    3. Combine related commits into single bullet points (e.g., if there are 3 commits about 'imgkit', summarize it as one feature).
    4. Silently ignore mundane commits (typos, merges, minor dependency bumps).
    5. Output ONLY the Markdown. No intro or outro text.`,
    
    prompt: `Here are the recent commits:\n${commits}`,
  });

  return result.toTextStreamResponse();
}