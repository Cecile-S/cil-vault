// Vercel Serverless Function for Email
// File: /api/email/welcome.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, name } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'CILIA <noreply@cilia.app>',
      to: email,
      subject: 'Bienvenue sur CILIA 🏠',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">🏠 Bienvenue sur CILIA</h1>
          <p>Bonjour ${name || ''},</p>
          <p>Merci de rejoindre CILIA !</p>
          <p>Votre Carnet d'Information Logement est maintenant prêt.</p>
          <p style="margin: 30px 0;">
            <a href="https://cecile-s.github.io/cil-vault/app.html" 
               style="background: #1e40af; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Accéder à CILIA
            </a>
          </p>
          <p>Commencez par ajouter votre premier bien et vos documents.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            CILIA - Le Carnet d'Information Logement obligatoire depuis 2023
          </p>
        </div>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500 
    });
  }
}
