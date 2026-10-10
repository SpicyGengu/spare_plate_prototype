# Spare Plate Prototype

A bare-bones prototype of a food-waste app (a TooGoodToGo alternative). One phone acts as the **Shop** and posts a listing (photo, dietary requirement tags, description). A second phone acts as the **Customer** and sees that listing appear live, then accepts or denies it.

Everything runs on a local network: a small Node server on a laptop, and the app running on phones through Expo Go.

## How it works

```
Shop phone  --POST /listings-->  Server (Express + Socket.io)  --live push-->  Customer phone
                                        ^                                           |
                                        +-------- POST /listings/:id/respond -------+
```

Listings are stored in the server's memory only. Restarting the server clears them. Photos are sent as base64 inside the JSON, which is fine for a prototype.

## Project structure

```
flake.nix        Nix dev environment (Node 22, watchman, jq)
server/          Express + Socket.io server
  server.js
app/             Expo (React Native) app
  App.js         Switches between role select, Shop and Customer screens
  src/
    config.js    SERVER_URL and the dietary tag list
    screens/     RoleSelectScreen, PostScreen, FeedScreen
```

## Requirements

- A laptop with [Nix](https://nixos.org/) and flakes enabled (developed on NixOS), or Node.js 22 installed by other means
- One or two phones with **Expo Go** installed (Play Store / App Store)
- The laptop and the phones on the **same network**

## Setup

### 1. Enter the dev environment

From the project root:

```
nix develop
```

Do this in every terminal you use for this project.

### 2. Install dependencies

```
cd server && npm install
cd ../app && npm install
```

### 3. Open the firewall (NixOS)

NixOS blocks incoming connections by default, so the phones can't reach your laptop until you open the two ports used here. Add them to your `configuration.nix`:

```nix
networking.firewall.allowedTCPPorts = [ 3000 8081 ];
```

Then apply it:

```
sudo nixos-rebuild switch
```

- `3000`: the prototype server
- `8081`: Expo's Metro bundler

On other operating systems you only need to make sure these ports aren't blocked.

### 4. Set the server address

Find your laptop's LAN IP:

```
ifconfig | grep inet
```

Use the address on your wifi interface (usually `192.168.x.x` or `10.x.x.x`). Open `app/src/config.js` and set:

```js
export const SERVER_URL = "http://<your-laptop-ip>:3000";
```

This is the one setting you'll need to change whenever your laptop's IP changes.

## Running

You need two terminals, both inside `nix develop`.

**Terminal 1: the server**

```
cd server
npm start
```

You should see `Server listening on http://0.0.0.0:3000`.

**Terminal 2: the app**

```
cd app
npx expo start
```

A QR code appears. Scan it with the phone's camera (or from inside Expo Go) to open the app. Saving a file on the laptop hot-reloads the phone.

## Using the prototype

1. On each phone, open the app and choose a role.
2. **Shop**: tap the grey box to take a photo, tick dietary tags, write a description, tap **Post Listing**.
3. **Customer**: the listing shows up live. Tap **Accept** or **Deny** and the status updates on every connected phone.

With only one phone, you can check that a post worked by opening `http://<your-laptop-ip>:3000/listings` in the phone's browser. It returns the listings as JSON.
