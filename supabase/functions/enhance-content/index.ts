import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

// Function to extract text content while preserving tag positions
function extractTextAndTags(html: string) {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Function to process nodes and build a map of tag positions
  function processNode(node: Node, tagMap: Map<number, string[]>) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      return text
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const openTag = element.outerHTML.slice(0, element.outerHTML.indexOf('>') + 1)
      const closeTag = `</${element.tagName.toLowerCase()}>`
      
      let content = ''
      for (const childNode of Array.from(node.childNodes)) {
        content += processNode(childNode, tagMap)
      }

      return `${openTag}${content}${closeTag}`
    }

    return ''
  }

  return processNode(tempDiv, new Map())
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, content } = await req.json()

    if (!type || !content) {
      throw new Error('Missing required fields: type and content')
    }

    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured')
    }

    // Get type-specific instructions
    const instructions = {
      'improve-writing': `Improve grammar, clarity, and flow while keeping the same meaning.
      - Fix any grammar or spelling errors
      - Improve sentence structure and flow
      - Maintain the original meaning and key points
      - Keep the same tone and style
      - Do not add new information that wasn't implied in the original`,
      
      'enhance-readability': `Make the text easier to read while maintaining key information.
      - Break down complex sentences into simpler ones
      - Use clearer language and explanations
      - Maintain all key information and meaning
      - Aim for a reading level suitable for general audience
      - Use shorter paragraphs where appropriate`,
      
      'rephrase-content': `Rephrase to be more engaging while keeping the same meaning.
      - Rephrase sentences to be more clear and engaging
      - Maintain the exact same meaning and key points
      - Keep the same tone and level of formality
      - Avoid clichés and overused phrases
      - Do not add new information that wasn't implied in the original`,
      
      'use-persuasive': `Add persuasive language while maintaining authenticity.
      - Add persuasive language and power words
      - Enhance emotional appeal and engagement
      - Maintain credibility and authenticity
      - Keep the core message intact
      - Do not make claims that weren't in the original content`,
      
      'expand-content': (content: string) => {
        // Count words in the content
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        
        // Set expansion ratio based on content length
        let expansionRatio = '50-75%';
        let maxNewWords = '';
        
        if (wordCount < 30) {
          // For very short content (like headlines or single sentences)
          expansionRatio = '200-300%';
          maxNewWords = `Add approximately ${wordCount * 2} to ${wordCount * 3} new words.`;
        } else if (wordCount < 100) {
          // For short paragraphs
          expansionRatio = '75-100%';
          maxNewWords = `Add approximately ${Math.floor(wordCount * 0.75)} to ${wordCount} new words.`;
        } else {
          // For longer content
          expansionRatio = '40-60%';
          maxNewWords = `Add approximately ${Math.floor(wordCount * 0.4)} to ${Math.floor(wordCount * 0.6)} new words.`;
        }
        
        return `Expand the content by adding more details, examples, and explanations. 
        - Add ${expansionRatio} more content to the original text
        - ${maxNewWords}
        - Elaborate on key points with supporting information
        - Add relevant examples where helpful
        - Maintain the original flow and structure
        - IMPORTANT: Do not make the content excessively long or repetitive`;
      },
      
      'make-concise': `Make the content more concise while preserving all key information.
      - Reduce the length by approximately 30-40%
      - Remove redundant or unnecessary words and phrases
      - Combine sentences where appropriate
      - Use more direct language
      - Ensure all key points remain intact`,
      
      'make-professional': `Use more formal, professional language.
      - Use professional and formal language
      - Maintain appropriate business/academic tone
      - Keep content clear and precise
      - Remove casual expressions and colloquialisms
      - Use industry-appropriate terminology where relevant`,
      
      'make-casual': `Use more casual, conversational language.
      - Use conversational and approachable language
      - Add personality and relatability
      - Maintain content quality and accuracy
      - Keep key points clear and engaging
      - Use contractions and simpler vocabulary`
    };

    // Check if the content is too long - might be a sign that the entire page was sent instead of just the selection
    const isLikelyFullPage = content.includes('###') && content.length > 1000 && (type === 'make-concise' || type === 'expand-content');
    
    // If it looks like a full page for make-concise or expand-content, we'll focus on just the first paragraph
    const contentToProcess = isLikelyFullPage 
      ? content.split('###')[0].trim() // Take only the content before the first heading
      : content;

    console.log(`Processing content of type: ${type}, length: ${contentToProcess.length}, isLikelyFullPage: ${isLikelyFullPage}`);

    // Get the appropriate instructions based on the type
    const typeInstructions = typeof instructions[type] === 'function' 
      ? instructions[type](contentToProcess) 
      : instructions[type] || 'Improve the text while maintaining its meaning.';

    const systemMessage = `You are enhancing content while preserving HTML structure.

CRITICAL HTML RULES:
1. You MUST preserve ALL HTML tags exactly as they appear in the input
2. Do not add ANY new HTML tags
3. Do not remove ANY existing HTML tags
4. Do not modify ANY HTML attributes
5. Do not add markdown formatting
6. Do not add citations or references
7. Do not add line breaks between tags
8. Keep the exact same HTML structure
9. ONLY enhance the text content between tags, not the tags themselves
10. Do not add any content outside of what was provided
11. IMPORTANT: If the content contains headings (###) and you're asked to make it concise, ONLY process the text before the first heading

Example input:
<h3>Title</h3><p>Content here.</p>

Example output:
<h3>Enhanced Title</h3><p>Enhanced content here.</p>

Your task: ${typeInstructions}`;

    // Log the input for debugging
    console.log('Enhancing content of type:', type);
    console.log('Content length:', contentToProcess.length);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Enhance ONLY this content while keeping ALL HTML tags exactly as they appear: ${contentToProcess}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content returned from API')
    }

    // Clean up the response
    const enhancedContent = data.choices[0].message.content
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .replace(/\[\d+\]/g, '') // Remove citation references
      .replace(/\*\*/g, ''); // Remove markdown bold

    // If we processed only part of the content, we need to return just that part
    const finalContent = isLikelyFullPage
      ? enhancedContent // Return only the enhanced first paragraph
      : enhancedContent;

    return new Response(
      JSON.stringify({ content: finalContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 