<script lang="ts">
import { computed, defineComponent } from "vue";
import LayoutFooter from "./components/LayoutFooter.vue";
import LayoutHeader from "./components/LayoutHeader.vue";
import Notification from "./components/Notification.vue";
import Loader from "./components/Loader.vue";

import useMetaMask from "./composables/metamask";
import useConfig from "./config";
import NETWORK from "./constants";

export default defineComponent({
  name: "App",
  components: { LayoutHeader, LayoutFooter, Notification, Loader },
  setup() {
    const { isSupportedNetwork, unmatchedNetwork } = useMetaMask();
    const { supportedChainIds } = useConfig();

    const supportedChainName = computed(() => {
      let names: string[] = [];
      supportedChainIds.forEach((id) => {
        names.push(NETWORK(id)?.name!);
      });
      return names.join(", ");
    });

    return { isSupportedNetwork, unmatchedNetwork, supportedChainName };
  },
});
</script>

<template>
  <layout-header />
  <div v-if="isSupportedNetwork && !unmatchedNetwork">
    <router-view></router-view>
  </div>
  <div
    v-else
    class="text-center text-xl text-red-500 p-4"
  >
    <p>You are connected to the wrong chain. Please switch to {{ supportedChainName }}.</p>
  </div>
  <layout-footer />

  <loader />
  <notification />
</template>