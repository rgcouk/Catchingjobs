/** Browser-only signed-out fixture. Served exclusively by framework-preview.ts. */
window.Clerk = {
  loaded: true,
  user: null,
  session: null,
  organization: null,
  client: { signIn: {}, signUp: {}, sessions: [] },
  load: async () => {},
  addListener(listener) {
    listener({ user: null, session: null, organization: null, client: this.client });
    return () => {};
  },
};
