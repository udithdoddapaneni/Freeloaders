import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs"; // For date manipulation

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const URL_BASE = "http://127.0.0.1:8000";

const Component1 = () => {
  const [chartData, setChartData] = useState({ labels: [], data: [] });
  const [filteredData, setFilteredData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("lastWeek");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${URL_BASE}/transaction_per_day_line`);
        const result = await response.json();

        setChartData({
          labels: result.labels,
          data: result.data,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chartData.labels.length) {
      filterData();
    }
  }, [timeframe, chartData]);

  const filterData = () => {
    const latestDate = dayjs(chartData.labels[chartData.labels.length - 1]);
    let startDate;

    switch (timeframe) {
      case "lastWeek":
        startDate = latestDate.subtract(7, "day");
        break;
      case "lastMonth":
        startDate = latestDate.subtract(1, "month");
        break;
      case "lastYear":
        startDate = latestDate.subtract(1, "year");
        break;
      default:
        startDate = latestDate.subtract(7, "day");
    }

    // Filter labels and data based on the selected timeframe
    const filteredLabels = chartData.labels.filter((label) =>
      dayjs(label).isAfter(startDate)
    );
    const filteredData = chartData.data.slice(
      chartData.labels.indexOf(filteredLabels[0])
    );

    setFilteredData({
      labels: filteredLabels,
      data: filteredData,
    });
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const data = {
    labels: filteredData.labels,
    datasets: [
      {
        label: "Transactions Over Days",
        data: filteredData.data,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
        pointBorderColor: "#fff",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
        },
        ticks: {
          color: "#4B5563", // Tailwind's gray-600
        },
      },
      x: {
        grid: {
          color: "rgba(200, 200, 200, 0.3)",
        },
        ticks: {
          color: "#4B5563", // Tailwind's gray-600
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#4B5563", // Tailwind's gray-600
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Dropdown and Chart Title */}
      <div className="flex justify-center py-8 items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Transactions over Days
        </h1>

        {/* Dropdown for selecting timeframe */}
        <div className="relative ml-4">
          <select
            value={timeframe}
            onChange={handleTimeframeChange}
            className="block w-full px-3 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="lastYear">Last Year</option>
          </select>
        </div>
      </div>

      {/* Line Chart */}
      <div className="flex justify-center py-8">
        <div className="w-full h-96">
          <Line
            data={data}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      let label = context.dataset.label || "";
                      if (label) {
                        label += ": ";
                      }
                      if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat("en-US", {
                          style: "decimal",
                        }).format(context.parsed.y);
                      }
                      return label;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Statistics and Fun Fact Display */}
      {/* <div className="flex justify-around mt-36">
        <div className="w-full md:w-1/2 lg:w-1/3 px-4 py-4 bg-transparent shadow-md rounded-lg border border-gray-200">
          <h1 className="text-xl font-bold mb-4 text-center text-gray-700">
            Statistics
          </h1>
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Min:</p>
              <p className="text-lg font-semibold text-gray-800">
                {Math.min(...filteredData.data)}
              </p>
            </div>

            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Max:</p>
              <p className="text-lg font-semibold text-gray-800">
                {Math.max(...filteredData.data)}
              </p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Average:</p>
              <p className="text-lg font-semibold text-gray-800">
                {(
                  filteredData.data.reduce((a, b) => a + b, 0) /
                  filteredData.data.length
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-1/3 px-4 py-4 bg-white shadow-md rounded-lg border border-gray-200">
          <h1 className="text-xl font-bold mb-4 text-center text-gray-700">
            Fun Fact
          </h1>
          <p className="text-center text-gray-600">
            Did you know? The highest number of transactions in a single day was{" "}
            {Math.max(...filteredData.data)}!
          </p>
        </div>
      </div> */}
      <div className="flex justify-around mt-36">
        {/* Statistics Block */}
        <div className="w-full md:w-1/2 lg:w-1/3 px-4 py-4 bg-transparent shadow-md rounded-lg border border-gray-200">
          <h1 className="text-xl font-bold mb-4 text-center text-gray-700">
            Statistics
          </h1>
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Min:</p>
              <p className="text-lg font-semibold text-gray-800">
                {Math.min(...filteredData.data)}
              </p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Max:</p>
              <p className="text-lg font-semibold text-gray-800">
                {Math.max(...filteredData.data)}
              </p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Average:</p>
              <p className="text-lg font-semibold text-gray-800">
                {(
                  filteredData.data.reduce((a, b) => a + b, 0) /
                  filteredData.data.length
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Business Analytics Block */}
        <div className="w-full md:w-1/2 lg:w-1/3 px-4 py-4 bg-white shadow-md rounded-lg border border-gray-200">
          <h1 className="text-xl font-bold mb-4 text-center text-gray-700">
            Business Analytics
          </h1>

          {/* Total Transactions */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">Total Transactions:</p>
            <p className="text-lg font-semibold text-gray-800">
              {filteredData.data.reduce((a, b) => a + b, 0)}
            </p>
          </div>

          {/* Transaction Growth Rate */}
          {/* Assuming previousData is preloaded and available for comparison */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Growth Rate (compared to last period):
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {/* Placeholder formula: replace with your own logic */}
              {(
                ((filteredData.data.reduce((a, b) => a + b, 0) - 5) / 5) *
                100
              ).toFixed(2)}
              %
            </p>
          </div>

          {/* Peak Activity Day */}
          <div>
            <p className="text-sm text-gray-600">Peak Activity Day:</p>
            <p className="text-lg font-semibold text-gray-800">
              {
                filteredData.labels[
                  filteredData.data.indexOf(Math.max(...filteredData.data))
                ]
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Component1;