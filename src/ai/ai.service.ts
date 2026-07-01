// import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import OpenAI from 'openai';
// import { Priority } from 'src/common/enums/priority.enum';
// import { SentimentLabel } from 'src/common/enums/sentiment-label.enum';
// import { AnalyzeIssueResult, ResolutionSummaryResult } from './types/ai.types';

// type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
// type JsonObject = { [key: string]: JsonValue };

// @Injectable()
// export class AiService {
//   private readonly logger = new Logger(AiService.name);
//   private readonly client: OpenAI;
//   private readonly model: string;

//   constructor(private readonly configService: ConfigService) {
//     const apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
//     if (!apiKey) {
//       throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
//     }

//     this.client = new OpenAI({ apiKey });
//     this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
//   }

//   async analyzeIssue(messages: string[]): Promise<AnalyzeIssueResult> {
//     const prompt = [
//       'You are SmartCX AI for Nigerian SME customer support triage.',
//       'Analyze the provided customer messages and return strict JSON only with this exact schema:',
//       '{"sentimentScore":number,"sentimentLabel":"positive|neutral|frustrated|angry","category":string,"priority":"low|medium|high|urgent","summary":string}',
//       'Rules:',
//       '- sentimentScore must be from -1.0 to 1.0',
//       '- category should be concise (e.g. Delivery, Refund, Product, Payment, Technical)',
//       '- priority should reflect urgency, customer impact, and escalation risk',
//       '- summary must be 1-2 short sentences',
//       '',
//       `messages: ${JSON.stringify(messages)}`,
//     ].join('\n');

//     const parsed = await this.generateJson(prompt);
//     return {
//       sentimentScore: this.toBoundedNumber(parsed.sentimentScore, -1, 1, 0),
//       sentimentLabel: this.toSentimentLabel(parsed.sentimentLabel),
//       category: this.toStringValue(parsed.category, 'General'),
//       priority: this.toPriority(parsed.priority),
//       summary: this.toStringValue(parsed.summary, 'No summary generated'),
//     };
//   }

//   async generateTicketDraft(conversation: string[], customerName: string): Promise<string> {
//     const prompt = [
//       'You are an expert support operations assistant drafting ticket descriptions.',
//       'Generate a clean, concise ticket draft from the conversation context.',
//       'Requirements:',
//       '- Include problem context, impact, and suggested next action.',
//       '- Keep it under 180 words.',
//       '- Keep tone professional and actionable.',
//       '',
//       `customerName: ${customerName}`,
//       `conversation: ${JSON.stringify(conversation)}`,
//     ].join('\n');

//     return this.generateText(prompt);
//   }

//   async generateInsightSummary(ticketContext: object): Promise<string> {
//     const prompt = [
//       'You are SmartCX AI assistant for ticket workspace insights.',
//       'Provide a short tactical insight summary for agents handling this ticket.',
//       'Include:',
//       '- likely root cause',
//       '- risk if delayed',
//       '- best next response strategy',
//       'Return plain text in 3-5 bullet points.',
//       '',
//       `ticketContext: ${JSON.stringify(ticketContext)}`,
//     ].join('\n');

//     return this.generateText(prompt);
//   }

//   async generateSmartReplies(context: string): Promise<string[]> {
//     const prompt = [
//       'You are generating smart support replies for agents.',
//       'Return strict JSON only with schema: {"replies": string[]}',
//       'Rules:',
//       '- Provide 3 concise reply options',
//       '- Keep each option under 35 words',
//       '- Professional and empathetic tone',
//       '- Avoid overpromising outcomes',
//       '',
//       `context: ${context}`,
//     ].join('\n');

//     const parsed = await this.generateJson(prompt);
//     const repliesRaw = parsed.replies;
//     if (!Array.isArray(repliesRaw)) {
//       return [];
//     }

//     return repliesRaw
//       .map((item) => (typeof item === 'string' ? item.trim() : ''))
//       .filter((item) => item.length > 0)
//       .slice(0, 3);
//   }

//   async generateResolutionSummary(
//     ticket: object,
//     messages: object[],
//   ): Promise<ResolutionSummaryResult> {
//     const prompt = [
//       'You are SmartCX AI and must produce a case closure summary.',
//       'Return strict JSON only with schema:',
//       '{"problem":string,"action":string,"sentimentShift":string}',
//       'Rules:',
//       '- problem: concise summary of customer issue',
//       '- action: key remediation steps taken',
//       '- sentimentShift: short phrase like "frustrated -> positive (78%)"',
//       '',
//       `ticket: ${JSON.stringify(ticket)}`,
//       `messages: ${JSON.stringify(messages)}`,
//     ].join('\n');

