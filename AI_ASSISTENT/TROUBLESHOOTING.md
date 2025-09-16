# 🔧 Troubleshooting Guide - Rate Limit Issues

## 🚨 **Current Issue: Rate Limit Exceeded**

You're getting "Rate limit exceeded. Please try again in a moment." This means the extension is working, but you've hit OpenAI's rate limits.

## 🔍 **Diagnostic Steps:**

### **Step 1: Run the Diagnostic Tool**
1. **Right-click on any webpage**
2. **Select "Diagnose API Issues"**
3. **Click "Check API Key"** - This will tell us if your API key is valid
4. **Click "Test Simple Request"** - This will test a basic API call
5. **Click "Test Rate Limit"** - This will check if you're currently rate limited

### **Step 2: Check Your OpenAI Account**
1. Go to [OpenAI Platform](https://platform.openai.com/usage)
2. Check your **usage** and **billing**
3. Make sure you have **credits available**
4. Check if you have any **usage limits** set

## 🎯 **Common Causes & Solutions:**

### **1. Rate Limit (Most Common)**
- **Cause**: Too many requests in a short time
- **Solution**: Wait 5-10 minutes, then try again
- **Prevention**: Don't send multiple requests quickly

### **2. Usage Limit Reached**
- **Cause**: You've used all your OpenAI credits
- **Solution**: Add credits to your OpenAI account
- **Check**: Go to OpenAI Platform → Billing

### **3. API Key Issues**
- **Cause**: Invalid or expired API key
- **Solution**: Generate a new API key from OpenAI Platform
- **Check**: Use the diagnostic tool to verify

### **4. Model-Specific Limits**
- **Cause**: GPT-4 has stricter rate limits than GPT-3.5
- **Solution**: Switch to GPT-3.5-turbo in settings
- **Check**: Go to extension settings → Model → Select GPT-3.5-turbo

## 🚀 **Quick Fixes to Try:**

### **Immediate Actions:**
1. **Wait 10 minutes** - Rate limits reset automatically
2. **Try a simple question**: "Hello" or "Hi"
3. **Switch to GPT-3.5-turbo** in extension settings
4. **Check your OpenAI account** for credits

### **If Still Not Working:**
1. **Run the diagnostic tool** (right-click → "Diagnose API Issues")
2. **Check the console** (F12 → Console) for error details
3. **Try a different API key** if you have one
4. **Contact OpenAI support** if you have billing issues

## 📊 **Rate Limit Information:**

- **GPT-3.5-turbo**: 3,500 requests per minute
- **GPT-4**: 500 requests per minute
- **Free tier**: Much lower limits
- **Paid tier**: Higher limits based on your plan

## ✅ **Success Indicators:**

When it's working, you should see:
- ✅ Real AI responses (not mock responses)
- ✅ No "rate limit" error messages
- ✅ Responses within 2-5 seconds
- ✅ Context-aware responses

## 🆘 **Still Having Issues?**

1. **Run the diagnostic tool** first
2. **Check your OpenAI account** billing
3. **Try waiting longer** (up to 1 hour for severe rate limits)
4. **Switch to GPT-3.5-turbo** for higher rate limits
5. **Contact support** if the issue persists

The good news is that your extension is working correctly - it's just a rate limit issue! 🎉


