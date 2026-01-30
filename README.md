# ETP Dev — Site vitrine (HTML / CSS / JS)

Site vitrine multi-pages pour une activité de développement web, avec un style moderne, un thème clair/sombre, et quelques interactions JS (animations, filtres, modal, “devis” rapide, validation formulaire).

## ✨ Fonctionnalités

- **Multi-pages** : Accueil, Services, Projets, Contact.
- **Thème Light/Dark** (persisté en localStorage).
- **Menu mobile** (burger + fermeture au clic extérieur).
- **Animations légères** :
  - reveal on scroll (IntersectionObserver)
  - effet tilt (sur certaines cards)
  - compteur animé (stats)
- **Services** :
  - cartes avec prix
  - bouton “Ajouter au devis”
  - total estimatif animé + possibilité de retirer / reset
- **Projets** :
  - filtres par tags (chips)
  - recherche live
  - **modal** d’aperçu (données JSON dans data-project)
- **Contact** :
  - validation front (JS)
  - compteur de caractères
  - bouton “copier email”
  - envoi **démo** (fake loading) → à brancher sur un backend réel

## 🧱 Pages

- `index.html` : page d’accueil + hero + tuiles de navigation
- `services.html` : services + estimation + FAQ accordéon
- `projets.html` : grille filtrable + recherche + modal
- `contact.html` : infos + formulaire avec validation

/////////////////////////////////////////////////////////////


## 🎨 Personnalisation rapide

Changer le nom / branding

-Dans chaque page HTML : remplace ETP Dev (logo + titre).

-Mets ton vrai mail dans contact.html :

    contact@exemple.com → ton email

-Ajuster les prix / services

    Dans services.html, chaque carte a :

    data-price="790" (prix utilisé par l’estimateur)

    et le texte affiché “À partir de …€”

-Les boutons Ajouter au devis sont gérés dans js/main.js.

/////////////////////////////////////////////////////////////

-Thème clair/sombre

    Le thème est piloté par l’attribut :

    <html data-theme="dark">

    Le bouton “Thème” toggle et sauvegarde en localStorage.


## 🧠 Notes importantes

-Formulaire contact : l’envoi est une démo (pas d’email envoyé).

    Pour envoyer réellement : brancher un backend (PHP, Node, Symfony, etc.) ou un service (Formspree, EmailJS, etc.).

-Le site est optimisé pour être simple, rapide et propre : pas de framework, pas de build.


## 🛠️ Tech stack

HTML5

CSS3 (variables, responsive, cards, gradients)

JavaScript vanilla (DOM + IntersectionObserver)


## 📜 Licence

Projet vitrine. Utilisation libre pour ton activité (adapte le nom, les contenus, et les mentions légales si tu le mets en ligne).