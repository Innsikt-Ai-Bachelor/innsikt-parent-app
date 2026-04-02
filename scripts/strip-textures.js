#!/usr/bin/env node
// Strips embedded textures from a GLB file so Three.js doesn't try to load them.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../assets/models/girl-model-1.glb");
const dst = path.join(__dirname, "../assets/models/girl-model-notex.glb");

const buf = fs.readFileSync(src);

// GLB layout: 12-byte header, then chunks
const magic = buf.readUInt32LE(0); // 0x46546C67 = "glTF"
const version = buf.readUInt32LE(4);
const jsonChunkLen = buf.readUInt32LE(12);
const jsonChunkType = buf.readUInt32LE(16); // 0x4E4F534A = JSON

const rawJson = buf.subarray(20, 20 + jsonChunkLen).toString("utf8");
const json = JSON.parse(rawJson);

// Remove image/texture data from JSON
delete json.images;
delete json.textures;

// Strip texture refs from materials
if (json.materials) {
  json.materials = json.materials.map((mat) => {
    const m = { ...mat };
    if (m.pbrMetallicRoughness) {
      const pbr = { ...m.pbrMetallicRoughness };
      delete pbr.baseColorTexture;
      delete pbr.metallicRoughnessTexture;
      m.pbrMetallicRoughness = pbr;
    }
    delete m.normalTexture;
    delete m.occlusionTexture;
    delete m.emissiveTexture;
    return m;
  });
}

// Re-encode JSON chunk (must be 4-byte aligned, padded with spaces)
const newJsonStr = JSON.stringify(json);
const paddedLen = Math.ceil(newJsonStr.length / 4) * 4;
const newJsonBuf = Buffer.alloc(paddedLen, 0x20);
Buffer.from(newJsonStr, "utf8").copy(newJsonBuf);

// Keep the BIN chunk as-is
const restOfFile = buf.subarray(20 + jsonChunkLen);

// Rebuild GLB
const newTotal = 12 + 8 + paddedLen + restOfFile.length;
const out = Buffer.alloc(newTotal);
out.writeUInt32LE(magic, 0);
out.writeUInt32LE(version, 4);
out.writeUInt32LE(newTotal, 8);
out.writeUInt32LE(paddedLen, 12);
out.writeUInt32LE(jsonChunkType, 16);
newJsonBuf.copy(out, 20);
restOfFile.copy(out, 20 + paddedLen);

fs.writeFileSync(dst, out);
console.log("✓ Wrote", dst);
