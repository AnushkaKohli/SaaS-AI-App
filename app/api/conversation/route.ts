import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

import { checkApiLimit, increaseApiLimit } from "@/lib/apiLimit";
import { checkSubscription } from "@/lib/subsciption";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!genAI) {
      return new NextResponse("Gemini API key not configured.", {
        status: 500,
      });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrial && !isPro) {
      return new NextResponse("You have reached the limit of free requests", {
        status: 403,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = messages[messages.length - 1]; // Find the last message to use as prompt
    const result = await model.generateContent(prompt, model);
    const responseText = await result.response.text();

    if (!isPro) {
      await increaseApiLimit();
    }

    return new NextResponse(JSON.stringify({ response: responseText }), {
      status: 200,
    });
  } catch (error) {
    console.log("Conversation error: ", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
