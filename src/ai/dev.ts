import { config } from 'dotenv';
config();

import '@/ai/flows/generate-alerts.ts';
import '@/ai/flows/summarize-contradictions.ts';