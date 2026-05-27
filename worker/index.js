export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const shouldRedirectToWww =
      host === "2b2t-th.org" ||
      (host.endsWith(".2b2t-th.org") && host !== "www.2b2t-th.org");

    if (shouldRedirectToWww) {
      url.hostname = "www.2b2t-th.org";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
