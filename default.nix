let
  nixpkgs = import <nixpkgs> {};
in
  with nixpkgs;
  stdenv.mkDerivation {
    name = "Dev environment shell";
    buildInputs = [
      exa
      fd
	  nodejs
	  yarn
    ];
    shellHook = ''
      alias ls=exa
      alias find=fd
      '';
  }
