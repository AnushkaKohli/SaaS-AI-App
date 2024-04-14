import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateContent } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!genAI) {
      return new NextResponse("Gemini API key not configured.", {
        status: 500,
      });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const promptForImage = prompt;
    const response = await model.generateContent(promptForImage, model);
    const responseText = await response.response.text();
    return new NextResponse(JSON.stringify({ responseText }), {
      status: 200,
    });
  } catch (error) {
    console.log("Image error: ", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
