import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function Roundedchart() {
    const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
    },
    title: {
      text: "Device Usage (Pie Chart)",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
        borderRadius: 8, // optional: smooth edge look
      },
    },
    series: [
      {
        name: "Users",
        colorByPoint: true,
        data: [
          { name: "Desktop", y: 40 },
          { name: "Mobile", y: 35 },
          { name: "Tablet", y: 15 },
          { name: "Other", y: 10 },
        ],
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <>
     <div className="rounded-2xl shadow-md p-4 bg-white  w-full ">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
    </>
  )
}

export default Roundedchart
