"use client";

import { useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Check, Code, ImageIcon, MessageSquare, Music, VideoIcon, Zap } from "lucide-react";

import { useProModal } from "@/hooks/useProModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProModal = () => {
    const proModal = useProModal();
    const [loading, setLoading] = useState(false);

    const tools = [
        {
            label: "Conversation",
            icon: MessageSquare,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
        },
        {
            label: "Music Generation",
            icon: Music,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "Image Generation",
            icon: ImageIcon,
            color: "text-pink-700",
            bgColor: "bg-pink-700/10",
        },
        {
            label: "Video Generation",
            icon: VideoIcon,
            color: "text-orange-700",
            bgColor: "bg-orange-700/10",
        },
        {
            label: "Code Generation",
            icon: Code,
            color: "text-green-700",
            bgColor: "bg-green-700/10",
        },
    ]

    const onSubscribe = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/stripe");

            window.location.href = response.data.url;
        } catch (error) {
            console.log("Stripe Client Error: ", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex justify-center flex-col items-center pb-2 gap-y-4">
                        <div className="flex items-center gap-x-2 font-bold py-1">
                            Upgrade to Sage Pro
                            <Badge variant="premium" className="uppercase text-sm py-1">
                                Pro
                            </Badge>
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
                        {tools.map((tool, index) => (
                            <Card key={index} className="p-3 border-black/5 flex items-center justify-between">
                                <div className={cn("p-2 flex w-fit rounded-md", tool.bgColor)}>
                                    <tool.icon className={cn("w-6 h-6", tool.color)} />
                                </div>
                                <div className="font-semibold text-sm">
                                    {tool.label}
                                </div>
                                <Check className="text-primary w-5 h-5" />
                            </Card>
                        ))}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onSubscribe} disabled={loading} size="lg" variant="premium" className="w-full">
                        Upgrade <Zap className="w-4 h-4 ml-2 fill-white" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ProModal;