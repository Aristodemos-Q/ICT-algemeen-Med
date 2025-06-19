 # Improvement Plan

## Backend & Database

- **TimescaleDB** gebruiken en hosten op een Raspberry Pi (voor de testfase).
- **Supabase** gebruiken voor:
  - Functionaliteiten die niet super snel hoeven te zijn.
  - Authenticatie (zoals login).

## Authenticatie & Gebruikersbeheer

- Een **admin account** voor de organisatie.
  - Admin kan accounts aanmaken voor werknemers.
  - Werknemersaccounts kunnen beperkt worden tot bepaalde functies.

## Dashboard

- **Dashboard Libraries**
  - Onderzoeken welke library het meest geschikt is om het dashboard mee te maken.
- **Icon Libraries**
  - De beste library zoeken voor iconen (liefst in SVG-formaat).
- **Charts**
  - De beste npm-module vinden voor het maken van charts.
- **Taalgebruik**
  - Overwegen of we JavaScript willen blijven gebruiken.
  - Waarschijnlijk zoveel mogelijk overgaan naar TypeScript.

### Dashboard Structuur

- **Menustructuur**
  - Welke menu’s zijn er?
  - Wat is er per menu te vinden?

- **AI Functionaliteiten in het Dashboard**
  - Zoekfunctie voor evenementen.
  - Vragen stellen over bepaalde evenementen.
  - Nieuwe limieten instellen m.b.v. AI (zoals regels en restricties).
  - Aanpassen van het gedrag van de AI in relatie tot de data.

## Projectplan

- Dit moet nog opgesteld worden.

## Sensor

- **Inhoud van de sensor**
  - Wat gaat er allemaal in?
- **Behuizing**
  - Hoe verwerken we het netjes in een doosje?
  - Is IPX67 haalbaar?

## User Experience Enhancements

**Theme Toggle**

- Add a light/dark mode toggle since your CSS already has dark mode variables
Consider adding custom theme options or color preferences
Loading States

- Implement skeleton loading states for a more polished loading experience
- Add progressive loading for dashboard components
Notification Center

- Expand the notification dropdown with categories (system, alerts, tasks)
- Add notification settings and ability to mark as read/unread
Keyboard Navigation

- Improve keyboard accessibility with shortcuts for common actions
- Add keyboard focus indicators for better accessibility

*Cashed data for offline support? (Waarschijnlijk niet)
* Make it so that you can turn on and off the extensive tool tips (keyboard tooltips) in settings
*Give notification bubble colors based on the priority level of the notification and the highest priority is shown
*for keyboard hot keys that are shown change them according to the platform that the user visits from so when from windows show windows hot key when from mac show mac hot key
*Automaticly get website in right language