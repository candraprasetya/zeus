import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Pixel Agents Office and View Office button adhere to repository contracts", async () => {
  const [pixelOfficeSrc, chatSurfaceSrc, sharedSrc, chatShellCss] = await Promise.all([
    read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
    read("../src/components/ChatSurface.tsx"),
    read("../src/features/chat/transcript/shared.tsx"),
    read("../src/styles/chat-shell.css"),
  ]);

  // 1. Verify 4 agents exist in PixelAgentsOffice
  assert.match(pixelOfficeSrc, /id:\s*"zeus"/);
  assert.match(pixelOfficeSrc, /id:\s*"hermes"/);
  assert.match(pixelOfficeSrc, /id:\s*"athena"/);
  assert.match(pixelOfficeSrc, /id:\s*"apollo"/);

  // 2. Verify walking & inquiring sub-agent behavior for Athena
  assert.match(pixelOfficeSrc, /athenaIsWalking/);
  assert.match(pixelOfficeSrc, /athenaBubble/);
  assert.match(pixelOfficeSrc, /hermesBubble/);
  assert.match(pixelOfficeSrc, /zeusBubble/);

  // 3. Verify modal export exists
  assert.match(pixelOfficeSrc, /export function PixelAgentsOfficeModal/);

  // 4. Verify ChatSurface has "View Office" button with live & idle indicator
  assert.match(chatSurfaceSrc, /zeus-view-office-btn/);
  assert.match(chatSurfaceSrc, /View Office/);
  assert.match(chatSurfaceSrc, /office-btn-idle/);
  assert.match(chatSurfaceSrc, /<PixelAgentsOfficeModal/);

  // 5. Verify AI AGENT TEAM hub and idle state support
  assert.match(pixelOfficeSrc, /AI AGENT TEAM/);
  assert.match(pixelOfficeSrc, /isWorking/);

  // 5. Verify Thinking transcript row integrates PixelAgentsOffice
  assert.match(sharedSrc, /<PixelAgentsOffice\s+streaming=\{streaming\}/);
  assert.match(sharedSrc, /Pixel Agents Office/);

  // 6. Verify CSS definitions and ensure no backdrop-filter or pixelated literals in css
  assert.match(chatShellCss, /\.zeus-view-office-btn/);
  assert.match(chatShellCss, /\.pixel-office-modal-backdrop/);
  assert.match(chatShellCss, /\.pixel-office-container/);
  assert.match(chatShellCss, /\.pixel-agent-card/);
  assert.match(chatShellCss, /\.pixel-action-log-panel/);
  assert.doesNotMatch(chatShellCss, /backdrop-filter:\s*blur/);
});

test("PixelAgentsOffice and ZeusSubagentTasksFloatingPanel use dynamic settings subagent data", async () => {
  const [pixelOfficeSrc, floatingPanelSrc, subagentsHookSrc] = await Promise.all([
    read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
    read("../src/components/ZeusSubagentTasksFloatingPanel.tsx"),
    read("../src/hooks/use-subagents-data.ts"),
  ]);

  // Hook exports useSubagentsData and handles presets & custom subagents
  assert.match(subagentsHookSrc, /export function useSubagentsData/);
  assert.match(subagentsHookSrc, /Task\(fixer\)/);
  assert.match(subagentsHookSrc, /Task\(explorer\)/);
  assert.match(subagentsHookSrc, /Task\(test-runner\)/);

  // Both PixelAgentsOffice and floating panel consume useSubagentsData
  assert.match(pixelOfficeSrc, /useSubagentsData\(\)/);
  assert.match(floatingPanelSrc, /useSubagentsData\(\)/);

  // Role Zeus as Main System Coordinator
  assert.match(pixelOfficeSrc, /Main System Coordinator/);
  assert.match(floatingPanelSrc, /Main System Coordinator/);

  // Dynamic tag references
  assert.match(floatingPanelSrc, /fixerSubagent\.tag/);
  assert.match(floatingPanelSrc, /explorerSubagent\.tag/);
  assert.match(floatingPanelSrc, /testRunnerSubagent\.tag/);
});
