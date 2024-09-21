<script>
  import { SimplePool } from "nostr-tools";

  let nip65Relays = [];
  let error = "";
  let success = "";

  const copyOfNip65Relays = [...nip65Relays];

  let allRelays;

  function ensureNip07Loaded(callback) {
    if (window.nostr) {
      callback();
    } else {
      setTimeout(ensureNip07Loaded, 10, callback);
    }
  }

  ensureNip07Loaded(async () => {
    const nip07Relays = await window.nostr.getRelays();
    const pubkey = await window.nostr.getPublicKey();

    allRelays = [
      ...Object.entries(nip07Relays).map(([relayAddress, relayProps]) => ({
        relay: relayAddress,
        ...relayProps,
      })),
      ...copyOfNip65Relays,
    ];

    const pool = new SimplePool();

    const event = await pool.get(
      allRelays.map((r) => r.relay),
      { kinds: [10002], authors: [pubkey], limit: 1 },
    );

    if (event) {
      nip65Relays = event.tags
        .filter((tag) => tag[0] === "r")
        .map((tag) => ({
          relay: tag[1],
          read: !tag[2] || tag[2] === "read",
          write: !tag[2] || tag[2] === "write",
        }));

      success = "Fetched NIP-65 relays";

      setTimeout(() => {
        success = null;
      }, 5000);
    } else {
      error = "Couldn't fetch any relays";

      setTimeout(() => {
        error = null;
      }, 5000);
    }
  });

  function addRelay() {
    nip65Relays = [...nip65Relays, { relay: "", read: true, write: true }];
  }

  function removeRelay(index) {
    nip65Relays = nip65Relays.filter((_, i) => i !== index);
  }

  function updateRelay(index, url, isRead, isWrite) {
    nip65Relays = nip65Relays.map((relay, i) =>
      i === index
        ? { ...relay, relay: url, read: isRead, write: isWrite }
        : relay,
    );
  }

  async function publishNIP65Event() {
    try {
      const relayListEvent = {
        kind: 10002,
        tags: nip65Relays
          .filter((r) => r.read || r.write)
          .map((r) => {
            if (r.read && !r.write) {
              return ["r", r.relay, "read"];
            }

            if (!r.read && r.write) {
              return ["r", r.relay, "write"];
            }

            return ["r", r.relay];
          }),
        created_at: Math.floor(Date.now() / 1000),
        content: "",
      };

      console.log("relayListEvent", relayListEvent);

      const signedEvent = await window.nostr.signEvent(relayListEvent);

      const pool = new SimplePool();
      const res = await Promise.allSettled(
        pool.publish(
          allRelays.map((r) => r.relay),
          signedEvent,
        ),
      );

      const publishedCount = res.filter((r) => r.status === "fulfilled").length;

      if (publishedCount === 0) {
        error = "Failed to publish NIP-65 event";
      } else {
        success = `NIP-65 event published (${publishedCount}/${allRelays.length})`;

        setTimeout(() => {
          success = null;
        }, 5000);
      }
    } catch (e) {
      error = e.message;

      setTimeout(() => {
        error = null;
      }, 5000);
    }
  }
</script>

<div class="nip65-relay-manager">
  {#if nip65Relays.length > 0}
    <div class="relay-list">
      {#each nip65Relays as relay, index}
        <div class="relay-row">
          <input
            type="text"
            value={relay.relay}
            on:change={(e) =>
              updateRelay(index, e.target.value, relay.read, relay.write)}
          />
          <label>
            <input
              type="checkbox"
              checked={relay.read}
              on:change={(e) =>
                updateRelay(index, relay.relay, e.target.checked, relay.write)}
            />
            Read
          </label>
          <label>
            <input
              type="checkbox"
              checked={relay.write}
              on:change={(e) =>
                updateRelay(index, relay.relay, relay.read, e.target.checked)}
            />
            Write
          </label>
          <button on:click={() => removeRelay(index)}>Remove</button>
        </div>
      {/each}
    </div>
    <div class="button-container">
      <button on:click={addRelay}>Add Relay</button>
      <button on:click={publishNIP65Event}>Publish NIP-65 Event</button>
    </div>
  {/if}

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if success}
    <p class="success">{success}</p>
  {/if}
</div>

<style>
  .nip65-relay-manager {
    margin: 20px;
  }

  .relay-list {
    margin-bottom: 10px;
  }

  .relay-row {
    display: flex;
    align-items: center;
    margin-bottom: 3px;
  }

  .relay-row,
  input[type="text"] {
    width: 150px;
    margin-right: 3px;
  }

  .relay-row button {
    margin-left: 3px;
  }

  label {
    margin-right: 3px;
    display: flex;
    align-items: center;
  }

  button {
    background-color: rgba(130 80 223 / 75%);
    color: floralwhite;
    padding: 5px;
    cursor: pointer;
    font-weight: bold;
    width: fit-content;
  }

  .button-container {
    display: flex;
    justify-content: flex-start;
    margin-top: 15px;
  }

  .button-container button {
    margin-right: 5px;
  }

  .error {
    color: red;
  }

  .success {
    color: green;
  }
</style>
