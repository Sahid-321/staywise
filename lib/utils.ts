/**
 * Formats a location object or string for display
 * Handles both old schema (string) and new schema (object with address, city, state, pincode)
 */
export function formatLocation(location: any): string {
  if (!location) return 'Location not specified';
  
  // If it's already a string (old schema), return it
  if (typeof location === 'string') {
    return location;
  }
  
  // If it's an object (new schema), format it
  if (typeof location === 'object') {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.pincode) parts.push(location.pincode);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  
  return 'Location not specified';
}

/**
 * Gets a short location display (city, state only)
 */
export function formatLocationShort(location: any): string {
  if (!location) return 'Location not specified';
  
  // If it's already a string (old schema), return it
  if (typeof location === 'string') {
    return location;
  }
  
  // If it's an object (new schema), format it
  if (typeof location === 'object') {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  
  return 'Location not specified';
}
