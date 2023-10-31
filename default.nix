let
  nixpkgs = import <nixpkgs> {};
in
  with nixpkgs;
  stdenv.mkDerivation {
    name = "Dev environment shell";
    buildInputs = [
	  nodejs
	  yarn
    ];
    shellHook = ''
      '';
  }
