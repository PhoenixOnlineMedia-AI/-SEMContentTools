import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { type, content, model = 'sonar', instructions } = await req.json()

    if (!type || !content) {
      throw new Error('Missing required fields: type and content are required')
    }

    // Call Perplexity API
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
            content: `You are a content enhancement assistant specializing in improving text while maintaining its core meaning and purpose.
                     You must follow these general guidelines:
                     - Maintain the original meaning and key points
                     - Keep appropriate tone and style unless specifically asked to change it
                     - Return only the enhanced text without any formatting or explanation
                     - Do not add any HTML tags unless they were in the original text
                     - Focus on improving clarity, engagement, and effectiveness
                     - Do not include any additional commentary or explanations
                     - Return the text exactly as it should appear, with no markdown or other formatting`
          },
          {
            role: 'user',
            content: `Content to enhance: ${content}
                     Enhancement type: ${type}
                     
                     Instructions:
                     ${instructions}
                     
                     Enhance the content following these instructions exactly.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const data = await response.json()
    const enhancedContent = data.choices[0].message.content

    // Clean up the response
    const cleanContent = enhancedContent.trim()

    // Return the response with CORS headers
    return new Response(
      JSON.stringify({ content: cleanContent }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
}) 