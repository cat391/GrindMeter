export default function TestImage({ src }) {
  return (
    <div>
      <img
        src={src}
        alt="Profile Test"
        style={{ width: "100px", height: "100px" }}
      />
    </div>
  );
}
