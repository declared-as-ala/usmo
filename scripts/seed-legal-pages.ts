import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const legalData = [
  {
    key: 'privacy',
    title: 'Politique de Confidentialité',
    content: `1. Engagement et Responsable du Traitement
L’Union Sportive Monastirienne (USM), association sportive fondée en 1923 dont le siège est situé à l'Avenue Ibn El Jazzar, 5000 Monastir (Tunisie), accorde la plus haute importance à la protection et à la confidentialité des données personnelles de ses supporters, adhérents, visiteurs et partenaires.

Le présent document détaille nos engagements conformément à la loi organique tunisienne n° 2004-63 du 27 juillet 2004 portant sur la protection des données à caractère personnel ainsi qu'aux meilleurs standards internationaux (RGPD).

2. Données Personnelles Collectées
Dans le cadre de votre utilisation de notre site internet et de nos services officiels, nous pouvons être amenés à collecter les catégories de données suivantes :
• Données d'identité : Nom, prénom, date de naissance, nationalité.
• Données de contact : Adresse e-mail, numéro de téléphone, adresse postale de livraison ou de facturation.
• Données de compte et Fan Zone : Identifiants, points de fidélité « Points Bleus », pronostics, badges obtenus, historique d'adhésion.
• Données de commande et Boutique Officielle : Détail des articles commandés, historique des achats, mode de livraison ou retrait au Stade Mustapha Ben Jannet.
• Données techniques et de navigation : Adresse IP, type de terminal, données de cookies de session et statistiques anonymisées.

3. Finalités du Traitement
Vos données sont traitées pour les finalités légitimes suivantes :
• Gestion et suivi des commandes de la Boutique Officielle USM.
• Gestion des adhésions, abonnements et accès aux enceintes sportives (Stade Mustapha Ben Jannet et Salle Mohamed-Mzali).
• Animation de la communauté de supporters et attribution des récompenses Fan Zone.
• Envoi d'informations officielles, calendriers des matchs, résultats et newsletters (sous réserve de votre consentement).
• Sécurisation de notre infrastructure numérique et prévention des fraudes.

4. Confidentialité et Non-Divulgation
L'Union Sportive Monastirienne s'engage à ne jamais vendre, louer ou céder vos données personnelles à des tiers à des fins commerciales sans votre consentement explicite. Vos données ne sont accessibles qu'aux collaborateurs habilités du club et à nos prestataires techniques de confiance soumis à des obligations strictes de confidentialité.

5. Durée de Conservation
Vos données sont conservées uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
• Données de compte supporter : Conservées pendant toute la durée d'activité du compte plus 3 ans après la dernière interaction.
• Données comptables et commandes boutique : Conservées pendant 10 ans conformément aux obligations légales tunisiennes.
• Données de newsletter : Conservées jusqu'à votre désinscription effective.

6. Vos Droits et Contact
Conformément à la réglementation applicable, vous disposez des droits d'accès, de rectification, de mise à jour, d'opposition et de suppression des données vous concernant.

Pour exercer vos droits ou pour toute question relative à vos données personnelles, vous pouvez contacter notre secrétariat général :
• Par e-mail : contact@usmonastir.org.tn
• Par courrier : Union Sportive Monastirienne — Secrétariat Général, Avenue Ibn El Jazzar, 5000 Monastir, Tunisie.`,
  },
  {
    key: 'terms',
    title: "Conditions Générales d'Utilisation",
    content: `1. Objet et Champ d'Application
Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme numérique officielle de l'Union Sportive Monastirienne (USM), accessible via le site web et les applications associées.

Tout accès, navigation ou utilisation du site implique l'acceptation pleine et entière, sans réserve, des présentes CGU par l'utilisateur.

2. Propriété Intellectuelle et Droits Réservés
L'ensemble des éléments constituant le site officiel de l'US Monastir — incluant sans limitation les logos officiels, marques déposées « US Monastir », « USM 1923 », écussons, armoiries, photographies des joueurs et du staff, vidéos, retransmissions, graphismes, textes, chartes graphiques et bases de données — sont la propriété exclusive de l'Union Sportive Monastirienne ou font l'objet d'une autorisation expresse d'utilisation.

Toute reproduction, représentation, diffusion, adaptation ou exploitation totale ou partielle de ces éléments, par quelque procédé que ce soit, sans l'accord écrit et préalable de l'US Monastir, est strictement interdite et constitue une contrefaçon sanctionnée par la loi.

3. Boutique Officielle et Réservations de Produits
• Prix et Disponibilité : Les prix des articles présentés sur la boutique sont indiqués en Dinars Tunisiens (TND / DT) toutes taxes comprises. Les offres de produits sont valables tant qu'elles sont visibles sur le site et dans la limite des stocks disponibles.
• Modalités de Commande : Les commandes passées en ligne peuvent faire l'objet d'un retrait direct à la boutique officielle du club (à proximité du Stade Mustapha Ben Jannet) ou d'une expédition via nos partenaires logistiques agréés.
• Réclamations : Pour toute question relative à un article, le service client est joignable via l'espace Contact ou à la boutique du club.

4. Espace Fan Zone et Règles de Bonne Conduite
L'US Monastir met à disposition de ses supporters des espaces d'interaction (Fan Zone, pronostics, votes). Tout utilisateur s'engage à respecter les principes d'éthique sportive et de courtoisie. Sont formellement proscrits :
• Tout propos injurieux, diffamatoire, raciste, violent, haineux ou portant atteinte à l'honneur d'autrui ou des clubs adverses.
• L'utilisation de robots ou de systèmes automatisés pour fausser les classements de pronostics ou les votes.
L'USM se réserve le droit de suspendre ou supprimer tout compte contrevenant sans préavis.

5. Matchdays et Accès aux Enceintes Sportives
Les informations de billetterie, horaires de matchs et accès au Stade Mustapha Ben Jannet ainsi qu'à la Salle Mohamed-Mzali sont fournies à titre indicatif sous réserve de modifications par la Fédération Tunisienne de Football (FTF) ou les autorités publiques. Les spectateurs sont tenus de respecter le règlement intérieur des stades et les protocoles de sécurité en vigueur.

6. Droit Applicable et Juridiction Compétente
Les présentes CGU sont soumises au droit tunisien. En cas de contestation ou de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut de résolution amiable, les tribunaux compétents de Monastir (Tunisie) seront seuls compétents.`,
  },
  {
    key: 'cookies',
    title: 'Politique relative aux Cookies',
    content: `1. Qu'est-ce qu'un Cookie ?
Un cookie est un petit fichier texte déposé et stocké sur votre terminal (ordinateur, tablette, smartphone) lors de votre navigation sur le site officiel de l'Union Sportive Monastirienne. Il permet de mémoriser vos actions et préférences (choix de langue, session supporter, panier d'achat) pendant une période donnée.

2. Les Cookies que Nous Utilisons
Notre site utilise différentes catégories de cookies pour vous offrir une expérience fluide, sécurisée et personnalisée :

• Cookies Strictement Nécessaires (Obligatoires) :
Ces cookies sont indispensables au bon fonctionnement technique de la plateforme. Ils vous permettent de naviguer sur le site, de maintenir votre session active, de conserver les articles dans votre panier boutique et d'assurer la sécurité des transactions. Ils ne requièrent pas votre consentement préalable.

• Cookies de Préférences et de Fonctionnalités :
Ces cookies permettent au site de mémoriser vos choix (par exemple la langue sélectionnée : Français, Arabe ou Anglais) et d'adapter l'affichage pour une navigation plus intuitive.

• Cookies de Mesure d'Audience et de Performance :
Ces cookies recueillent des informations anonymes sur la façon dont les visiteurs utilisent le site (pages les plus consultées, temps passé, erreurs éventuelles). Ces données nous permettent d'optimiser en permanence les performances du site et la rapidité de chargement des actualités et matchs.

3. Durée de Conservation des Cookies
• Cookies de session : Ces fichiers temporaires sont automatiquement supprimés dès que vous fermez votre navigateur internet.
• Cookies persistants : Ces cookies demeurent sur votre terminal pour une durée maximale de 13 mois conformément aux recommandations en vigueur, sauf suppression manuelle de votre part.

4. Comment Gérer et Paramétrer vos Cookies ?
Vous pouvez à tout moment configurer votre navigateur internet pour accepter, refuser ou supprimer tout ou partie des cookies. Voici la procédure selon votre navigateur :
• Google Chrome : Paramètres > Confidentialité et sécurité > Cookies et autres données des sites.
• Mozilla Firefox : Options > Vie privée et sécurité > Cookies et données de sites.
• Safari : Préférences > Confidentialité > Bloquer tous les cookies.
• Microsoft Edge : Paramètres > Cookies et autorisations de site.

Veuillez noter que le blocage des cookies strictement nécessaires peut altérer certaines fonctionnalités essentielles du site, telles que la gestion de votre panier dans la boutique officielle ou l'accès à votre espace supporter.`,
  },
];

async function seed() {
  console.log('[Legal Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('[Legal Seed] Connected.');

  const db = mongoose.connection.db;
  if (!db) throw new Error('No DB connection');

  const col = db.collection('legalpages');
  for (const item of legalData) {
    console.log(`[Legal Seed] Upserting legal page: ${item.key} (${item.title})`);
    await col.updateOne(
      { key: item.key },
      {
        $set: {
          key: item.key,
          title: item.title,
          content: item.content,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log('[Legal Seed] Successfully seeded legal pages in MongoDB!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Legal Seed] Error:', err);
  process.exit(1);
});
