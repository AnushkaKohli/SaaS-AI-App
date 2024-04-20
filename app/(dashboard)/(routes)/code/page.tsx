"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Markdown from "react-markdown"
import { Code } from "lucide-react";

import { codeSchema } from "./constants";
import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/useProModal";
import Heading from "@/components/Heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { UserAvatar } from "@/components/UserAvatar";
import { BotAvatar } from "@/components/BotAvatar";

const CodePage = () => {
    const proModal = useProModal();
    const router = useRouter();
    const [messages, setMessages] = useState<string[]>([]);
    const form = useForm<z.infer<typeof codeSchema>>({
        resolver: zodResolver(codeSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof codeSchema>) => {
        try {
            const prompt = values.prompt;
            const newMessages = [...messages, prompt];
            const response = await axios.post("/api/code", {
                messages: newMessages,
            });

            if (response.data && response.data.response) {
                setMessages((current) => [...current, prompt, response.data.response]);
            } else {
                console.error("Error generating response:", response);
            }
            form.reset();
        } catch (error: any) {
            if (error?.response?.status === 403) {
                proModal.onOpen();
            } else {
                toast.error("Error generating response");
            }
            console.log("Error", error.message);
        } finally {
            router.refresh();
        }
    }
    return (
        <div>
            <Heading
                title="Code Generation"
                description="Generate code snippets with Sage."
                icon={Code}
                iconColor="text-green-700"
                bgColor="bg-green-700/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
                        >
                            <FormField
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="Create a button using Tailwind CSS"
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
                                <Markdown
                                    className="text-sm overflow-hidden leading-7"
                                    components={{
                                        pre: ({ node, ...props }) =>
                                        (<div className="overflow-auto w-full my-2 bg-black/10 p-4 rounded-lg">
                                            <pre {...props} />
                                        </div>),
                                        code: ({ node, ...props }) => (
                                            <code className="bg-black/10 rounded-lg p-2" {...props} />
                                        )
                                    }}
                                >
                                    {message || "No response"}
                                </Markdown>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CodePage;