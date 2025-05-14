# EmailJS Setup Guide for EduStake Contact Form

This guide explains how to set up EmailJS to receive email notifications when users submit the contact form on the EduStake landing page.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS website](https://www.emailjs.com/) and sign up for a free account
2. Verify your email address

## Step 2: Create an Email Service

1. In your EmailJS dashboard, go to "Email Services" tab
2. Click "Add New Service"
3. Select your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps to connect your team.edustake@gmail.com account
5. Name your service (e.g., "edustake_service") and save the service ID

## Step 3: Create an Email Template

1. Go to the "Email Templates" tab
2. Click "Create New Template"
3. Design your email template with the following variables:
   - `{{from_name}}` - The name of the person who submitted the form
   - `{{from_email}}` - The email address of the person who submitted the form
   - `{{subject}}` - The subject of the message
   - `{{message}}` - The content of the message
4. Set the "To email" field to team.edustake@gmail.com
5. Save the template and note the template ID

## Step 4: Get Your Public Key

1. Go to "Account" > "API Keys"
2. Copy your public key

## Step 5: Update the Landing Page Code

In the landing.html file, update the following values:

1. Replace `YOUR_PUBLIC_KEY` with your actual EmailJS public key:
```javascript
emailjs.init("SiI4H6taTpYNeRp4q");
```

2. Replace `YOUR_SERVICE_ID` and `YOUR_TEMPLATE_ID` with your actual service and template IDs:
```javascript
emailjs.send('service_l7uqzsq', 'template_h2iee5u', templateParams)
```

## Testing

After setting up EmailJS:

1. Open the landing page in a browser
2. Fill out and submit the contact form
3. Check your team.edustake@gmail.com inbox for the notification email

## Limitations

- The free plan of EmailJS allows 200 emails per month
- For higher volume, consider upgrading to a paid plan

## Troubleshooting

If emails are not being received:

1. Check browser console for any errors
2. Verify that all IDs and keys are correctly entered
3. Ensure your email service is properly connected in EmailJS dashboard
4. Check spam/junk folder for the notification emails