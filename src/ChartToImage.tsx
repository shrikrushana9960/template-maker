import React, { useRef, useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { toPng } from "html-to-image";

export default function ChartToImage({ onImageReady }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const chartOptions = {
    chart: { id: "apexchart" },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr"] },
  };
  const chartSeries = [{ name: "Sales", data: [10, 20, 15, 25] }];

  useEffect(() => {
    if (chartRef.current) {
      toPng(chartRef.current).then((dataUrl) => {
        onImageReady(dataUrl); // pass PNG to parent
      });
    }
  }, []);

  return (
    <div ref={chartRef}>
      <Chart options={chartOptions} series={chartSeries} type="bar" width={400} height={300} />
    </div>
  );
}
