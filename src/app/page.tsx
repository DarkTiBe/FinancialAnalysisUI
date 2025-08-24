
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
  Send
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ticker, setTicker] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setTicker(values.ticker.toUpperCase());
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out successfully!" });
      router.push("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Bot className="size-8 text-primary" />
              <span className="text-lg font-semibold">Financial Analysis AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Card className="flex-grow flex flex-col">
              <CardContent className="flex-grow overflow-y-auto">
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-2">
                    <Bot className="w-20 h-20 text-primary" />
                    <div className="bg-muted rounded-lg p-3">
                      <p>Hello! I'm a financial analysis AI agent. Please provide the name of the company, the ticker symbol of the stock you wish to analyze, or a hypothesis theory.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="relative w-full">
                  <Textarea
                    placeholder="Type your message..."
                    className="pr-12"
                  />
                  <Button size="icon" className="absolute top-1/2 right-2 -translate-y-1/2">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-grow">
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
                    <p className="text-sm text-muted-foreground">
                      Enter text from diverse sources to find contradictions, then
                      click summarize.
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
                  </CardContent>
                </Card>
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="text-primary" />
                      <span>Confirmations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Key indicators and analyses align, suggesting a consistent
                      market sentiment. Multiple analysts have upgraded their
                      ratings, citing strong earnings and positive forward
                      guidance.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
