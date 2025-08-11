import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function Linechart() {
  const options = {
    chart: {
      type: "line",
      backgroundColor: "transparent", // Let Tailwind handle background
    },
    title: {
      text: "Sales Over Time",
    },
    xAxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    yAxis: {
      title: {
        text: "Sales",
      },
    },
    series: [
      {
        name: "Product A",
        data: [29, 71, 106, 129, 144, 176],
      },
    ],
    credits: {
      enabled: false,
    },
  };
  return (
    <>
      <div className="rounded-2xl shadow-lg p-4 bg-white ">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </>
  );
}

export default Linechart;
