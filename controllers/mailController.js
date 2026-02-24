const mailService = require('../services/mailService');
const supabase = require('../config/supabase');

/**
 * Gère l'envoi des invitations par mail
 */
const sendInvitation = async (req, res) => {
    const { email, teamName, contextName, inviteLink } = req.body;

    if (!email || !inviteLink) {
        return res.status(400).json({ error: 'Email et lien d\'invitation requis.' });
    }

    try {
        // 1. Vérifier si l'utilisateur existe sur la plateforme
        const { data: user, error: userError } = await supabase
            .from('utilisateurs')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (userError) {
            console.error('Erreur lors de la vérification de l\'utilisateur:', userError);
        }

        // 2. Si l'utilisateur existe, lui envoyer une notification dans le système
        if (user) {
            console.log(`Utilisateur trouvé (${user.id}), envoi d'une notification interne.`);
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: user.id,
                    title: 'Nouvelle invitation',
                    message: `Vous avez été invité par l'équipe ${teamName || 'Saje'} à collaborer sur ${contextName || 'un examen'}.`,
                    link: inviteLink,
                    type: 'info',
                    is_read: false
                });

            if (notifError) {
                console.error('Erreur lors de la création de la notification:', notifError);
            }
        }

        // 3. Envoyer l'email dans tous les cas
        await mailService.sendInvitationEmail(email, teamName || 'Equipe SAJE', contextName || 'Collaboration', inviteLink);
        
        res.status(200).json({ 
            success: true, 
            message: 'Invitation traitée avec succès.',
            notificationSent: !!user
        });
    } catch (error) {
        console.error('Erreur détaillée mail/invitation:', error);
        res.status(500).json({ 
            error: 'Erreur lors du traitement de l\'invitation.',
            details: error.message 
        });
    }
};

module.exports = {
    sendInvitation
};
