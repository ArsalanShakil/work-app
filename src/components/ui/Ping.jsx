export default function Ping(props) {
  return (
    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full" {...props}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info-content opacity-90" />
      <span className="relative mb-3 inline-flex h-3 w-3 rounded-full bg-info-content" />
    </span>
  );
}
