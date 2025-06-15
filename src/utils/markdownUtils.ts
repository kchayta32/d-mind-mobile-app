
export const parseMarkdown = (text: string): string => {
  // Convert **text** to <strong>text</strong>
  let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *text* to <em>text</em>
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert line breaks to <br>
  processed = processed.replace(/\n/g, '<br>');
  
  return processed;
};

export const sanitizeAndParseMarkdown = (text: string): string => {
  // Basic sanitization - remove potentially dangerous HTML
  const sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
  
  return parseMarkdown(sanitized);
};
