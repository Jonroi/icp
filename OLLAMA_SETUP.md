# Ollama Setup Guide for ICP Generation

## Overview

This application uses Ollama (local LLM) for generating Ideal Customer Profiles (ICPs). No external API keys are required!

## Prerequisites

1. **Install Ollama**: Download and install from [https://ollama.ai](https://ollama.ai)
2. **Download the required model**: The application uses `llama2:7b` model

## Setup Steps

### 1. Install Ollama

Visit [https://ollama.ai](https://ollama.ai) and download the installer for your operating system:

- **Windows**: Download the Windows installer
- **macOS**: Download the macOS installer
- **Linux**: Follow the installation instructions

### 2. Download the Required Model

After installing Ollama, open a terminal/command prompt and run:

```bash
ollama pull llama2:7b
```

This will download the Llama 2 7B model (approximately 4GB).

### 3. Start Ollama

Ollama should start automatically after installation. If not, you can start it manually:

```bash
ollama serve
```

### 4. Verify Installation

Test that Ollama is working:

```bash
ollama run llama2:7b "Hello, how are you?"
```

You should get a response from the model.

## Using the Application

### Generate ICPs

1. **Add Competitors**: Enter competitor names and websites in the ICP Generator tab
2. **Add Reviews** (optional): Add customer reviews for each competitor
3. **Add Context** (optional): Provide additional information about your target market
4. **Generate ICPs**: Click "Generate Ideal Customer Personas"
5. **View Results**: Switch to the "ICP Profiles" tab to see the generated profiles

### Test the Functionality

1. Go to the "ICP Profiles" tab
2. Click "Test ICP Generation" to test with sample data
3. Check the browser console for detailed logs

## Troubleshooting

### Ollama Connection Issues

If you get connection errors:

1. **Check if Ollama is running**:

   ```bash
   ollama list
   ```

2. **Restart Ollama**:

   ```bash
   ollama serve
   ```

3. **Check the model is installed**:
   ```bash
   ollama list
   ```
   You should see `llama2:7b` in the list.

### Model Not Found

If the model isn't installed:

```bash
ollama pull llama2:7b
```

### Performance Issues

- The first generation might be slow as the model loads
- Subsequent generations will be faster
- Consider using a smaller model for faster responses:
  ```bash
  ollama pull llama2:3b
  ```
  Then update the model name in `src/services/ai.ts` from `llama2:7b` to `llama2:3b`

## Configuration

The application is configured to use:

- **URL**: `http://localhost:11434/api/generate`
- **Model**: `llama2:7b`
- **Stream**: `false` (for better response handling)

## Benefits of Using Ollama

✅ **No API costs** - completely free to use  
✅ **Privacy** - all data stays on your local machine  
✅ **Offline** - works without internet connection  
✅ **Customizable** - can use different models  
✅ **Fast** - no network latency

## Alternative Models

You can experiment with other models:

```bash
# Smaller, faster model
ollama pull llama2:3b

# More capable model
ollama pull llama2:13b

# Code-focused model
ollama pull codellama:7b
```

To use a different model, update the model name in `src/services/ai.ts`:

```typescript
const response = await axios.post(this.ollamaUrl, {
  model: 'llama2:3b', // Change this to your preferred model
  prompt: prompt,
  stream: false,
});
```
