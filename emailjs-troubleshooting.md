# EmailJS Troubleshooting Guide

## Common Issues and Solutions

If you're experiencing problems with the EmailJS contact form on your EduStake landing page, here are some troubleshooting steps to help identify and resolve the issue:

### 1. Check Browser Console for Errors

First, open your browser's developer console (F12 or right-click > Inspect > Console) to check for any JavaScript errors:

- **SDK Loading Error**: If you see "EmailJS SDK failed to load" or "emailjs is not defined", there might be an issue with your internet connection or the CDN.

- **Authentication Error**: Messages like "Invalid user ID" or "Invalid public key" indicate credential problems.

- **Template/Service Error**: "Template not found" or "Service not found" errors mean your template or service IDs are incorrect.

### 2. Verify Your EmailJS Credentials

Double-check that you're using the correct credentials:

- **Public Key**: `SiI4H6taTpYNeRp4q`
- **Service ID**: `service_l7uqzsq`
- **Template ID**: `template_h2iee5u`

These should match exactly with what's shown in your EmailJS dashboard.

### 3. Check Email Template Configuration

Verify your template is set up correctly in the EmailJS dashboard:

- Ensure the template contains all the required variables: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, and `{{message}}`
- Confirm the "To email" field is set to `team.edustake@gmail.com`

### 4. Email Service Connection

- Log into your EmailJS dashboard and check if your email service (Gmail, etc.) is properly connected
- If the connection status shows any issues, try reconnecting the service
- Ensure your email provider isn't blocking the connection

### 5. Check Spam/Junk Folder

- Emails might be delivered but sent to your spam/junk folder
- Add the EmailJS sending domain to your safe senders list

### 6. Rate Limits and Quotas

- The free plan of EmailJS limits you to 200 emails per month
- Check your dashboard to see if you've reached your limit

### 7. Network Issues

- Ensure your website has internet access when submitting the form
- Try using a different network connection

### 8. CORS Issues

If you're testing locally or have recently moved domains:

- Ensure your domain is properly registered in the EmailJS dashboard
- Add your testing domain to the allowed domains list in EmailJS settings

## Testing the Form

After making any changes:

1. Clear your browser cache
2. Reload the page
3. Open the browser console
4. Submit the form with test data
5. Check the console for any error messages

If you continue to experience issues, contact EmailJS support with the specific error messages from your console.