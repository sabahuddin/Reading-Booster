import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import type { ContactMessage } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail } from "lucide-react";

export default function AdminMessages() {
  const { data: messages, isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact"],
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="text-2xl font-bold" data-testid="text-messages-title">Kontakt poruke</h1>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : messages && messages.length > 0 ? (
              <Accordion type="multiple">
                {messages.map((msg) => (
                  <AccordionItem key={msg.id} value={msg.id} className="px-4" data-testid={`accordion-message-${msg.id}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4 flex-wrap text-left flex-1">
                        <span className="font-medium min-w-[120px]">{msg.name}</span>
                        <span className="text-muted-foreground text-sm min-w-[150px]">{msg.email}</span>
                        <span className="text-sm flex-1">{msg.subject}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString("hr-HR")}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-muted/50 rounded-md p-4">
                        <p className="text-sm whitespace-pre-wrap" data-testid={`text-message-body-${msg.id}`}>
                          {msg.message}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nema kontakt poruka.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
