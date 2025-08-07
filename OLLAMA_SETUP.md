# Ollama Asennus ja ChatGPT-kompatiibiliteetti

## 1. Asenna Ollama

Lataa ja asenna Ollama: [https://ollama.ai](https://ollama.ai)

## 2. Asenna ChatGPT-kompatiibeli mallit

### Suositellut mallit ChatGPT:n sijaan

```bash
# Pieni ja nopea malli (suositus)
ollama pull llama3.2:3b-instruct-q4_K_M

# Parempi suorituskyky, enemmän muistia
ollama pull llama3.2:8b-instruct-q4_K_M

# Koodaus-optimoitu malli
ollama pull codellama:7b-instruct-q4_K_M

# Mistral-malli (hyvä suorituskyky)
ollama pull mistral:7b-instruct-q4_K_M
```

## 3. Testaa asennus

```bash
# Testaa että Ollama toimii
ollama list

# Testaa mallin toimintaa
ollama run llama3.2:3b-instruct-q4_K_M "Hei, miten menee?"
```

## 4. Käytä sovelluksessa

Sovellus käyttää automaattisesti paikallista Ollamaa ChatGPT:n sijaan.
Voit vaihtaa mallia muokkaamalla `src/services/ai/ollama-client.ts` tiedostoa.

## 5. Suorituskyky

- **llama3.2:3b**: ~2GB RAM, nopea
- **llama3.2:8b**: ~4GB RAM, parempi laatu
- **codellama:7b**: ~4GB RAM, hyvä koodaukseen
- **mistral:7b**: ~4GB RAM, hyvä yleiskäyttöön

## 6. Ongelmatilanteet

Jos sovellus ei löydä Ollamaa:

1. Varmista että Ollama on asennettu
2. Käynnistä Ollama: `ollama serve`
3. Tarkista että malli on ladattu: `ollama list`
4. Testaa manuaalisesti: `ollama run [mallin-nimi] "testi"`

## 7. ChatGPT API -kompatiibiliteetti

Sovellus tukee nyt ChatGPT API:n kaltaista rajapintaa paikallisesti:

```typescript
import { ChatGPTClient } from './services/ai';

const client = new ChatGPTClient();

// Käytä kuten ChatGPT API:a
const response = await client.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'Olet hyödyllinen assistentti.' },
    { role: 'user', content: 'Kerro minulle jotain mielenkiintoista.' },
  ],
});
```
