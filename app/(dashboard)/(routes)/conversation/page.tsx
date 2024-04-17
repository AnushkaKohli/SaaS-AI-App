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
import { useProModal } from "@/hooks/useProModal";
import Heading from "@/components/Heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";

const ConversationPage = () => {
    const proModal = useProModal();
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
            const prompt = values.prompt;
            const newMessages = [...messages, prompt];
            const response = await axios.post("/api/conversation", {
                messages: newMessages,
            });

            if (response.data && response.data.response) {
                // Update prompts with generated response
                setMessages((current) => [...current, prompt, response.data.response]);
            } else {
                console.error("Error generating response:", response);
            }

            // To clear the form after submission
            form.reset();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                proModal.onOpen();
            }
            console.log("Error", error.message);
        } finally {
            // This helps in rehydrating all the server components and fetching the latest data from the database
            router.refresh();
        }
    }

    return (
        <div>
            <Heading
                title="Conversation"
                description="Start a conversation with Sage."
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
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