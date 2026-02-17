// Én “inngang” til barnet/agenten.
// Bytt implementasjonen senere til faktisk backend-kall.
// UI trenger ikke endres.

export async function generateChildReply(args: {
  scenarioTitle: string;
  scenarioDescription: string;
  parentMessage: string;
}): Promise<string> {
  // Simuler nettverkslatens så UI føles realistisk
  await new Promise((r) => setTimeout(r, 450));

  // Enkle regler: stabil, demo-vennlig og forutsigbart
  const msg = args.parentMessage.toLowerCase();

  if (msg.includes("må") || msg.includes("nå")) {
    return "I don't want to! Why do I have to?";
  }
  if (msg.includes("forstår") || msg.includes("skjønner")) {
    return "But I'm still upset…";
  }
  if (msg.includes("?")) {
    return "I don't know…";
  }

  return "I don't like this.";
}
