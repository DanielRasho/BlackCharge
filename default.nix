let
  nixpkgs = import <nixpkgs> {};
in
  with nixpkgs;
  stdenv.mkDerivation {
    name = "Dev environment shell";
    buildInputs = [
      eza
      fd
	  nodejs
	  yarn
    ];
    shellHook = ''
      alias ls=eza
      alias find=fd
      '';
  }
