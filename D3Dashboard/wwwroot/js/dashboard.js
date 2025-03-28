$(document).ready(function () {
    function setDefaultDates() {
        let today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
        $("#startDate").val(today);
        $("#endDate").val(today);
        $("#endDate").attr("max", today); // Prevent selecting future dates
    }

    function loadChart(data) {
        let svg = d3.select("#chart");
        svg.selectAll("*").remove();

        const width = 700;
        const height = 400;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        if (!data || data.length === 0) {
            console.warn("No data to display");
            return;
        }

        data.forEach(d => {
            if (!d.value || isNaN(d.value)) {
                console.error("Invalid data point:", d);
                d.value = 0; // Default value to prevent NaN issues
            }
        });

        let xScale = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([margin.left, width - margin.right])
            .padding(0.4);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) || 10])
            .nice()
            .range([height - margin.bottom, margin.top]);

        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis);

        function dragStarted(event, d) {
            d3.select(this).raise().attr("stroke", "black");
        }

        function dragged(event, d) {
            let newY = Math.max(margin.top, Math.min(height - margin.bottom, event.y));
            d3.select(this)
                .attr("y", newY)
                .attr("height", height - margin.bottom - newY);
        }

        function dragEnded(event, d) {
            d3.select(this).attr("stroke", null);
        }

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.category))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - margin.bottom - yScale(d.value))
            .attr("fill", "steelblue")
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragEnded));
    }

    function fetchData() {
        $.ajax({
            url: "/Dashboard/FilterData",
            type: "POST",
            data: {
                startDate: $("#startDate").val(),
                endDate: $("#endDate").val(),
                category: $("#categoryFilter").val()
            },
            dataType: "json",
            success: function (data) {
                console.log("Filtered Data Received:", data);
                loadChart(data);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error, xhr.responseText);
            }
        });
    }

    setDefaultDates(); // ✅ Set default date values on page load
    fetchData(); // ✅ Load chart data

    $("#applyFilter").click(function () {
        fetchData();
    });
});
