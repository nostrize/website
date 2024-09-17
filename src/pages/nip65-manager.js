import NIP65Manager from "./nip65-manager.svelte";

const nip65Container = document.getElementById("nip65-relay-manager-container");

new NIP65Manager({
  target: nip65Container,
});
