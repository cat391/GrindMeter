import { useState, useEffect } from "react";

export default function CategoryComponent() {
  return (
    <div>
      <select className="opacity-15" name="category">
        <option value="">--</option>
      </select>
    </div>
  );
}
