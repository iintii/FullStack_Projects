import { imagekit } from "./imagekit";

export async function getPermanentImage(
  bookId: string,
  googleUrl?: string,
  isbn?: string,
): Promise<string> {
  // 1. Check if the image already exists in our ImageKit
  try {
    const existingFile = await imagekit.listFiles({
      searchQuery: `name = "book-${bookId}.jpg"`,
    });

    if (existingFile.length > 0) {
      const file = existingFile[0];

      // Use a Type Guard to tell TS this is a FileObject (which has a url)
      // and not a FolderObject
      if ("url" in file) {
        return file.url;
      }
    }
  } catch (e) {
    console.error("ImageKit search failed", e);
  }

  // 2. Priority list of sources to try
  const sources = [
    googleUrl?.replace("http://", "https://"),
    isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
      : null,
    `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=1`,
  ].filter(Boolean) as string[];

  for (const url of sources) {
    try {
      // Test if the image actually exists and is an image
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok || !res.headers.get("content-type")?.includes("image"))
        continue;

      // 3. SUCCESS: Upload the working image to ImageKit
      const upload = await imagekit.upload({
        file: url,
        fileName: `book-${bookId}.jpg`,
        folder: "/book-covers/",
        useUniqueFileName: false,
      });

      return upload.url;
    } catch (e) {
      continue;
    }
  }

  // Final fallback if all APIs fail
  return "https://placehold.co/400x600?text=No+Cover+Found";
}
