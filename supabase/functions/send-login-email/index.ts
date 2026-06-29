import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
      studentName,
      email,
      username,
      password,
    } = await req.json();

    if (!studentName || !email || !username || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "NextGen Edu Connect <onboarding@resend.dev>",

      to: [email],

      subject: "Welcome to NextGen Edu Connect LMS",

      html: `
      <div style="font-family:Arial;padding:25px">

        <h2 style="color:#2563eb">
          Welcome to NextGen Edu Connect LMS
        </h2>

        <p>Hello <b>${studentName}</b>,</p>

        <p>Your LMS account has been created successfully.</p>

        <table cellpadding="8" style="border-collapse:collapse">

          <tr>
            <td><b>Username</b></td>
            <td>${username}</td>
          </tr>

          <tr>
            <td><b>Password</b></td>
            <td>${password}</td>
          </tr>

        </table>

        <br>

        <a
          href="http://127.0.0.1:5500/login.html"
          style="
            background:#2563eb;
            color:white;
            padding:12px 20px;
            text-decoration:none;
            border-radius:6px;
          ">
          Login
        </a>

        <br><br>

        Regards,<br>
        <b>NextGen Edu Connect Team</b>

      </div>
      `,
    });

    if (error) {
      console.error(error);

      return new Response(
        JSON.stringify(error),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});