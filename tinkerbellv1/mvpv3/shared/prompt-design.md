# Prompt Design Playbook

Use the same structure regardless of language client.

## Core Pattern
1. **System message**: Define persona, tone, constraints.
2. **Context**: Supply domain data, schemas, rules.
3. **User request**: Keep concise, explicit output format.
4. **Guardrails**: Reinforce safety, refusal, or fallback behavior.

## Prompt Techniques
- **Numbered instructions**: Models follow ordered steps better.
- **Few-shot examples**: Demonstrate task using short input/output pairs. Store reusable examples in code and inject dynamically.
- **Delimiters**: Wrap structured data within triple backticks for cleaner parsing.
- **Checklists**: End prompts with bullet checklist; instruct the model to confirm each item.

## Long Context Strategy
- Chunk source documents to <8K tokens per chunk for Flash, <30K for Pro. Summaries accumulate quickly.
- Provide `responseMimeType` (JS) / `response_mime_type` (Python) for JSON output to reduce parsing errors.
- Use tool/function calling for deterministic workflows instead of plain-text instructions.

## Multimodal Inputs
- Convert binary data to base64 strings (Node: `Buffer.from(file).toString("base64")`).
- Provide captions describing the media alongside the binary attachment; this raises grounding accuracy.
- For video frames, send keyframes plus textual timeline hints.

## Evaluation Loop
- Log prompts/responses with metadata (model, temperature, safety filters).
- Auto-grade outputs using regression prompts or embedding similarity.
- Maintain a canary test suite before every deployment; fail the build if confidence drops below threshold.

Reuse these guidelines from every language-specific recipe to stay DRY.