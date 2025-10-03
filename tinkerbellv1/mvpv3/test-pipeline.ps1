#!/usr/bin/env pwsh
# Complete end-to-end pipeline test

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Tinkerbell Pipeline E2E Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$testUrl = "https://seomonitor.com"
$outputDir = "test/gemini"

# Step 1: Context Extraction
Write-Host "[1/5] Context Extraction..." -ForegroundColor Yellow
node test/gemini/test-context-extraction.js `
  --company-url $testUrl `
  --output "$outputDir/test-context.json"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Context extraction failed" -ForegroundColor Red
    exit 1
}

$context = Get-Content "$outputDir/test-context.json" | ConvertFrom-Json
Write-Host "✓ Company: $($context.context.company_name)" -ForegroundColor Green
Write-Host "✓ Industry: $($context.context.industry)`n" -ForegroundColor Green

# Step 2: Persona Generation
Write-Host "[2/5] Persona Generation..." -ForegroundColor Yellow
node test/gemini/test-persona-gen.js `
  --context "$outputDir/test-context.json" `
  --output "$outputDir/test-personas.json"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Persona generation failed" -ForegroundColor Red
    exit 1
}

$personas = Get-Content "$outputDir/test-personas.json" | ConvertFrom-Json
Write-Host "✓ Generated $($personas.personas.Count) personas" -ForegroundColor Green
Write-Host "  - $($personas.personas[0].name)" -ForegroundColor Gray
Write-Host "  - $($personas.personas[1].name)`n" -ForegroundColor Gray

# Step 3: Idea Generation
Write-Host "[3/5] Idea Generation..." -ForegroundColor Yellow
$personaId = $personas.personas[0].id
node test/gemini/test-idea-gen.js `
  --context "$outputDir/test-context.json" `
  --personas "$outputDir/test-personas.json" `
  --persona-id $personaId `
  --target-ideas 10 `
  --batch-size 5 `
  --output "$outputDir/test-ideas.json"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Idea generation failed" -ForegroundColor Red
    exit 1
}

$ideas = Get-Content "$outputDir/test-ideas.json" | ConvertFrom-Json
Write-Host "✓ Generated $($ideas.ideas.Count) ideas" -ForegroundColor Green
Write-Host "  - $($ideas.ideas[0].headline)" -ForegroundColor Gray
Write-Host "  - $($ideas.ideas[1].headline)`n" -ForegroundColor Gray

# Step 4: Script Generation
Write-Host "[4/5] Script Generation..." -ForegroundColor Yellow
$ideaIds = ($ideas.ideas[0..2] | ForEach-Object { $_.id }) -join ","
node test/gemini/test-script-gen.js `
  --ideas "$outputDir/test-ideas.json" `
  --idea-ids $ideaIds `
  --output "$outputDir/test-scripts.json"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Script generation failed" -ForegroundColor Red
    exit 1
}

$scripts = Get-Content "$outputDir/test-scripts.json" | ConvertFrom-Json
Write-Host "✓ Generated $($scripts.scripts.Count) video scripts" -ForegroundColor Green
Write-Host "  - $($scripts.scripts[0].title)" -ForegroundColor Gray
Write-Host "  Duration: $($scripts.scripts[0].duration)" -ForegroundColor Gray
Write-Host "  CTA: $($scripts.scripts[0].call_to_action)`n" -ForegroundColor Gray

# Step 5: Asset Generation (Image Prompt Ready)
Write-Host "[5/5] Asset Generation (Ready)..." -ForegroundColor Yellow
$imagePrompt = $scripts.scripts[0].image_prompt
Write-Host "✓ Image prompt generated (${imagePrompt.Length} chars)" -ForegroundColor Green
Write-Host "`nSample prompt:" -ForegroundColor Gray
Write-Host $imagePrompt.Substring(0, [Math]::Min(150, $imagePrompt.Length)) + "..." -ForegroundColor DarkGray

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Pipeline Test Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Generated files:" -ForegroundColor White
Write-Host "  1. $outputDir/test-context.json" -ForegroundColor Gray
Write-Host "  2. $outputDir/test-personas.json" -ForegroundColor Gray
Write-Host "  3. $outputDir/test-ideas.json" -ForegroundColor Gray
Write-Host "  4. $outputDir/test-scripts.json" -ForegroundColor Gray

Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  • Use image_prompt field for Imagen/Veo generation" -ForegroundColor Gray
Write-Host "  • Test via Web UI: npm run start:minidemo" -ForegroundColor Gray
Write-Host "  • See PIPELINE.md for full documentation`n" -ForegroundColor Gray

Write-Host "✓ All steps completed successfully!" -ForegroundColor Green
