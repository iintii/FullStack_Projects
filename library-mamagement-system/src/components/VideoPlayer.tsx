export default function VideoPlayer({ url }: { url: string }) {
  // Simple check to handle YouTube embeds vs direct files
  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");

  // Convert standard YT watch URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!isYoutube) return url;
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="mockup-window border border-base-300 bg-base-300">
      <div className="flex justify-center bg-base-200 aspect-video w-full">
        {isYoutube ? (
          <iframe
            src={getEmbedUrl(url)}
            className="w-full h-full"
            allowFullScreen
            title="Book Trailer"
          />
        ) : (
          <video src={url} controls className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
