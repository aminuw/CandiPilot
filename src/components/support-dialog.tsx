"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Send } from "lucide-react";

interface SupportDialogProps {
    userEmail?: string;
}

export function SupportDialog({ userEmail }: SupportDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(userEmail || "");
    const [message, setMessage] = useState("");

    const handleSubmit = () => {
        const subject = encodeURIComponent("Support CandiPilot");
        const body = encodeURIComponent(`Email: ${email}\n\n${message}`);
        window.location.href = `mailto:support@candipilot.fr?subject=${subject}&body=${body}`;
        setOpen(false);
        setMessage("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" title="Support">
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Support CandiPilot</DialogTitle>
                    <DialogDescription>
                        Besoin d&apos;aide ou tu as trouvé un bug ? Envoie-nous un message !
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="support-email">Ton email</Label>
                        <Input
                            id="support-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ton@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="support-message">Message</Label>
                        <Textarea
                            id="support-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Décris ton problème ou ta question..."
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!message.trim()}
                        className="w-full"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer au support
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
