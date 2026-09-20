"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

test("funnel prints zero-activity dates between answer days", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "survey-funnel-"));
    const file = path.join(dir, "answers.jsonl");
    const rows = ["2026-01-01", "2026-01-03"].map((day, i) => ({
        uid: `user-${i}`,
        ts: `${day}T10:00:00.000Z`,
        role: "разработчик",
        level: "опытный",
        context: "инхаус",
        block: "разработчик",
        tool: `Инструмент ${i}`,
        answer: "работал",
        sentiment: "да",
    }));
    fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n"));

    try {
        const output = execFileSync(
            process.execPath,
            [path.join(__dirname, "..", "funnel.js"), file],
            { encoding: "utf8" },
        );
        assert.match(output, /2026-01-01: \+1 \/ 1/);
        assert.match(output, /2026-01-02: \+0 \/ 0/);
        assert.match(output, /2026-01-03: \+1 \/ 1/);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
