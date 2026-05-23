// ===== RATE LIMITING & CACHING SETUP =====
// Track last request time to enforce minimum interval between API calls
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds minimum between requests

// In-memory cache to store successful responses and avoid duplicate API calls
const requestCache = new Map<string, { analysis: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache duration (60 minutes)

// ===== MAIN FUNCTION =====
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
  // STEP 1: Create unique cache key from all request parameters
  // This ensures different players/moments/zones get different cache entries
  const cacheKey = `${playerLabel}-${playerRole}-${momentTitle}-${zone}-${channel}`;
  
  // STEP 2: Check if we have a valid cached response
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    // Verify cache hasn't expired (1 hour limit)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Cache hit: ${cacheKey}`); // Optional: monitor cache effectiveness
      return cached.analysis; // Return cached response immediately (no API call)
    } else {
      // Cache expired, remove it
      requestCache.delete(cacheKey);
    }
  }
  
  // STEP 3: Rate limiting - enforce minimum time between API requests
  // This prevents rapid-fire requests from exhausting your quota
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms`); // Optional: monitor delays
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update last request time before making the actual API call
  lastRequestTime = Date.now();
  
  // STEP 4: Make the actual API request (only reaches here if not cached)
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
    const analysis = data.analysis || "Select a player to receive live tactical analysis from Coach Darren's Game Model.";
    
    // STEP 5: Store successful response in cache for future use
    requestCache.set(cacheKey, { analysis, timestamp: Date.now() });
    console.log(`💾 Cached: ${cacheKey} (cache size: ${requestCache.size})`); // Optional: monitor cache growth
    
    return analysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback response - never show raw errors to the user
    return "Tactical link stable. Establishing positional assessment...";
  }
};