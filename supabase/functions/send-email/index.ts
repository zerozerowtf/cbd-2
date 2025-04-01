import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.12";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON payload',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    // Validate required environment variables
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
    const missingEnvVars = requiredEnvVars.filter(v => !Deno.env.get(v));
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port: Number(Deno.env.get("SMTP_PORT")),
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // Test mode - just check connection
    if (body.test === true) {
      try {
        // Verify connection configuration
        await transporter.verify();
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'SMTP connection test successful',
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json'
            } 
          }
        );
      } catch (error) {
        console.error('SMTP connection test failed:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `SMTP connection test failed: ${error.message}`,
            details: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json'
            },
            status: 500
          }
        );
      }
    }

    // Regular email sending
    const { to, subject, content } = body;

    if (!to || !subject || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: to, subject, or content',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    try {
      // Send email
      await transporter.sendMail({
        from: Deno.env.get("SMTP_FROM"),
        to,
        subject,
        text: content.replace(/<[^>]*>/g, ''), // Plain text version (strip HTML)
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${subject}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #1a2e35;
                  margin: 0;
                  padding: 0;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  padding: 20px;
                  background: #1a2e35;
                  color: #f5f3ee;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .header p {
                  margin: 5px 0 0;
                  color: #a59d8f;
                }
                .content {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .booking-details {
                  background: #f5f3ee;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .booking-details div {
                  margin: 10px 0;
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  color: #a59d8f;
                  font-size: 14px;
                  border-top: 1px solid #f5f3ee;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Casa di Barbara</h1>
                <p>Ihr mediterranes Zuhause in Airole</p>
              </div>
              ${content}
              <div class="footer">
                <p>Casa di Barbara | Via Roma, 14 | 18030 Airole (IM) | Italien</p>
              </div>
            </body>
          </html>
        `,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent successfully',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          } 
        }
      );
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
