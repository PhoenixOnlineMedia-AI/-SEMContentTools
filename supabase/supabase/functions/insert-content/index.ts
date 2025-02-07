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
    const { type, content, model = 'sonar', instructions, title } = await req.json()

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
            content: `You are a content generation assistant specializing in creating high-quality, structured content.
                     You must follow the provided formatting instructions exactly.
                     Return only valid HTML without any markdown or additional text.
                     Do not include any "Buy" links or product recommendations.
                     Focus on providing valuable, informative content.`
          },
          {
            role: 'user',
            content: `Context: ${content}
                     Title: ${title}
                     Type: ${type}
                     
                     Instructions:
                     ${instructions}
                     
                     Generate the content following these instructions exactly.`
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
    const generatedContent = data.choices[0].message.content

    // Clean up the response to ensure it's valid HTML
    const cleanContent = generatedContent
      .replace(/```html/g, '')
      .replace(/```/g, '')
      .trim()

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