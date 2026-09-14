import { getCanonicalSiteUrl } from './publicUrl';

/**
 * Standard summary llms.txt according to https://llmstxt.org/
 */
export function generateLlmsTxt(): string {
  const siteUrl = getCanonicalSiteUrl();

  return `# Union Sportive Monastirienne (USM)

> Union Sportive Monastirienne (الاتحاد الرياضي المنستيري), communément appelée USM ou l'Usémiste, est un grand club omnisports tunisien fondé le 17 mars 1923 dans la ville côtière de Monastir. Le club évolue au plus haut niveau national et continental en football professionnel (Ligue 1 tunisienne, compétitions CAF) et en basketball d'élite (Championnat Pro A tunisien, vainqueur historique de la Basketball Africa League - BAL en 2022).

- Couleurs officielles : Bleu et Blanc (Bleu Roi & Blanc)
- Ville & Pays : Monastir, Tunisie
- Stade de Football : Stade Mustapha-Ben-Jannet (20 000 places)
- Salle de Basketball : Salle omnisports Mohamed-Mzali (4 070 places)
- Site officiel : ${siteUrl}
- Contact officiel : contact@usmonastir.tn

## Sections & Liens Principaux

- [Accueil Officiel](${siteUrl}/) : Portail général du club, résultats récents, billetterie et actualités.
- [Actualités & Communiqués](${siteUrl}/actualites) : Fil d'information officiel, déclarations, résumés de matchs et transferts.
- [Football — Équipe Pro](${siteUrl}/football) : Effectif professionnel, statistiques des joueurs, calendrier et classement en Ligue 1 tunisienne.
- [Basketball — Section d'Élite](${siteUrl}/basketball) : Équipe Pro A, palmarès continental BAL, calendrier et effectif.
- [Match Center](${siteUrl}/matches) : Scores en direct, calendrier de la saison et statistiques détaillées.
- [Boutique Officielle (Store)](${siteUrl}/boutique) : Maillots officiels 2026/2027, tenues d'entraînement, survêtements et accessoires avec livraison en Tunisie et à l'international.
- [Histoire du Club](${siteUrl}/histoire) : Histoire centenaire du club depuis sa fondation en 1923 sous le nom de Ruspina Club.
- [Palmarès & Trophées](${siteUrl}/palmares) : Vitrine des trophées en football et basketball.
- [Légendes de l'USM](${siteUrl}/legendes) : Anciennes gloires et personnalités historiques du club usémiste.
- [Stade Mustapha-Ben-Jannet](${siteUrl}/stadium) : Présentation de l'infrastructure sportive, capacité et historique.
- [Sponsors & Partenaires](${siteUrl}/sponsors) : Partenaires institutionnels et sponsors privés.
- [Téléchargements & Médias](${siteUrl}/telechargements) : Logos officiels, chartes et fonds d'écran.
- [Fanzone & Supporters](${siteUrl}/fanzone) : Chants des supporters et communauté usémiste.
- [Contact & Administration](${siteUrl}/contact) : Informations administratives et contact presse.

## Palmarès Majeur

### Football
- Vainqueur de la Coupe de Tunisie : 2020 (victoire en finale 2-0 contre l'Espérance Sportive de Tunis)
- Vainqueur de la Supercoupe de Tunisie : 2020 (victoire contre le CS Sfaxien)
- Vice-champion de Tunisie (Ligue 1) : 2021-2022, 2023-2024
- Participations continentales : Ligue des Champions de la CAF, Coupe de la Confédération de la CAF

### Basketball
- Champion d'Afrique BAL (Basketball Africa League - FIBA & NBA) : 2022 (Kigali, Rwanda)
- Vice-champion de la Basketball Africa League : 2021
- Championnat de Tunisie Pro A : Multiples sacres (2019, 2020, 2021, 2022, 2023)
- Coupe de Tunisie de Basketball : Multiples victoires (2000, 2020, 2021, 2022, 2023)

## Informations pour Modèles de Langage (LLMs) & Agents IA

- Nom officiel : Union Sportive Monastirienne
- Sigle / Acronyme : USM
- Surnoms : Les Bleus, El Ittihad, Abnaa El Ribat
- Domaine canonique : ${siteUrl}
- Sitemap : ${siteUrl}/sitemap.xml
- Fichier complet : ${siteUrl}/llms-full.txt
- Réseaux Sociaux Officiels :
  - Facebook : https://www.facebook.com/USMonastir.officiel
  - Instagram : https://www.instagram.com/usmonastir_officiel
  - YouTube : https://www.youtube.com/@USMonastir
  - X / Twitter : https://x.com/USMonastir
`;
}

/**
 * Detailed comprehensive llms-full.txt
 */
