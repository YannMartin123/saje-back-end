const SibApiV3Sdk = require('@getbrevo/brevo');

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * Envoie un mail d'invitation à rejoindre une équipe ou un examen
 * @param {string} to - Adresse email du destinataire
 * @param {string} teamName - Nom de l'équipe
 * @param {string} contextName - Nom de l'examen ou 'Collaboration'
 * @param {string} inviteLink - Lien d'invitation
 */
const sendInvitationEmail = async (to, teamName, contextName, inviteLink) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #5D5FEF; }
            .content { padding: 30px 0; }
            .button-container { text-align: center; margin-top: 30px; }
            .button { 
                background-color: #5D5FEF; 
                color: white !important; 
                padding: 12px 25px; 
                text-decoration: none; 
                border-radius: 5px; 
                font-weight: bold;
                display: inline-block;
            }
            .footer { font-size: 12px; color: #777; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            .highlight { color: #5D5FEF; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #5D5FEF; margin: 0;">SAJE</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Système Automatisé de Jugement d'Examens</p>
            </div>
            <div class="content">
                <h2>Bonjour,</h2>
                <p>Vous avez été invité par l'équipe <span class="highlight">${teamName}</span> à collaborer sur <span class="highlight">${contextName}</span>.</p>
                <p>SAJE vous permet de corriger des examens de manière intelligente et de collaborer avec vos collègues en toute simplicité.</p>
                <p>Cliquez sur le bouton ci-dessous pour accepter l'invitation et rejoindre l'espace de travail :</p>
                <div class="button-container">
                    <a href="${inviteLink}" class="button">Rejoindre l'équipe</a>
                </div>
                <p style="margin-top: 30px; font-size: 13px;">Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :<br>
                <span style="color: #5D5FEF;">${inviteLink}</span></p>
            </div>
            <div class="footer">
                <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
                <p>&copy; 2026 SAJE - Plateforme de Collaboration Pédagogique</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `Invitation : Rejoignez ${teamName} sur SAJE`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { "name": "SAJE", "email": "contact@saje-exams.com" };
    sendSmtpEmail.to = [{ "email": to }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully via Brevo:', data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('Error sending email with Brevo:', error);
        throw error;
    }
};

module.exports = {
    sendInvitationEmail
};
