# Preislogik für Casa di Barbara - Buchungssystem

## 1. Saisonale Preisstruktur

### 1.1 Saisondefinitionen

| Saisontyp | Zeiträume | Beschreibung |
|-----------|-----------|-------------|
| **Nebensaison** | 01.11 - 31.03 (außer Feiertage) | Geringste Nachfrage, niedrigste Preise |
| **Zwischensaison** | 01.04 - 30.06 & 01.09 - 31.10 | Mittlere Nachfrage, moderate Preise |
| **Hauptsaison** | 01.07 - 31.08 | Höchste Nachfrage, Premiumpreise |
| **Feiertage/Events** | Weihnachten: 20.12 - 06.01<br>Ostern: Karwoche + Osterwoche<br>Spezielle lokale Events | Hohe Nachfrage, erhöhte Preise |

> **Admin-Funktionalität:** Möglichkeit, Saisonzeiträume jährlich anzupassen und Sonderperioden (z.B. für lokale Feste) hinzuzufügen.

### 1.2 Preiskalender-Überschreibungen

Funktion zur manuellen Überschreibung bestimmter Tage/Wochen im Kalender:
- Besondere Events in Airole oder Umgebung
- Lange Wochenenden
- Individuelle Anpassungen basierend auf Nachfrage

> **Admin-Funktionalität:** Kalenderansicht mit Möglichkeit, Preise für einzelne Tage oder Zeiträume individuell anzupassen.

## 2. Grundpreisstruktur

### 2.1 Grundpreise pro Nacht nach Unterkunftsoption und Saison

| Unterkunftsoption | Nebensaison | Zwischensaison | Hauptsaison | Feiertage/Events |
|-------------------|-------------|----------------|-------------|------------------|
| Hauptwohnung | 110 € | 130 € | 150 € | 165 € |
| Hauptwohnung + Nebenzimmer | 140 € | 160 € | 180 € | 195 € |

> **Admin-Funktionalität:** Einfache Anpassung der Grundpreise pro Unterkunftsoption und Saison.

### 2.2 Kapazität der Unterkunftsoptionen

| Unterkunftsoption | Maximale Belegung | Beschreibung |
|-------------------|-------------------|-------------|
| Hauptwohnung | 4 Personen | 1 Doppelbett + 2 Einzelbetten oder Schlafsofa |
| Hauptwohnung + Nebenzimmer | 5-6 Personen | Hauptwohnung + 1 Doppelbett im Nebenzimmer |

> **Admin-Funktionalität:** Möglichkeit zur Anpassung der Belegungsobergrenzen.

## 3. Aufenthaltsdauer und Rabatte

### 3.1 Mindest- und Höchstaufenthaltsdauer

| Saison | Mindestaufenthalt | Maximaler Aufenthalt |
|--------|-------------------|----------------------|
| Nebensaison | 3 Nächte | 28 Nächte |
| Zwischensaison | 3 Nächte | 28 Nächte |
| Hauptsaison | 5 Nächte | 28 Nächte |
| Feiertage/Events | 4 Nächte | 14 Nächte |

> **Admin-Funktionalität:** Anpassbare Mindest- und Höchstaufenthaltsdauer pro Saison.

### 3.2 Rabattstruktur für längere Aufenthalte

| Aufenthaltsdauer | Rabatt auf Grundpreis |
|------------------|----------------------|
| 1-6 Nächte | 0% (Standardpreis) |
| 7-13 Nächte | 10% |
| 14-20 Nächte | 15% |
| 21-28 Nächte | 20% |

> **Admin-Funktionalität:** Anpassbare Rabattstufen nach Aufenthaltsdauer, mit Möglichkeit zur Deaktivierung in bestimmten Zeiträumen.

### 3.3 Last-Minute-Rabatte

| Buchungszeitpunkt vor Anreise | Rabatt |
|-------------------------------|--------|
| Weniger als 7 Tage | 10% |
| Weniger als 3 Tage | 15% |

> **Admin-Funktionalität:** Aktivierbar/deaktivierbar je nach Saison und aktueller Auslastung.

### 3.4 Early-Bird-Rabatte

