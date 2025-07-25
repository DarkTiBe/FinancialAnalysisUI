
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
  XCircle,
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
import { Progress } from "@/components/ui/progress";

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
  const [confidenceScore, setConfidenceScore] = React.useState(0);
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
    setConfidenceScore(0);
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
      setConfidenceScore(Math.floor(Math.random() * (95 - 65 + 1)) + 65);
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
            <span className="text-lg font-semibold">Financial Analysis AI</span>
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
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateAlerts}
              disabled={isGeneratingAlerts || !contradictionSummary}
              size="icon"
              aria-label="Generate Alerts"
            >
              {isGeneratingAlerts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell />
              )}
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2" />
              New Analysis
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
          <div className="space-y-6">
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

          <Separator />
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Summary</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="bg-red-50/50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle />
                    <span>Contradictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Medium opposition</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50/50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 />
                    <span>Confirmations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Weak support</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <GaugeCircle />
                    <span>Confidence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{confidenceScore}%</div>
                  <Progress value={confidenceScore} />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Separator />

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Detailed Analysis</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitFork className="text-primary" />
                    <span>Contradictions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold">Mixed Analyst Ratings</h4>
                    <p className="text-sm text-muted-foreground">Analyst ratings are mixed, with 5 buys, 5 holds, and 3 sells, indicating a lack of consensus on the stock's direction.</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold">Insider Selling</h4>
                    <p className="text-sm text-muted-foreground">Insider trading shows significant selling by executives over the last quarter, which could signal a lack of confidence.</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold">Technical vs. Fundamental</h4>
                    <p className="text-sm text-muted-foreground">Technical indicators are bearish (RSI > 70), while fundamental analysis suggests the stock is currently undervalued.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary" />
                    <span>Confirmations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold">Consistent Revenue Growth</h4>
                    <p className="text-sm text-muted-foreground">Revenue has grown consistently by 15% year-over-year for the past three years, demonstrating strong business performance.</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold">Positive Product Reception</h4>
                    <p className="text-sm text-muted-foreground">A recent product launch has received positive reviews and is expected to capture significant market share from competitors.</p>
                  </div>
                   <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold">Strong Balance Sheet</h4>
                    <p className="text-sm text-muted-foreground">The company maintains a strong balance sheet with a low debt-to-equity ratio, indicating financial stability.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
    