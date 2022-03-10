<script>
export default {
  name: 'ErrorBoundary',
  data: () => ({
    error: false,
  }),
  errorCaptured(err, vm, info) {
    console.error('Error in Builder.io block:', error);
    this.error = true;
  },
  render(h) {
    return this.error
      ? h('p', 'Builder.io render error')
      : this.$slots.default[0];
  },
};
</script>