| Buchungszeitpunkt vor Anreise | Rabatt |
|-------------------------------|--------|
| Mehr als 180 Tage | 10% |
| Mehr als 270 Tage | 15% |

> **Admin-Funktionalität:** Aktivierbar/deaktivierbar je nach Saison.

## 4. Zusätzliche Gebühren und Optionen

### 4.1 Pflichtgebühren

| Gebühr | Betrag | Beschreibung |
|--------|--------|-------------|
| Endreinigung | 80 € | Einmalig pro Aufenthalt |
| Touristensteuer | 2 € | Pro Person/Nacht (nur Erwachsene) |

> **Admin-Funktionalität:** Anpassbare Beträge, Möglichkeit zur Ausnahme bestimmter Buchungen.

### 4.2 Optionale Zusatzleistungen

| Zusatzleistung | Preis | Einheit |
|----------------|------|---------|
| Haustier | 30 € | Pro Aufenthalt |
| Zusätzliche Reinigung | 60 € | Pro Reinigung |
| Hochstuhl | 0 € | Kostenlos auf Anfrage |
| Willkommenspaket | 25 € | Einmalig (lokale Produkte) |
| Frühstückskorb | 15 € | Pro Person/Tag |

> **Admin-Funktionalität:** Hinzufügen/Entfernen von Optionen, Preisanpassung, Festlegung von Verfügbarkeiten.

## 5. Zahlungsbedingungen

### 5.1 Anzahlungs- und Restzahlungsstruktur

| Zahlungsart | Betrag | Fälligkeit |
|-------------|--------|-----------|
| Anzahlung | 50% des Gesamtbetrags | Bei Buchung |
| Restzahlung | 50% des Gesamtbetrags | 7 Tage vor Anreise |

> **Admin-Funktionalität:** Anpassbare Prozentsätze und Fristen, Möglichkeit zur Änderung bei individuellen Buchungen.

### 5.2 Kautionsregelung

| Kaution | Betrag | Rückzahlung |
|---------|--------|------------|
| Standard | 200 € | Innerhalb von 7 Tagen nach Abreise |

> **Admin-Funktionalität:** Anpassbarer Kautionsbetrag, Option zur Kaution in bar oder per Kreditkarte.

## 6. Stornierungsbedingungen

### 6.1 Standard-Stornierungsbedingungen

| Stornierungszeitpunkt | Rückerstattung |
|-----------------------|---------------|
| Bis 30 Tage vor Anreise | 100% der Anzahlung |
| 29-14 Tage vor Anreise | 50% der Anzahlung |
| 13-7 Tage vor Anreise | 0% der Anzahlung |
| Weniger als 7 Tage vor Anreise | Keine Rückerstattung |

### 6.2 Flexible Stornierungsbedingungen (optional gegen Aufpreis)

| Stornierungszeitpunkt | Rückerstattung |
|-----------------------|---------------|
| Bis 7 Tage vor Anreise | 100% der Anzahlung |
| 6-3 Tage vor Anreise | 50% der Anzahlung |
| Weniger als 3 Tage vor Anreise | Keine Rückerstattung |

> **Admin-Funktionalität:** Auswahl zwischen verschiedenen Stornierungsbedingungen, Möglichkeit zur individuellen Anpassung.

## 7. Spezielle Angebote

### 7.1 Saisonale Angebote

| Angebotstyp | Beschreibung | Gültigkeit |
|-------------|-------------|------------|
| Winterspecial | 7 Nächte zum Preis von 5 | November-Februar |
| Wochenendverlängerung | 3 Nächte zum Preis von 2 | Sonntag-Donnerstag in der Nebensaison |

> **Admin-Funktionalität:** Einfache Einrichtung von zeitlich begrenzten Angeboten.

### 7.2 Gutscheincodes

Einfaches System für gelegentliche Rabattaktionen:
- Prozentuale Rabatte (z.B. 10% für Stammgäste)
- Absolute Beträge (z.B. 50€ Nachlass)

> **Admin-Funktionalität:** Möglichkeit zur Erstellung individueller Gutscheincodes mit fester Gültigkeitsdauer.

