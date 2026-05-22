export const getTacticalAnalysis = async (
  playerLabel: string,
  playerRole: string,
  momentTitle: string,
  zone: string,
  channel: string,
  formation: string,
  x: number,
  y: number
) => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerLabel,
        playerRole,
        momentTitle,
        zone,
        channel,
        formation,
        x,
        y,
      }),
    });

    if (!response.ok) {
      throw new Error("Analysis request failed");
    }

    const data = await response.json();
    return data.analysis || "Select a player to receive live tactical analysis from Coach Darren's Game Model.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Tactical link stable. Establishing positional assessment...";
  }
};
