# ============================================================
# CLAUDE COWORK — PROJECT INSTRUCTIONS (šablona)
# ============================================================
METAFORA: Jak se staví produkční projekt
Představ si VS Code menu:
ITERACE 1 — Existuje jen "View" v menu baru.
  Nic jiného. Ale je napojené na event system,
  který umožní přidat další položky menu.

ITERACE 2 — Klikneš na "View" a rozbalí se:
  - Command Palette
  - Appearance
  - Explorer
  - Search
  - ...
  Každá položka EXISTUJE jako entita, má název, 
  svou pozici, svůj handler. Ale většina zatím 
  jen zobrazí "Coming soon" nebo prázdný panel.

ITERACE 3 — Klikneš na "Appearance" a rozbalí se:
  - Full Screen
  - Zen Mode
  - Menu Bar ✓
  - Primary Side Bar ✓
  - Secondary Side Bar
  - Status Bar ✓
  - Panel ✓
  Rodič (Appearance) má děti. Děti mají své stavy
  (checked/unchecked). Některé děti mají vlastní 
  vnuky (Panel Position → Bottom, Left, Right).

ITERACE N — Každé rozkliknutí odhaluje další úroveň.
  Ale NIKDY se nemění struktura nad tím.
  "View" zůstává "View". "Appearance" zůstává 
  "Appearance". Jen se přidávají listy na konci větví.
TOTO JE ZPŮSOB, JAK STAVÍM KAŽDÝ PROJEKT:

Nejdřív kostra — menu bar s prázdnými položkami.
Vše je registrované, propojené, ale nic ještě "nedělá nic."
Backend: routes existují, vracejí 501 Not Implemented.
Frontend: stránky existují, zobrazují placeholder.
DB: tabulky existují, jsou prázdné.
Pak první úroveň — každá položka menu se rozklikne.
Backend: endpointy vracejí skutečná data.
Frontend: komponenty zobrazují data z API.
DB: seed data pro testování.
Pak hloubka — každé rozkliknutí odhaluje detail.
Backend: business logika, validace, edge cases.
Frontend: formuláře, modaly, error states.
DB: indexy, relace, constraints.
NIKDY nepřepisuji rodiče při přidávání dětí.
Nová feature = nový soubor, nový route, nový endpoint.
Existující kód se NEMĚNÍ (nebo minimálně — jen import).


PRAVIDLO: REGISTRACE PŘED IMPLEMENTACÍ
Než začnu implementovat jakoukoli feature, nejdřív ji
REGISTRUJI v systému — aby ostatní části věděly, že existuje,
i když ještě nic nedělá.
typescript// ITERACE 1: Registrace — feature existuje, ale je prázdná
// routes/index.ts
router.use('/api/v1/subscriptions', subscriptionRoutes);

// routes/subscriptionRoutes.ts  
router.get('/plans', notImplemented);      // 501
router.get('/current', notImplemented);    // 501
router.post('/change', notImplemented);    // 501
router.post('/cancel', notImplemented);    // 501
router.get('/payments', notImplemented);   // 501

// Frontend: stránka existuje, ale zobrazuje "Připravujeme"
// pages/SubscriptionPage.tsx
export function SubscriptionPage() {
  return <ComingSoonPlaceholder feature="Subscription Management" />;
}

// ITERACE 2: Implementace — feature funguje
// Neměním routes/index.ts — ten už subscription registroval.
// Jen vyplním obsah jednotlivých route handlerů.

// ITERACE 3: Rozšíření — přidám vnuky
// Neměním subscriptionRoutes.ts — jen přidám nové routes:
router.get('/invoices', invoiceController.list);
router.get('/invoices/:id/pdf', invoiceController.downloadPdf);

PROJEKT PLETOR — ARCHITEKTURA S WORKFLOWY KONTEXTEM
Co Pletor je:
Pletor je vizuální orchestrační IDE, kde:

Canvas (Nogic) — zobrazuje strukturu kódu jako graf.
Soubory, komponenty, relace. Vidíš co s čím souvisí.
WorkFlowy — hierarchický "mozek" projektu.
Každý uzel = instrukce, podmínka, kontext, záměr.
Nahrazuje .md soubory jedním živým stromem.
AI Agenti (Claude) — čtou kontext z WorkFlowy,
vidí strukturu z canvasu, generují kód.

Jak WorkFlowy slouží jako kontext pro AI agenty:
WorkFlowy strom:
# Pletor
  ## Canvas engine
    ### CanvasNode component
      - PROMPT: "Každý uzel na canvasu reprezentuje jeden soubor
        nebo komponentu. Musí zobrazovat: název, typ, počet 
        spojení, mini-preview kódu."
      - CONTEXT: "Používáme React Flow. Uzly jsou custom nodes.
        Každý uzel má port pro vstupní a výstupní hrany."
      - INTENT: "Uživatel na první pohled vidí, co uzel dělá,
        kolik má závislostí, a může ho rozkliknout pro detail."
      - CONSTRAINTS: 
        - Max 200 uzlů na canvas (výkon)
        - Lazy loading obsahu uzlů
        - Uzel NESMÍ fetchovat data sám — dostane je z parent
    ### CanvasEdge component
      - PROMPT: "Hrana reprezentuje import, API call, nebo 
        datový tok. Typ hrany = barva + styl čáry."
      - EDGE TYPES:
        - Import (plná čára, zelená)
        - API call (přerušovaná, modrá)  
        - Data flow (plná, oranžová)
        - Event (tečkovaná, fialová)
  ## WorkFlowy integration
    ### WorkFlowySync service
      - PROMPT: "Synchronizuje strukturu canvasu s WorkFlowy.
        Každý uzel na canvasu má odpovídající uzel ve WorkFlowy.
        Uživatel píše markdown instrukce ve WorkFlowy,
        agent je čte přes API."
      - API: WorkFlowy REST API v1 (nodes CRUD + export)
      - SYNC DIRECTION: Bidirectional
        - Canvas → WorkFlowy: nový uzel = nový WF node
        - WorkFlowy → Canvas: nový WF node = nový uzel
