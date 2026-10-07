{
  description = "Dev environment for the TooGoodToGo-alternative prototype (Expo RN app + Node/Express/Socket.io server)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # JS runtime + package manager (npm ships with nodejs)
            nodejs_22

            # Metro bundler (Expo/React Native) wants watchman on Linux
            # for sane file-watching performance
            watchman

            # Handy for inspecting/debugging the JSON payloads between
            # the two phones
            jq

            # Useful if you want to see your LAN IP quickly, to hardcode
            # the server URL into the app
            inetutils   # ifconfig
            git
          ];

          shellHook = ''
            echo "📱 toogoodtogo-prototype dev shell"
            echo "node: $(node --version)"
            echo "npm:  $(npm --version)"
            echo
            echo "Run 'npx create-expo-app app' to scaffold the phone app (first time only)."
            echo "Run 'npm init -y' inside a 'server/' dir to scaffold the Express+Socket.io server."
            echo
            echo "Find your LAN IP for the server URL with: ifconfig | grep inet"
          '';
        };
      });
}
