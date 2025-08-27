# 🔧 Voice Navigator Troubleshooting Guide

## 🚨 **Main Issue: "Hello Financial Advisior" Not Working**

### **The Problem:**
You're saying **"Hello Financial Advisior"** but it should be **"Hello Financial Advisor"** (with an "o" not "i").

### **The Solution:**
**Say exactly:** `"Hello Financial Advisor"` (correct spelling)

---

## 🎯 **Quick Fix Steps:**

### **1. Check the Visual Indicator**
- Look for the **green dot** on the microphone button (bottom-left corner)
- If no green dot → Microphone permissions issue
- If green dot visible → Wake word detection is active

### **2. Test the Correct Phrase**
Say exactly: **"Hello Financial Advisor"** (not "advisior")

### **3. Check Microphone Permissions**
- Browser should ask for microphone access
- Click **"Allow"** when prompted
- If denied, click microphone icon in browser address bar

### **4. Use the Test Page**
Go to: `http://localhost:3000/voice-test` for detailed testing

---

## 🔍 **Step-by-Step Debugging:**

### **Step 1: Check Browser Console**
1. Press `F12` to open developer tools
2. Go to **Console** tab
3. Look for error messages like:
   - "Speech recognition not supported"
   - "Microphone access denied"
   - "Permission denied"

### **Step 2: Test Browser Support**
Add this to browser console:
```javascript
// Check speech recognition support
console.log('Speech Recognition:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

// Check speech synthesis support
console.log('Speech Synthesis:', 'speechSynthesis' in window);
```

### **Step 3: Test Wake Word Detection**
Add this to browser console:
```javascript
// Test wake word patterns
const testPhrase = "hello financial advisor";
const patterns = [
  /^hello\s+financial\s+advisor$/i,
  /^hello\s+fin\s+advisor$/i,
  /hello\s+financial\s+advisior/i // Handles typo
];

patterns.forEach((pattern, index) => {
  console.log(`Pattern ${index + 1}:`, pattern.test(testPhrase));
});
```

---

## ❌ **Common Issues & Solutions:**

### **Issue 1: "Speech recognition not supported"**
**Solution:**
- Use **Chrome** or **Edge** browser
- Update your browser to latest version
- Check if you're on HTTPS (required for some features)

### **Issue 2: "Microphone access denied"**
**Solution:**
- Click the microphone icon in browser address bar
- Select "Allow" for microphone access
- Refresh the page after allowing permissions

### **Issue 3: "Wake word not detected"**
**Solutions:**
- Say exactly: **"Hello Financial Advisor"** (not "advisior")
- Don't add extra words like "please" or "help"
- Don't add punctuation like "!" or "."
- Speak clearly and at normal volume

### **Issue 4: "No response from voice assistant"**
**Solutions:**
- Check if server is running: `cd server && npm start`
- Check if client is running: `cd client && npm start`
- Verify Gemini API key in `.env` file
- Check browser console for API errors

### **Issue 5: "Green dot not visible"**
**Solutions:**
- Refresh the page
- Check microphone permissions
- Try a different browser
- Check if JavaScript is enabled

---

## 🧪 **Testing Commands:**

### **Working Wake Words:**
- ✅ "Hello Financial Advisor"
- ✅ "Hi Financial Advisor"
- ✅ "Hey Financial Advisor"
- ✅ "Hello Fin Advisor"
- ✅ "Financial Advisor"

### **Working Commands:**
- ✅ "Go to calculator"
- ✅ "Track my expenses"
- ✅ "Help me save money"
- ✅ "Schedule a meeting"
- ✅ "Get financial advice"

### **Test Phrases (Should NOT Work):**
- ❌ "Hello Financial Advisior" (typo)
- ❌ "Hello Financial Advisor please help" (extra words)
- ❌ "Hello Financial Advisor!" (punctuation)
- ❌ "Can you help me Hello Financial Advisor" (wrong order)

---

## 🔧 **Advanced Troubleshooting:**

### **Check Environment Variables:**
```bash
# Check if .env file exists
ls server/.env

# Check if Gemini API key is set
grep GEMINI_API_KEY server/.env
```

### **Test API Endpoints:**
```bash
# Test voice navigation API
curl http://localhost:8080/api/voice-navigation/test

# Test voice processing
curl -X POST http://localhost:8080/api/voice-navigation/process \
  -H "Content-Type: application/json" \
  -d '{"command":"hello financial advisor","currentPage":"/","conversationMode":false}'
```

### **Check Server Logs:**
```bash
# Check server console for errors
cd server
npm start
```

### **Check Client Logs:**
```bash
# Check client console for errors
cd client
npm start
```

---

## 🎯 **Quick Test Page:**

Visit: `http://localhost:3000/voice-test`

This page will:
- ✅ Check browser support
- ✅ Test speech synthesis
- ✅ Show system status
- ✅ Provide troubleshooting tips
- ✅ Test wake word detection

---

## 📞 **Still Not Working?**

### **1. Check System Requirements:**
- ✅ Chrome/Edge browser (latest version)
- ✅ Microphone connected and working
- ✅ Internet connection (for Gemini API)
- ✅ JavaScript enabled

### **2. Try Alternative Browsers:**
- Chrome (recommended)
- Edge
- Firefox (limited support)

### **3. Check Network:**
- Ensure server is running on port 8080
- Ensure client is running on port 3000
- Check firewall settings

### **4. Reset Everything:**
```bash
# Stop all processes
# Clear browser cache
# Restart server and client
cd server && npm start
cd client && npm start
```

---

## 🎉 **Success Checklist:**

- ✅ Green dot visible on microphone button
- ✅ Microphone permissions allowed
- ✅ Server running on port 8080
- ✅ Client running on port 3000
- ✅ Saying "Hello Financial Advisor" (correct spelling)
- ✅ Voice assistant responds
- ✅ Can navigate with voice commands

**If all above are ✅, your voice navigator is working perfectly!** 🎤✨