Tok dat v Pletoru:
UŽIVATEL píše ve WorkFlowy:
  "SubscriptionPanel: Zobrazí aktuální plán, umožní upgrade.
   Musí volat GET /api/subscriptions/current.
   Po upgradu redirect na Stripe Checkout.
   Error state: zobrazit toast s chybou."

        ↓ WorkFlowy API

PLETOR BACKEND čte WorkFlowy strom:
  - Parsuje uzly → extrahuje PROMPT, CONTEXT, INTENT
  - Mapuje na uzly v canvasu
  - Identifikuje závislosti (zmíněné endpointy, komponenty)

        ↓ Interní API

CANVAS zobrazuje:
  - SubscriptionPanel uzel (s badge "má instrukce")
  - Hranu na /api/subscriptions/current (API call)
  - Hranu na StripeService (external)
  - Hranu na SubscriptionPage (parent)

        ↓ Uživatel klikne "Generuj kód"

AI AGENT dostane kontext:
  {
    "component": "SubscriptionPanel",
    "prompt": "Zobrazí aktuální plán, umožní upgrade...",
    "context": "React, TypeScript, Tailwind, Clean Architecture",
    "dependencies": [
      { "type": "api", "endpoint": "GET /api/subscriptions/current" },
      { "type": "external", "service": "Stripe Checkout" },
      { "type": "parent", "component": "SubscriptionPage" }
    ],
    "constraints": ["Error state: toast", "Loading state: skeleton"],
    "naming": "SubscriptionCurrentPlanCard (dítě SubscriptionPanel)",
    "folder": "src/components/Subscription/"
  }

        ↓ Claude API

AGENT generuje kód:
  - Přesně do správné složky
  - S přesným názvem
  - Napojený na správné API
  - Se všemi stavy (loading, error, empty, success)
Co to znamená pro backend Pletoru:
Pletor backend musí obsahovat:

1. WorkFlowySyncService
   - Čte/zapisuje WorkFlowy přes API
   - Parsuje markdown uzly → strukturovaná data
   - Extrahuje PROMPT, CONTEXT, INTENT, CONSTRAINTS tagy
   - Cache (60s TTL, invalidace při změně)

2. CanvasStateService  
   - Drží stav canvasu (uzly, hrany, pozice)
   - Persistence (SQLite / PostgreSQL)
   - Real-time sync přes WebSocket

3. AgentContextBuilder
   - Pro daný uzel sestaví kompletní kontext pro AI agenta
   - Kombinuje: WorkFlowy instrukce + canvas závislosti 
     + existující kód + architektonické pravidla
   - Výstup: strukturovaný JSON pro Claude API

4. AgentExecutionService
   - Posílá kontext na Claude API
   - Streaming response (uživatel vidí generování v reálném čase)
   - Výsledek zapíše do file systému + aktualizuje canvas

5. ProjectStructureService
   - Čte file systém projektu
   - Mapuje na Nogic canvas formát
   - Sleduje změny (file watcher)

AKTUÁLNÍ STAV A DALŠÍ KROKY
Co UŽ existuje (z předchozí práce):

✅ WorkFlowy API wrapper (Python SDK z dřívějška)
✅ Cowork Global Instructions (architektura, pojmenování, dekompozice)
✅ Nogic extension nainstalovaná (vizualizace canvasu)
✅ Claude Code v VS Code (pravý panel)
✅ Základní Pletor-canvas React projekt

Co je potřeba udělat:
FÁZE 0 — Canvas UX (lokální, bez backendu):
  □ React Flow setup s custom uzly
  □ Drag & drop přidávání uzlů
  □ Hrany s typy (import, API, data flow)
  □ Persistence do localStorage (zatím)
  □ Klik na uzel → detail panel

FÁZE 1 — Persistence + backend:
  □ Express/Fastify backend
  □ SQLite databáze pro canvas stav
  □ REST API: CRUD uzly, hrany, projekty
  □ Frontend napojený na reálné API

FÁZE 2 — WorkFlowy integrace:
  □ WorkFlowy API client (Node.js verze)
  □ Sync service: canvas ↔ WorkFlowy
  □ Parsování markdown → strukturovaná data
  □ UI: vidět WorkFlowy obsah u uzlu na canvasu

FÁZE 3 — AI Agent pipeline:
  □ AgentContextBuilder
  □ Claude API integrace
  □ Streaming response v UI
  □ Zápis generovaného kódu do file systému

FÁZE 4 — File system integrace:
  □ Nogic data → canvas mapping
  □ File watcher pro live updates
  □ Klik na uzel → vidět kód v panelu
Pravidlo pro Claude při práci na Pletoru:
NIKDY nestavím dvě fáze najednou.
Každá fáze musí FUNGOVAT samostatně, než přejdu na další.
Fáze 0 = canvas funguje lokálně bez backendu.
Fáze 1 = canvas funguje s backendem bez WorkFlowy.
Fáze 2 = canvas + WorkFlowy funguje bez AI agenta.
Fáze 3 = celý pipeline funguje end-to-end.
Každá nová fáze PŘIDÁVÁ, nepřepisuje předchozí.