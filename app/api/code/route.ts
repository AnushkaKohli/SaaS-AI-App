import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

import { checkApiLimit, increaseApiLimit } from "@/lib/apiLimit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const instructionMessage: string =
  "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.";

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
    if (!freeTrial) {
      return new NextResponse("You have reached the limit of free requests", {
        status: 403,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = [instructionMessage, ...messages[messages.length - 1]];
    const result = await model.generateContent(prompt, model);
    const responseText = await result.response.text();

    await increaseApiLimit();

    return new NextResponse(JSON.stringify({ response: responseText }), {
      status: 200,
    });
  } catch (error) {
    console.log("Code error: ", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