//     const parsed = await this.generateJson(prompt);
//     return {
//       problem: this.toStringValue(parsed.problem, 'Problem summary unavailable'),
//       action: this.toStringValue(parsed.action, 'Action summary unavailable'),
//       sentimentShift: this.toStringValue(parsed.sentimentShift, 'neutral -> neutral (0%)'),
//     };
//   }

//   private async generateText(prompt: string): Promise<string> {
//     try {
//       const response = await this.client.responses.create({
//         model: this.model,
//         input: prompt,
//         temperature: 0.2,
//       });

//       const output = response.output_text?.trim();
//       return output && output.length > 0 ? output : 'No content generated';
//     } catch (error) {
//       this.logger.error('OpenAI text generation failed', error instanceof Error ? error.stack : undefined);
//       throw new InternalServerErrorException('AI text generation failed');
//     }
//   }

//   private async generateJson(prompt: string): Promise<JsonObject> {
//     const text = await this.generateText(prompt);
//     try {
//       const parsed = JSON.parse(text) as JsonValue;
//       if (!this.isJsonObject(parsed)) {
//         throw new Error('AI output is not a JSON object');
//       }
//       return parsed;
//     } catch (error) {
//       this.logger.error('Failed to parse AI JSON output', error instanceof Error ? error.stack : undefined);
//       throw new InternalServerErrorException('AI output could not be parsed as JSON');
//     }
//   }

//   private isJsonObject(value: JsonValue): value is JsonObject {
//     return typeof value === 'object' && value !== null && !Array.isArray(value);
//   }

//   private toStringValue(value: JsonValue | undefined, fallback: string): string {
//     return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
//   }

//   private toBoundedNumber(
//     value: JsonValue | undefined,
//     min: number,
//     max: number,
//     fallback: number,
//   ): number {
//     if (typeof value !== 'number' || Number.isNaN(value)) {
//       return fallback;
//     }
//     return Math.max(min, Math.min(max, value));
//   }

//   private toSentimentLabel(value: JsonValue | undefined): SentimentLabel {
//     const normalized = typeof value === 'string' ? value.toLowerCase().trim() : '';
//     if (normalized === SentimentLabel.POSITIVE) {
//       return SentimentLabel.POSITIVE;
//     }
//     if (normalized === SentimentLabel.FRUSTRATED) {
//       return SentimentLabel.FRUSTRATED;
//     }
//     if (normalized === SentimentLabel.ANGRY) {
//       return SentimentLabel.ANGRY;
//     }
//     return SentimentLabel.NEUTRAL;
//   }

//   private toPriority(value: JsonValue | undefined): Priority {
//     const normalized = typeof value === 'string' ? value.toLowerCase().trim() : '';
//     if (normalized === Priority.LOW) {
//       return Priority.LOW;
//     }
//     if (normalized === Priority.HIGH) {
//       return Priority.HIGH;
//     }
//     if (normalized === Priority.URGENT) {
//       return Priority.URGENT;
//     }
//     return Priority.MEDIUM;
//   }
// }


