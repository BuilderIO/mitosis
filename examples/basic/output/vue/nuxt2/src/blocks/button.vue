<template>
  <a
    v-bind="attributes"
    role="button"
    v-if="link"
    :href="link"
    :target="openLinkInNewTab ? '_blank' : undefined"
  >
    {{ text }}
  </a>
  <span v-bind="attributes" v-else="">{{ text }}</span>
</template>
<script>
export default {
  name: "builder-button",

  props: ["attributes", "text", "link", "openLinkInNewTab"],
};
</script>
