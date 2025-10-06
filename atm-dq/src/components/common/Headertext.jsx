import React from "react";

function Headertext({ Text }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-600 bg-gray-100">
        {Text}
      </h1>
    </div>
  );
}

export default Headertext;
