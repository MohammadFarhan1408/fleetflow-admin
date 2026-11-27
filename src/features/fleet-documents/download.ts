/**
 * Hands a presigned download link to the browser. The storage service answers with `Content-Disposition: attachment`,
 * so the file downloads and the page stays. Only http(s) links are followed; the link is never logged or kept.
 */
export const startDownload = (url: string) => {
  const { protocol } = new URL(url);
  if (protocol !== "https:" && protocol !== "http:")
    throw new Error("Refused a download link that is not http or https");
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  link.click();
};
