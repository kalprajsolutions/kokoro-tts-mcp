const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { loadConfig, loadState, saveState } = require("../dist/config.js");

function isolatedConfig(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "kokoro-config-"));
    const keys = ["TTS_BASE_DIR", "TTS_VOICE", "TTS_SPEED", "TTS_ENABLED", "TTS_AUTO"];
    const original = new Map(keys.map(key => [key, process.env[key]]));
    t.after(() => {
        for (const [key, value] of original) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
        fs.rmSync(root, { recursive: true, force: true });
    });
    for (const key of keys) delete process.env[key];
    // Redirect the default home as well, so an existing user state cannot affect the test.
    t.mock.method(os, "homedir", () => root);
    return root;
}

test("loads default paths and state on first use", t => {
    const root = isolatedConfig(t);
    const config = loadConfig();
    assert.equal(config.baseDir, path.join(root, ".kokoro-tts"));
    assert.equal(config.voice, "af_heart");
    assert.equal(config.speed, 1);
    assert.deepEqual(loadState(config.baseDir), {
        voice: "af_heart", speed: 1, enabled: true, auto: false,
    });
});

test("reads environment overrides", t => {
    const root = isolatedConfig(t);
    Object.assign(process.env, {
        TTS_BASE_DIR: root, TTS_VOICE: "ef_dora", TTS_SPEED: "1.5",
        TTS_ENABLED: "false", TTS_AUTO: "true",
    });
    const config = loadConfig();
    assert.equal(config.baseDir, root);
    assert.equal(config.voice, "ef_dora");
    assert.equal(config.speed, 1.5);
    assert.deepEqual(loadState(root), {
        voice: "ef_dora", speed: 1.5, enabled: false, auto: true,
    });
});

test("saved runtime state survives a fresh load", t => {
    const root = isolatedConfig(t);
    const baseDir = path.join(root, "custom");
    process.env.TTS_BASE_DIR = baseDir;
    process.env.TTS_VOICE = "af_heart";
    const state = { voice: "bm_daniel", speed: 0.75, enabled: false, auto: true };
    saveState(baseDir, state);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(baseDir, "state.json"), "utf8")), state);
    assert.deepEqual(loadState(baseDir), state);
    assert.equal(loadConfig().voice, state.voice);
    assert.equal(loadConfig().speed, state.speed);
});
