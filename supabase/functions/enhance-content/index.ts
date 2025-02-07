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
      'improve-writing': 'Improve grammar, clarity, and flow while keeping the same meaning.',
      'enhance-readability': 'Make the text easier to read while maintaining key information.',
      'rephrase-content': 'Rephrase to be more engaging while keeping the same meaning.',
      'use-persuasive': 'Add persuasive language while maintaining authenticity.',
      'expand-content': 'Add relevant details while maintaining flow.',
      'make-concise': 'Make more concise while keeping key points.',
      'make-professional': 'Use more formal, professional language.',
      'make-casual': 'Use more casual, conversational language.'
    }[type] || 'Improve the text while maintaining its meaning.';

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

Example input:
<h3>Title</h3><p>Content here.</p>

Example output:
<h3>Enhanced Title</h3><p>Enhanced content here.</p>

Your task: ${instructions}`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Enhance this content while keeping ALL HTML tags exactly as they appear: ${content}`
          }
        ],
        max_tokens: 1000,
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

    return new Response(
      JSON.stringify({ content: enhancedContent }),
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