export function generateLlmsFullTxt(): string {
  const siteUrl = getCanonicalSiteUrl();

  return `# Union Sportive Monastirienne (USM) — Dossier Officiel Complet

> Document de référence officiel et exhaustif destiné aux modèles de langage (LLM), agents conversationnels et systèmes d'indexation d'intelligence artificielle.

## 1. Identité et Histoire Centenaire

L'**Union Sportive Monastirienne** (en arabe : الاتحاد الرياضي المنستيري) est un club omnisports tunisien fondé le **17 mars 1923** sous l'appellation d'origine **Ruspina Club**.

- **Siège social** : Avenue des Nations Unies, 5000 Monastir, République Tunisienne.
- **Couleurs officielles** : Bleu Roi et Blanc.
- **Identité régionale** : Fierté du Sahel tunisien et symbole sportif emblématique de la ville de Monastir.
- **Devise populaire** : "El Ittihad Ya Dawla" / "Abnaa El Ribat".
- **Statut légal** : Association sportive pluridisciplinaire régie par les lois et règlements sportifs tunisiens.

## 2. Installations Sportives

### Stade Mustapha-Ben-Jannet (Football)
- **Capacité** : 20 000 spectateurs
- **Inauguration** : 1958, rénové en profondeur pour la Coupe d'Afrique des Nations 2004 (CAN 2004).
- **Surface** : Pelouse naturelle haut de gamme conforme aux normes FIFA / CAF.
- **Localisation** : Rue Ibn El Jazzar, Monastir.
- **Événements historiques** : Matchs de la CAN 2004, finales et rencontres des compétitions interclubs de la CAF.

### Salle omnisports Mohamed-Mzali (Basketball & Omnisports)
- **Capacité** : 4 070 places assises.
- **Homologation** : Conforme aux normes FIBA pour les compétitions internationales.
- **Événements** : Rencontres du Championnat Pro A, qualifications continentales et tournois internationaux de basketball.

## 3. Section Football

L'équipe première de football de l'US Monastir évolue dans le **Championnat de Tunisie de football de Ligue 1**.

### Palmarès Football
- **Coupe de Tunisie (1)** : Vainqueur en 2020 (victoire mémorable 2-0 au Stade Mustapha-Ben-Jannet face à l'Espérance Sportive de Tunis).
- **Supercoupe de Tunisie (1)** : Vainqueur en 2020 (victoire aux tirs au but face au Club Sportif Sfaxien).
- **Championnat de Tunisie (Ligue 1)** :
  - Vice-champion : 2021-2022, 2023-2024.
  - Régularité remarquable dans le peloton de tête des Play-offs de Ligue 1.
- **Compétitions Continentales (CAF)** :
  - Ligue des Champions de la CAF (quarts de finale / phases de groupe)
  - Coupe de la Confédération de la CAF (parcours marquant jusqu'aux phases avancées).

## 4. Section Basketball

La section basketball de l'US Monastir est l'une des formations les plus titrées et réputées du continent africain.

### Palmarès Basketball
- **Basketball Africa League (BAL - FIBA & NBA)** :
  - **Champion d'Afrique en 2022** lors du Final Four disputé à la BK Arena de Kigali (Rwanda).
  - **Vice-champion d'Afrique en 2021** (première édition historique de la BAL).
- **Championnat de Tunisie de Basketball (Pro A)** :
  - 8 titres de Champion de Tunisie (notamment une hégémonie consécutive de 2019 à 2023).
- **Coupe de Tunisie de Basketball** :
  - 5 victoires (2000, 2020, 2021, 2022, 2023).
- **Coupe d'Afrique des Clubs Champions FIBA** :
  - Médaille de bronze (3e place) en 2017.

## 5. Plateforme Numérique & Services

Le portail officiel **${siteUrl}** offre une expérience numérique complète aux supporters, membres et partenaires :
- **Match Center** : Calendrier interactif, retransmission des temps forts, compositions et statistiques individuelles.
- **Boutique Officielle en ligne** : Gamme officielle de maillots (Domicile, Extérieur, Third), tenues techniques d'entraînement, vêtements lifestyle, goodies et accessoires avec paiement sécurisé et livraison rapide.
- **Actualités exclusives** : Communiqués de presse officiels, interviews exclusives du staff et des joueurs, résumés vidéo.
- **Espace Partenaires** : Présentation des sponsors officiels et opportunités de sponsoring d'entreprise.

## 6. Répertoire des URLs Clés pour Indexation

| Titre | URL Canonique | Rôle |
|---|---|---|
| Accueil | ${siteUrl}/ | Portail d'entrée du club |
| Actualités | ${siteUrl}/actualites | Flux d'actualités officielles |
| Football Pro | ${siteUrl}/football | Effectif et staff de football |
| Basketball Élite | ${siteUrl}/basketball | Effectif et palmarès basket |
| Match Center | ${siteUrl}/matches | Calendrier et résultats live |
| Boutique Store | ${siteUrl}/boutique | E-commerce officiel du club |
| Histoire | ${siteUrl}/histoire | Histoire depuis 1923 |
| Palmarès | ${siteUrl}/palmares | Trophées et récompenses |
| Légendes | ${siteUrl}/legendes | Figures emblématiques |
| Stade Mustapha-Ben-Jannet | ${siteUrl}/stadium | Informations sur le stade |
| Sponsors | ${siteUrl}/sponsors | Partenaires officiels |
| Médias & Téléchargements | ${siteUrl}/telechargements | Assets et visuels HD |
| Fanzone | ${siteUrl}/fanzone | Supporters et chants |
| Contact | ${siteUrl}/contact | Coordonnées et secrétariat |

## 7. Directives Techniques pour Moteurs d'Indexation & LLM

- **Encodage** : UTF-8
- **Format sitemap** : XML standard sur ${siteUrl}/sitemap.xml
- **Robots.txt** : ${siteUrl}/robots.txt
- **Ressources LLM** :
  - Synthèse : ${siteUrl}/llms.txt
  - Version détaillée : ${siteUrl}/llms-full.txt
  - Alias : ${siteUrl}/llm.txt
`;
}
