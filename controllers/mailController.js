const mailService = require('../services/mailService');

/**
 * Gère l'envoi des invitations par mail
 */
const sendInvitation = async (req, res) => {
    const { email, teamName, contextName, inviteLink } = req.body;

    if (!email || !inviteLink) {
        return res.status(400).json({ error: 'Email et lien d\'invitation requis.' });
    }

    try {
        await mailService.sendInvitationEmail(email, teamName || 'Equipe SAJE', contextName || 'Collaboration', inviteLink);
        res.status(200).json({ success: true, message: 'Email envoyé avec succès.' });
    } catch (error) {
        console.error('Erreur détaillée mail:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'envoi de l\'email.',
            details: error.message 
        });
    }
};

module.exports = {
    sendInvitation
};
