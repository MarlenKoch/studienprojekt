# Schreibassistent

## Projektübersicht

Ziel des Projekts ist es, einen fortschrittlichen Schreibassistenten zu entwickeln, der den Einsatz von künstlicher Intelligenz während des Schreibprozesses optimiert und somit die Effizienz und Effektivität des Schreibens steigert. Das Projekt entsteht im Rahmen der Studienprojekte der Hochschule für Wirtschaft und Recht Berlin.


## Technologien

Für das Projekt werden folgende Technologien verwendet: 

### Frontend
- **React**: Für die Entwicklung der Benutzeroberfläche, um interaktive und reaktive Elemente zu gestalten.
- **TypeScript**: Eingesetzt für stark typisierten, fehlerfreien Code sowohl beim Entwickeln von neuen Komponenten als auch bei der Wartung und Weiterentwicklung der Anwendung.

### Backend
- **Python FastAPI**: Zur Entwicklung des Backends, das schnelle und effiziente API-Endpoints bereitstellt.
- **SQLite Datenbank**: Verwendet zur Speicherung von Daten, um einfache und schnelle Datenbankinteraktionen zu gewährleisten.
- **SQLAlchemy**: Eingesetzt als ORM (Object-Relational Mapper), um die Datenbankverwaltung und Komplexitätsreduktion bei SQL-Abfragen zu unterstützen.

### AI Modelle
- **Ollama Modelle**: Verschiedene AI-Modelle von Ollama werden lokal eingesetzt, um fortschrittliche KI-Funktionalitäten bereitzustellen. Diese Modelle ermöglichen die Verarbeitung natürlicher Sprache und sind eine zentrale Voraussetzung für die Ausführung des Projekts.

## Setup und Installation

### Voraussetzungen

- Node.js für das Frontend
- Python 3 für das Backend
- Lokale Installation von Ollama

### Installation

1. **Frontend (React TypeScript)**
   - Navigieren Sie in das Verzeichnis des Frontend-Projekts.
   - Führen Sie den folgenden Befehl aus, um die Abhängigkeiten zu installieren:
     ```bash
     npm install
     ```

2. **Backend (Python FastAPI)**
   - Navigieren Sie in das Verzeichnis des Backend-Projekts.
   - Erstellen Sie eine virtuelle Umgebung:
     ```bash
     python -m venv venv
     ```
   - Aktivieren Sie die virtuelle Umgebung:
     - Auf Mac/Linux:
       ```bash
       source venv/bin/activate
       ```
   - Installieren Sie die erforderlichen Python-Pakete:
     ```bash
     pip install -r requirements.txt
     ```

  3. **Ollama**

  Ollama muss für die Nutzung der KI-Modelle zur Verfügung stehen und kann über diesen Link installiert werden:

  https://ollama.com/download

  

## Verwendung

### Starten von Ollama

Nach dem Installieren muss Ollama mit folgendem Befehl gestartet werden: 

  ```bash
  ollama serve
  ```

### Starten des Frontend-Servers

Innerhalb des Frontend-Projektverzeichnisses:
```bash
npm start
```

### Starten des Backend-Servers

Innerhalb des Backend-Projektverzeichnisses:
```bash
uvicorn main:app --reload
```

### Testen der Anwendung

Sobald beide Server laufen, öffnen Sie Ihren bevorzugten Webbrowser und navigieren Sie zur URL:
```
http://localhost:5173
```

