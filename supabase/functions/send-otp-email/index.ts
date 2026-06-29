import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    const { email, otp, studentName } = await req.json();

    const { data, error } = await resend.emails.send({

      from: "NextGen Edu Connect <onboarding@resend.dev>",

      to: [email],

      subject: "Password Reset OTP",

      html: `
      <div
      style="
      font-family:Arial;
      max-width:600px;
      margin:auto;
      border:1px solid #ddd;
      border-radius:10px;
      overflow:hidden;">

      <div
      style="
      background:#2563eb;
      color:white;
      padding:20px;
      text-align:center;">

      <h2>NextGen Edu Connect</h2>

      </div>

      <div style="padding:30px;">

      <h3>Hello ${studentName},</h3>

      <p>
      We received a request to reset your password.
      </p>

      <p>
      Please use the OTP below:
      </p>

      <div
      style="
      font-size:38px;
      font-weight:bold;
      text-align:center;
      color:#2563eb;
      letter-spacing:8px;
      margin:25px;">

      ${otp}

      </div>

      <p>

      This OTP is valid for
      <b>5 minutes.</b>

      </p>

      <p>

      If you didn't request this,
      please ignore this email.

      </p>

      <br>

      Regards,<br>

      <b>NextGen Edu Connect Team</b>

      </div>

      </div>
      `
    });

    if(error)
    {
      return new Response(
        JSON.stringify(error),
        {
          status:500,
          headers:{
            ...corsHeaders,
            "Content-Type":"application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify(data),
      {
        status:200,
        headers:{
          ...corsHeaders,
          "Content-Type":"application/json"
        }
      }
    );

  }
  catch(err)
  {
      return new Response(
      JSON.stringify({
        error:err.message
      }),
      {
        status:500,
        headers:{
          ...corsHeaders,
          "Content-Type":"application/json"
        }
      }
    );
  }

});