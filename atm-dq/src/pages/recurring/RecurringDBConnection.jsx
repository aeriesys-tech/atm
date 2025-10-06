import React, { useState } from "react";
import Layout from "../../layout/Layout";
import Dropdown from "../../components/common/Dropdown";

import Headertext from "../../components/common/Headertext";
import RecurringMenubar from "../../components/common/RecurringMenubar";
import SimpleDropdown from "../../components/common/SimpleDropdown";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Downloadfile from "../../components/common/Downloadfile";
import Fileinput from "../../components/common/Fileinput";

function RecurringDBConnection() {
  const [selectedSources, setSelectedSources] = useState([]);

  const handleChange = (newSelection) => {
    setSelectedSources(newSelection);
  };

  const handleRemove = (itemToRemove) => {
    setSelectedSources((prev) => prev.filter((item) => item !== itemToRemove));
  };
  const header = (
    <div className="flex items-center justify-between md:px-10 px-4 py-2">
      <Headertext Text="Create New Jobs - Recurring" />
    </div>
  );

  return (
    <Layout header={header}>
      <RecurringMenubar />
      <div className="py-4">
        <div className="flex items-center justify-between">
          <SimpleDropdown
            isMulti
            width="300px"
            options={["OSI/PI", "CDH", "InfluxDB", "Pastgres DB"]}
            value={selectedSources}
            onChange={handleChange}
          />
          <div className="flex flex-wrap mt-2 md:mt-0 items-center gap-2">
            {selectedSources.includes("Direct") && (
              <div className="flex items-center gap-2">
                <Downloadfile text="Download and Edit" />
                <Fileinput />
              </div>
            )}

            <Link to="/recurring-dqconfiguration">
              <Button text="Submit" />
            </Link>
          </div>
        </div>

        {selectedSources.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSources.map((item) => (
              <div
                key={item}
                className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm shadow-sm"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleRemove(item)}
                  className="ml-2 text-gray-500 hover:text-red-600 focus:outline-none text-lg"
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RecurringDBConnection;
