/**
 * VAPID Key Generator Script
 * Run this script to generate VAPID keys for push notifications
 *
 * Usage: node scripts/generate-vapid-keys.js
 */

const webPush = require("web-push");

console.log("Generating VAPID keys for Push Notifications...\n");

const vapidKeys = webPush.generateVAPIDKeys();

console.log("Add these to your .env.local file:\n");
console.log("# Push Notification VAPID Keys");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:admin@fresh-mart.com");
console.log("\n");
console.log(
  "Note: Keep your private key secret! Never commit it to version control.",
);
console.log(
  "The public key can be shared - it's used by browsers to encrypt push messages.",
);