import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Priority } from 'src/common/enums/priority.enum';
import { SentimentLabel } from 'src/common/enums/sentiment-label.enum';
import { AnalyzeIssueResult, ResolutionSummaryResult } from './types/ai.types';

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }

    this.apiKey = apiKey;
    this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash');
  }

  async analyzeIssue(messages: string[]): Promise<AnalyzeIssueResult> {
    const prompt = [
      'You are SmartCX AI for Nigerian SME customer support triage.',
      'Analyze the provided customer messages and return strict JSON only with this exact schema:',
      '{"sentimentScore":number,"sentimentLabel":"positive|neutral|frustrated|angry","category":string,"priority":"low|medium|high|urgent","summary":string}',
      'Rules:',
      '- sentimentScore must be from -1.0 to 1.0',
      '- category should be concise (e.g. Delivery, Refund, Product, Payment, Technical)',
      '- priority should reflect urgency, customer impact, and escalation risk',
      '- summary must be 1-2 short sentences',
      '',
      `messages: ${JSON.stringify(messages)}`,
    ].join('\n');

    const parsed = await this.generateJson(prompt);
    return {
      sentimentScore: this.toBoundedNumber(parsed.sentimentScore, -1, 1, 0),
      sentimentLabel: this.toSentimentLabel(parsed.sentimentLabel),
      category: this.toStringValue(parsed.category, 'General'),
      priority: this.toPriority(parsed.priority),
      summary: this.toStringValue(parsed.summary, 'No summary generated'),
    };
  }

  async generateTicketDraft(conversation: string[], customerName: string): Promise<string> {
    const prompt = [
      'You are an expert support operations assistant drafting ticket descriptions.',
      'Generate a clean, concise ticket draft from the conversation context.',
      'Requirements:',
      '- Include problem context, impact, and suggested next action.',
      '- Keep it under 180 words.',
      '- Keep tone professional and actionable.',
      '',
      `customerName: ${customerName}`,
      `conversation: ${JSON.stringify(conversation)}`,
    ].join('\n');

    return this.generateText(prompt);
  }

  async generateInsightSummary(ticketContext: object): Promise<string> {
    const prompt = [
      'You are SmartCX AI assistant for ticket workspace insights.',
      'Provide a short tactical insight summary for agents handling this ticket.',
      'Include:',
      '- likely root cause',
      '- risk if delayed',
      '- best next response strategy',
      'Return plain text in 3-5 bullet points.',
      '',
      `ticketContext: ${JSON.stringify(ticketContext)}`,
    ].join('\n');

    return this.generateText(prompt);
  }

  async generateSmartReplies(context: string): Promise<string[]> {
    const prompt = [
      'You are generating smart support replies for agents.',
      'Return strict JSON only with schema: {"replies": string[]}',
      'Rules:',
      '- Provide 3 concise reply options',
      '- Keep each option under 35 words',
      '- Professional and empathetic tone',
      '- Avoid overpromising outcomes',
      '',
      `context: ${context}`,
    ].join('\n');

    const parsed = await this.generateJson(prompt);
    const repliesRaw = parsed.replies;
    if (!Array.isArray(repliesRaw)) {
      return [];
    }

    return repliesRaw
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0)
      .slice(0, 3);
  }

  async generateResolutionSummary(
    ticket: object,
    messages: object[],
  ): Promise<ResolutionSummaryResult> {
    const prompt = [
      'You are SmartCX AI and must produce a case closure summary.',
      'Return strict JSON only with schema:',
      '{"problem":string,"action":string,"sentimentShift":string}',
      'Rules:',
      '- problem: concise summary of customer issue',
      '- action: key remediation steps taken',
      '- sentimentShift: short phrase like "frustrated -> positive (78%)"',
      '',
      `ticket: ${JSON.stringify(ticket)}`,
      `messages: ${JSON.stringify(messages)}`,
    ].join('\n');

    const parsed = await this.generateJson(prompt);
    return {
      problem: this.toStringValue(parsed.problem, 'Problem summary unavailable'),
      action: this.toStringValue(parsed.action, 'Action summary unavailable'),
      sentimentShift: this.toStringValue(parsed.sentimentShift, 'neutral -> neutral (0%)'),
    };
  }

  // ---- Internals: this is the only part that's actually different from OpenAI ----

  private async generateText(prompt: string): Promise<string> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2 },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Gemini API error: ${response.status} ${errorBody}`);
        throw new InternalServerErrorException('AI text generation failed');
      }

      const data = await response.json();
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return output && output.length > 0 ? output : 'No content generated';
    } catch (error) {
      this.logger.error('Gemini text generation failed', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('AI text generation failed');
    }
  }

  private async generateJson(prompt: string): Promise<JsonObject> {
    // Tell Gemini explicitly to return raw JSON only, no markdown fences.
    const jsonPrompt = `${prompt}\n\nRespond with raw JSON only. Do not wrap it in markdown code blocks.`;
    const text = await this.generateText(jsonPrompt);

    // Gemini sometimes wraps JSON in ```json ... ``` anyway — strip it defensively.
    const cleaned = text.replace(/```json\s*|```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned) as JsonValue;
      if (!this.isJsonObject(parsed)) {
        throw new Error('AI output is not a JSON object');
      }
      return parsed;
    } catch (error) {
      this.logger.error('Failed to parse AI JSON output', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('AI output could not be parsed as JSON');
    }
  }

  private isJsonObject(value: JsonValue): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private toStringValue(value: JsonValue | undefined, fallback: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
  }

  private toBoundedNumber(
    value: JsonValue | undefined,
    min: number,
    max: number,
    fallback: number,
  ): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, value));
  }

  private toSentimentLabel(value: JsonValue | undefined): SentimentLabel {
    const normalized = typeof value === 'string' ? value.toLowerCase().trim() : '';
    if (normalized === SentimentLabel.POSITIVE) return SentimentLabel.POSITIVE;
    if (normalized === SentimentLabel.FRUSTRATED) return SentimentLabel.FRUSTRATED;
    if (normalized === SentimentLabel.ANGRY) return SentimentLabel.ANGRY;
    return SentimentLabel.NEUTRAL;
  }

  private toPriority(value: JsonValue | undefined): Priority {
    const normalized = typeof value === 'string' ? value.toLowerCase().trim() : '';
    if (normalized === Priority.LOW) return Priority.LOW;
    if (normalized === Priority.HIGH) return Priority.HIGH;
    if (normalized === Priority.URGENT) return Priority.URGENT;
    return Priority.MEDIUM;
  }
}