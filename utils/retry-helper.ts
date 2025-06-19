// Utility function for retrying failed requests
export async function retryRequest<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, lastError.message);
      
      // Don't retry on authentication errors
      if (
        lastError.message.includes('Invalid login credentials') ||
        lastError.message.includes('User not found') ||
        lastError.message.includes('Invalid email') ||
        lastError.message.includes('Signup is disabled')
      ) {
        throw lastError;
      }
      
      // Only retry on network errors
      if (
        lastError.message.includes('Failed to fetch') ||
        lastError.message.includes('Network connection failed') ||
        lastError.message.includes('timeout') ||
        lastError.message.includes('Request timeout') ||
        lastError.name === 'TypeError' ||
        lastError.name === 'AbortError'
      ) {
        if (attempt < maxRetries) {
          console.log(`Retrying in ${delay}ms... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
          continue;
        }
      }
      
      throw lastError;
    }
  }
  
  throw lastError!;
}
