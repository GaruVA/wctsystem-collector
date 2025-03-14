/**
 * Navigation helper utilities
 * These functions help parse and format navigation instructions from API responses
 */

interface NavigationStep {
  maneuver: {
    type: string;
    modifier?: string;
    instruction?: string;
  };
  distance: number; // in meters
  duration: number; // in seconds
  name: string; // street name
}

interface Instruction {
  text: string;
  distance: string;
  maneuverType: string;
}

/**
 * Parses navigation steps from the API response and formats them for display
 * @param steps Array of navigation steps from the API
 * @returns Formatted instructions for display
 */
export const parseNavigationSteps = (steps: NavigationStep[]): Instruction[] => {
  if (!steps || !steps.length) {
    return [];
  }
  
  return steps.map(step => {
    // Format the instruction text
    let text = step.maneuver.instruction || formatInstruction(step.maneuver.type, step.maneuver.modifier, step.name);
    
    // Format the distance
    const distance = formatDistance(step.distance);
    
    return {
      text,
      distance,
      maneuverType: step.maneuver.type
    };
  });
};

/**
 * Get the current instruction based on the next active step
 * @param instructions Parsed instructions
 * @param currentStepIndex Index of the current step
 * @returns The current instruction text and distance
 */
export const getCurrentInstruction = (
  instructions: Instruction[], 
  currentStepIndex: number
): { text: string; distance: string } => {
  if (!instructions.length || currentStepIndex < 0 || currentStepIndex >= instructions.length) {
    return { text: "Proceed to destination", distance: "Unknown distance" };
  }
  
  return {
    text: instructions[currentStepIndex].text,
    distance: instructions[currentStepIndex].distance
  };
};

/**
 * Format a maneuver instruction based on its type and modifier
 * @param type The maneuver type (e.g., "turn")
 * @param modifier The modifier (e.g., "left")
 * @param streetName The street name
 * @returns A formatted instruction string
 */
const formatInstruction = (type: string, modifier?: string, streetName?: string): string => {
  const street = streetName && streetName !== "" ? ` onto ${streetName}` : "";
  
  switch (type) {
    case "turn":
      return `Turn ${modifier || ""}${street}`;
    case "depart":
      return `Depart${street}`;
    case "arrive":
      return "Arrive at destination";
    case "merge":
      return `Merge ${modifier || ""}${street}`;
    case "on ramp":
      return `Take ramp ${modifier || ""}${street}`;
    case "off ramp":
      return `Exit ${modifier || ""}${street}`;
    case "fork":
      return `Keep ${modifier || ""}${street}`;
    case "roundabout":
      return `Enter roundabout${street}`;
    case "exit roundabout":
      return `Exit roundabout${street}`;
    case "end of road":
      return `End of road, turn ${modifier || ""}${street}`;
    case "continue":
      return `Continue ${modifier || "straight"}${street}`;
    default:
      return `Proceed${street}`;
  }
};

/**
 * Format a distance value for display
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }
};

/**
 * Determine if the user is close to the next waypoint (bin)
 * @param currentLocation Current user location
 * @param waypointLocation Waypoint location
 * @param thresholdMeters Threshold distance in meters (default 50m)
 * @returns Boolean indicating if user is close to waypoint
 */
export const isCloseToWaypoint = (
  currentLocation: { latitude: number; longitude: number },
  waypointLocation: [number, number], // [longitude, latitude]
  thresholdMeters: number = 50
): boolean => {
  // Calculate distance in meters
  const R = 6371e3; // Earth's radius in meters
  const φ1 = currentLocation.latitude * Math.PI/180;
  const φ2 = waypointLocation[1] * Math.PI/180;
  const Δφ = (waypointLocation[1] - currentLocation.latitude) * Math.PI/180;
  const Δλ = (waypointLocation[0] - currentLocation.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= thresholdMeters;
};