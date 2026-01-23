interface DPadProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
}

export function DPad({ onUp, onDown, onLeft, onRight }: DPadProps) {
  return (
    <div className="d-grid" style={{ gridTemplateColumns: "repeat(3, 40px)" }}>
      <div />
      <button className="btn btn-dark btn-sm" onClick={onUp}>▲</button>
      <div />

      <button className="btn btn-dark btn-sm" onClick={onLeft}>◀</button>
      <div />
      <button className="btn btn-dark btn-sm" onClick={onRight}>▶</button>

      <div />
      <button className="btn btn-dark btn-sm" onClick={onDown}>▼</button>
      <div />
    </div>
  );
}
