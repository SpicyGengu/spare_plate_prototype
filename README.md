# Spare Plate

A Parramatta food-surplus prototype. Diners reserve a discounted plate, get a countdown voucher with a QR code, and confirm collection with a swipe. Venues post surplus with a mandatory FSANZ allergen checklist and mark vouchers collected.

The phone app is Expo (React Native). The API is a small Express server with in-memory Parramatta listings. If the phone cannot reach the server, the app keeps working on the same built-in demo data.

## Run it

From the project root, in two terminals:

```bash
nix develop
cd server && npm start
```

```bash
nix develop
cd app && npx expo start
```

- Web: press `w`, or open the URL Expo prints.
- Phone: scan the QR code with Expo Go. The app calls the API on the same host Metro is using. Override it with `EXPO_PUBLIC_SERVER_URL` if you need a fixed address.

## Demo path

1. Walk through the three intro slides.
2. Stay in **Consumer** to search, filter (Vegetarian, Gluten-Free, Nut-Free, Halal), and switch between the list and the Parramatta precinct map.
3. Open a plate, check the allergen badges, then reserve with pay-at-collection or the mock card.
4. On the voucher, watch the countdown and swipe to confirm collection.
5. Switch to **Merchant** in the header to see recovered revenue, post a new item (allergens are required), and confirm a code from the Collect screen.

The header switch is a demo control so one device can play both roles.