## 8. Buchungsverwaltung und Statistiken

### 8.1 Buchungsübersicht

Einfache Übersichtsseite zur Verwaltung aller Buchungen:
- Kalenderansicht mit allen bestätigten Buchungen
- Listenansicht mit Filteroptionen (Datum, Status, Plattform)
- Detailansicht für einzelne Buchungen

> **Admin-Funktionalität:** Zentrale Verwaltung aller Buchungsdaten mit Export-Funktion.

### 8.2 Einfache Auslastungsstatistik

Grundlegende Statistiken zur Bewertung der Vermietungsleistung:
- Auslastungsrate nach Monat/Jahr
- Durchschnittliche Aufenthaltsdauer
- Umsatz pro Zeitraum
- Häufigste Herkunftsländer der Gäste

> **Admin-Funktionalität:** Jährliche und monatliche Auswertungen zur Geschäftsplanung.

## 9. Buchungsplattform-Integration

### 9.1 Kanal-Management

Synchronisierung von Preisen und Verfügbarkeiten mit externen Plattformen:
- Homeexchange
- Agoda
- fewo-finden.in
- Airbnb (falls verwendet)
- Booking.com (falls verwendet)

> **Admin-Funktionalität:** Zentrale Steuerung aller Kanäle mit Möglichkeit zur plattformspezifischen Preisanpassung.

### 9.2 Plattformspezifische Preiszuschläge

| Plattform | Zuschlag | Begründung |
|-----------|----------|------------|
| Direktbuchung über Website | 0% | Bevorzugte Buchungsart |
| Homeexchange | 0% | Tauschplattform (andere Logik) |
| Agoda | +10% | Ausgleich für Plattformgebühren |
| Booking.com | +15% | Ausgleich für höhere Plattformgebühren |

> **Admin-Funktionalität:** Anpassbare Zuschläge pro Plattform mit automatischer Berechnung.

## 10. Implementierung im Buchungssystem

### 10.1 Grundlegende Funktionalitäten

Wesentliche Funktionen für ein praktisches Buchungssystem:

- **Kalenderansicht**: Übersichtlicher Kalender mit Verfügbarkeiten und Preisen
- **Preisrechner**: Einfache Berechnung des Gesamtpreises basierend auf ausgewähltem Zeitraum und Option
- **Anbindung an E-Mail-System**: Automatisierte Bestätigungen und Zahlungserinnerungen
- **Mehrsprachige Unterstützung**: Preisanzeige und Buchungsablauf in mehreren Sprachen (DE, EN, FR, IT)

### 10.2 Admin-Interface

Einfach zu bedienende Verwaltungsoberfläche:

- **Kalender-Management**: Blockieren von Terminen, manuelle Buchungen eintragen
- **Preiskonfiguration**: Einfache Eingabefelder für die Grundpreise je Saison und Option
- **Buchungsübersicht**: Übersicht aller aktuellen und vergangenen Buchungen
- **Einfache Berichtsfunktion**: Grundlegende Auslastungs- und Umsatzstatistiken

### 10.3 Frontend-Integration

Nutzerfreundliche Darstellung auf der Website:

- **Verfügbarkeitskalender**: Klar erkennbare freie/belegte Zeiträume
- **Preisanzeige**: Transparente Darstellung aller Preiskomponenten
- **Responsives Design**: Optimiert für Desktop und mobile Geräte
- **Einfacher Buchungsablauf**: Wenige, klar verständliche Schritte zum Abschluss

## 11. Dokumentation und Wartung

### 11.1 Grunddokumentation

Einfache Anleitung zum Preissystem:
- Kurze Erklärung der Preislogik mit Beispielen
- Schritt-für-Schritt-Anweisung zur Preispflege
- Hilfestellung bei häufigen Fragen zur Preisgestaltung

### 11.2 Regelmäßige Überprüfung

Jährliche Überprüfung der Preisstruktur:
- Anpassung an Marktentwicklungen
- Auswertung der Auslastungsdaten
- Optimierung basierend auf Gästefeedback
- Aktualisierung der Saisonzeiträume
