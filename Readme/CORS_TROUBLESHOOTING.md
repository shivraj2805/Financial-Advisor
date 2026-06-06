# 🔧 CORS Troubleshooting Guide

## 🚨 **Current Issue**

The OCR feature is still failing with CORS errors despite the fixes. The error shows:
```
Access to fetch at 'https://financial-advisior.onrender.com/api/ocr/upload-financial-doc' from origin 'https://financial-advisior.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ **Enhanced Fixes Applied**

### 1. **Enhanced CORS Configuration**
- Added comprehensive logging to CORS middleware
- Added explicit allowed headers and methods
- Added pattern matching for Vercel domains

### 2. **Global CORS Middleware**
- Added global CORS middleware that runs before all routes
- Ensures CORS headers are always set
- Handles preflight requests properly

### 3. **OCR-Specific CORS Headers**
- Added specific CORS handling for OCR routes
- Explicit origin checking for production domains
- Enhanced logging for debugging

### 4. **Test Endpoint**
- Created `/api/ocr/test` endpoint for testing
- Added comprehensive logging throughout the flow

## 🚀 **Deployment Steps**

### **1. Deploy the Changes**
```bash
# Commit your changes
git add .
git commit -m "Enhanced CORS configuration for OCR"
git push origin main

# Wait for deployment to complete
```

### **2. Test the CORS Configuration**
After deployment, run the test script:

```bash
# Run the CORS test script
node test-cors.js
```

### **3. Manual Testing**
Test the OCR route manually:

```bash
# Test the OCR test endpoint
curl -X GET https://financial-advisior.onrender.com/api/ocr/test

# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://financial-advisior.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://financial-advisior.onrender.com/api/ocr/upload-financial-doc
```

## 🔍 **Debugging Steps**

### **1. Check Server Logs**
After deployment, check your server logs for:

```
🔍 CORS Check - Request Origin: https://financial-advisior.vercel.app
✅ CORS - Origin in allowed list: https://financial-advisior.vercel.app
🔍 Global CORS - Origin: https://financial-advisior.vercel.app
✅ Global CORS - Headers set for origin: https://financial-advisior.vercel.app
🔍 OCR Route - Origin: https://financial-advisior.vercel.app
✅ OCR CORS - Origin allowed: https://financial-advisior.vercel.app
```

### **2. Check Browser Network Tab**
1. Open browser dev tools
2. Go to Network tab
3. Try uploading a file
4. Look for the OCR request
5. Check if CORS headers are present in the response

### **3. Check Response Headers**
Look for these headers in the response:
- `Access-Control-Allow-Origin: https://financial-advisior.vercel.app`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization`
- `Access-Control-Allow-Credentials: true`

## 🛠️ **Additional Troubleshooting**

### **If CORS Still Fails**

1. **Check Render Deployment**:
   - Verify your Render service is running
   - Check Render logs for any errors
   - Ensure the service is accessible

2. **Check Domain Configuration**:
   - Verify your Vercel domain is correct
   - Check if there are any redirects or proxies
   - Ensure the domain is accessible

3. **Check Network Issues**:
   - Test if the backend is accessible directly
   - Check for any firewall or network restrictions
   - Verify SSL certificates are valid

### **If OCR Processing Fails**

1. **Check File Upload**:
   - Verify file size is under 10MB
   - Check file type is supported
   - Ensure file is not corrupted

2. **Check Server Resources**:
   - Verify Render service has enough resources
   - Check for memory or CPU issues
   - Look for timeout errors

## 📊 **Monitoring**

### **Server Logs to Watch**
- `🔍 CORS Check - Request Origin:`
- `✅ CORS - Origin in allowed list:`
- `🔍 Global CORS - Origin:`
- `✅ Global CORS - Headers set for origin:`
- `🔍 OCR Route - Origin:`
- `✅ OCR CORS - Origin allowed:`

### **Browser Console Logs**
- `Uploading file: filename.jpg Size: X Type: image/jpeg`
- `OCR processing completed successfully`
- Any CORS or network errors

## 🚨 **Common Issues & Solutions**

### **Issue 1: CORS Headers Not Set**
**Error**: `No 'Access-Control-Allow-Origin' header is present`

**Solution**:
1. Check if the global CORS middleware is running
2. Verify the origin is in the allowed list
3. Check if there are any middleware conflicts

### **Issue 2: Preflight Request Fails**
**Error**: `CORS preflight request failed`

**Solution**:
1. Check if OPTIONS method is handled
2. Verify preflight response headers
3. Ensure the request is reaching the server

### **Issue 3: Origin Not Allowed**
**Error**: `Origin not allowed by CORS`

**Solution**:
1. Check if the origin is in allowedOrigins array
2. Verify pattern matching is working
3. Check for typos in domain names

### **Issue 4: Headers Not Set**
**Error**: `CORS headers missing`

**Solution**:
1. Check if the middleware is running
2. Verify the order of middleware
3. Check for any errors in the middleware

## 🎯 **Expected Behavior After Fix**

1. User uploads a document on the OCR page
2. Browser sends preflight OPTIONS request
3. Server responds with CORS headers
4. Browser sends actual POST request
5. Server processes the file with OCR
6. Server returns structured financial data
7. Frontend displays the results

## 📞 **Support**

If you continue to experience issues:

1. **Run the test script**: `node test-cors.js`
2. **Check server logs**: Look for CORS debugging messages
3. **Test manually**: Use curl to test the endpoints
4. **Check browser network tab**: Look for CORS headers in responses

## 🔧 **Quick Test Commands**

```bash
# Test OCR route accessibility
curl -X GET https://financial-advisior.onrender.com/api/ocr/test

# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://financial-advisior.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://financial-advisior.onrender.com/api/ocr/upload-financial-doc

# Test with specific origin
curl -X GET \
  -H "Origin: https://financial-advisior.vercel.app" \
  https://financial-advisior.onrender.com/api/ocr/test
```

The OCR feature should now work properly in production! 🎉
