"use client"; //as useForm is a hook

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown"
import { MessageSquare } from "lucide-react";
// import ChatCompletionRequestMessage from "openai";

import { conversationSchema } from "./constants";
import Heading from "@/components/Heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";

const ConversationPage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<string[]>([]);
    const form = useForm<z.infer<typeof conversationSchema>>({
        // zodResolver is used to handle validation based on the zod schema
        resolver: zodResolver(conversationSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof conversationSchema>) => {
        try {
            // message written by the user in the input form
            // const userMessage = {
            //     role: "user",
            //     content: values.prompt,
            // };
            // array of all the existing messages and adding the user message to it
            // const newMessages = [...messages, userMessage];
            // const response = await axios.post("/api/conversation", {
            //     messages: newMessages,
            // });
            // setMessages((current) => [...current, userMessage, response.data]);
            // console.log("values: ", values)
            const prompt = values.prompt;
            // console.log("prompt: ", prompt)
            const newMessages = [...messages, prompt];
            // console.log("newMessages: ", newMessages)
            const response = await axios.post("/api/conversation", {
                messages: newMessages,
            });
            // console.log("response", response)

            if (response.data && response.data.response) {
                // Update prompts with generated response
                // response.data.response
                setMessages((current) => [...current, prompt, response.data.response]);
                console.log("messages after set prompts", messages)
            } else {
                console.error("Error generating response:", response);
            }


            // To clear the form after submission
            form.reset();
        } catch (error: any) {
            console.log("Error", error.message);
        } finally {
            router.refresh();
        }
    }

    // const test = () => {
    //     console.log("form", form)
    //     console.log("Hello");
    // }
    return (
        <div>
            <Heading
                title="Conversation"
                description="Start a conversation with Sage."
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
            {/* <Button onClick={test} className="px-3 py-2 border-black border-2 rounded-md">Click me</Button> */}
            <div className="px-4 lg:px-8">
                <div>
                    {/* Passing all the functions the `form` constant has, which uses the react-hook-form */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
                        >
                            <FormField
                                // name controls the "prompt" field in the form
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="How many ants would it take to lift an elephant?"
                                                // the field object typically contains properties such as onChange, onBlur, name, ref, and value from react-hook-form. These properties are essential for the form to correctly manage the input's state and validation. By spreading the field object into the Input component, you ensure that all necessary props are passed to the input like onChange, onBlur etc, allowing React Hook Form to register the input field, track its value, and handle validation and submission correctly.
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                                Generate
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="space-y-4 mt-4">
                    {isLoading && (
                        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                            <Loader />
                        </div>
                    )}
                    {messages.length === 0 && !isLoading && (
                        <Empty label="No conversation started." />
                    )}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                                    index % 2 === 0 ? "bg-white border border-black/10" : "bg-muted",
                                )}
                            >
                                {index % 2 === 0 ? <UserAvatar /> : <BotAvatar />}
                                <Markdown className="text-sm">
                                    {message}
                                </Markdown>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversationPage;