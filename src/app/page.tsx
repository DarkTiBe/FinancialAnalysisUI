"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  GaugeCircle,
  GitFork,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  PlusCircle,
  AlertOctagon,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { summarizeContradictions } from "@/ai/flows/summarize-contradictions";
import {
  generateAlerts,
  type GenerateAlertsOutput,
} from "@/ai/flows/generate-alerts";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  ticker: z.string().min(1, "Ticker is required").max(10),
});

type AlertType = GenerateAlertsOutput["alerts"][0];

const severityIcons: Record<AlertType["severity"], React.ElementType> = {
  critical: AlertOctagon,
  high: ShieldAlert,
  medium: AlertTriangle,
  low: Info,
};

const severityColors: Record<AlertType["severity"], string> = {
  critical: "text-red-500",
  high: "text-orange-500",
  medium: "text-yellow-500",
  low: "text-blue-500",
};

export default function DashboardPage() {
  const [ticker, setTicker] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [contradictionInput, setContradictionInput] = React.useState("");
  const [contradictionSummary, setContradictionSummary] = React.useState("");
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isGeneratingAlerts, setIsGeneratingAlerts] = React.useState(false);
  const [alerts, setAlerts] = React.useState<AlertType[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setTicker(values.ticker.toUpperCase());
    setIsDialogOpen(false);
    form.reset();
    setContradictionSummary("");
    setAlerts([]);
  }

  const handleSummarize = async () => {
    if (!ticker || !contradictionInput) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ticker and contradiction analysis text are required.",
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeContradictions({
        ticker,
        contradictionAnalysis: contradictionInput,
      });
      setContradictionSummary(result.summary);
    } catch (error) {
      console.error("Error summarizing contradictions:", error);
      toast({
        variant: "destructive",
        title: "Summarization Failed",
        description: "Could not summarize the analysis. Please try again.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateAlerts = async () => {
    if (!ticker || !contradictionSummary) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Please set a ticker and generate a contradiction summary first.",
      });
      return;
    }
    setIsGeneratingAlerts(true);
    setAlerts([]);
    try {
      const result = await generateAlerts({
        ticker,
        analysisSummary: contradictionSummary,
      });
      setAlerts(result.alerts);
    } catch (error) {
      console.error("Error generating alerts:", error);
      toast({
        variant: "destructive",
        title: "Alert Generation Failed",
        description: "Could not generate alerts. Please try again.",
      });
    } finally {
      setIsGeneratingAlerts(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Bot className="size-8 text-primary" />
            <span className="text-lg font-semibold">TradeSage AI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive>
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/login">
                <SidebarMenuButton>
                  <LogIn />
                  <span>Login Page</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">
              {ticker ? `Analysis: ${ticker}` : "Financial Analysis"}
            </h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2" />
            New Analysis
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitFork className="text-primary" />
                  <span>Contradictions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Summary</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter text from diverse sources to find contradictions,
                        then click summarize.
                      </p>
                      <Textarea
                        placeholder="Paste contradiction analysis here..."
                        value={contradictionInput}
                        onChange={(e) => setContradictionInput(e.target.value)}
                        rows={6}
                      />
                      <Button onClick={handleSummarize} disabled={isSummarizing}>
                        {isSummarizing && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Summarize
                      </Button>
                      {contradictionSummary && (
                        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                          <h4 className="font-semibold">AI Summary:</h4>
                          <p className="text-sm">{contradictionSummary}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Details</AccordionTrigger>
                    <AccordionContent>
                      Detailed contradiction analysis will be displayed here,
                      pinpointing specific conflicting data points from various
                      sources.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary" />
                  <span>Confirmations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Summary</AccordionTrigger>
                    <AccordionContent>
                      Key indicators and analyses align, suggesting a consistent
                      market sentiment.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Details</AccordionTrigger>
                    <AccordionContent>
                      Multiple analysts have upgraded their ratings, citing
                      strong earnings and positive forward guidance.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GaugeCircle className="text-primary" />
                  <span>Confidence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Summary</AccordionTrigger>
                    <AccordionContent>
                      Overall confidence score is high based on the volume of
                      confirmations versus contradictions.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Details</AccordionTrigger>
                    <AccordionContent>
                      Confidence score: 85/100. Weighted average of positive
                      signals outweighs the few negative indicators.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Alert Generation</h2>
              <Button
                onClick={handleGenerateAlerts}
                disabled={isGeneratingAlerts || !contradictionSummary}
              >
                {isGeneratingAlerts && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Bell className="mr-2" />
                Generate Alerts
              </Button>
            </div>
            {isGeneratingAlerts && (
              <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4">Generating actionable alerts...</p>
              </div>
            )}
            {alerts.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {alerts.map((alert, index) => {
                  const Icon = severityIcons[alert.severity];
                  const color = severityColors[alert.severity];
                  return (
                    <Alert key={index} className="shadow-md">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <AlertTitle className={`capitalize ${color}`}>
                        {alert.severity}
                      </AlertTitle>
                      <AlertDescription>
                        <p className="font-semibold">{alert.message}</p>
                        <p className="mt-1 text-xs">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </p>
                      </AlertDescription>
                    </Alert>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Analysis</DialogTitle>
            <DialogDescription>
              Enter a stock ticker to begin your analysis.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="ticker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Ticker</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AAPL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Start Analysis</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
