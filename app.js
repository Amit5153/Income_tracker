let data = JSON.parse(localStorage.getItem('profitData')) || [];
let editMode = null;
let chartType = 'bar';  // Default chart type

function calculateProfit() {
    const month = document.getElementById("month").value;
    const income = parseFloat(document.getElementById("income").value);
    const expenses = parseFloat(document.getElementById("expenses").value);

    if (isNaN(income) || isNaN(expenses)) {
        alert("Please enter valid income and expense values.");
        return;
    }

    const profit = income - expenses;
    const monthData = { month, income, expenses, profit };

    if (editMode) {
        data = data.map(item => item.month === editMode ? monthData : item);
        editMode = null;
    } else {
        const existingMonth = data.find(item => item.month === month);
        if (existingMonth) {
            alert("Data for this month already exists. Use Edit to update.");
            return;
        }
        data.push(monthData);
    }

    localStorage.setItem('profitData', JSON.stringify(data));
    clearInputFields();
    updateTable();
    updateChart();
}

function clearInputFields() {
    document.getElementById("income").value = '';
    document.getElementById("expenses").value = '';
    document.getElementById("month").value = 'January';
}

function editEntry(month) {
    const entry = data.find(item => item.month === month);
    if (entry) {
        document.getElementById("month").value = entry.month;
        document.getElementById("income").value = entry.income;
        document.getElementById("expenses").value = entry.expenses;
        editMode = month;
    }
}

function deleteEntry(month) {
    data = data.filter(item => item.month !== month);
    localStorage.setItem('profitData', JSON.stringify(data));
    updateTable();
    updateChart();
}

function updateTable() {
    const tableBody = document.getElementById("profitTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    data.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.month}</td>
            <td>${item.income.toFixed(2)}</td>
            <td>${item.expenses.toFixed(2)}</td>
            <td>${item.profit.toFixed(2)}</td>
            <td>
                <button onclick="editEntry('${item.month}')">Edit</button>
                <button onclick="deleteEntry('${item.month}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateTotals();
}

function updateTotals() {
    const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
    const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);

    document.getElementById('totalIncome').textContent = `Total Income: ₹${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `Total Expenses: ₹${totalExpenses.toFixed(2)}`;
    document.getElementById('totalProfit').textContent = `Total Profit: ₹${totalProfit.toFixed(2)}`;
}

function changeChartType(type) {
    chartType = type;
    updateChart();
}

function updateChart() {
    const ctx = document.getElementById('profitChart').getContext('2d');
    const labels = data.map(item => item.month);
    const incomeData = data.map(item => item.income);
    const expensesData = data.map(item => item.expenses);
    const profitData = data.map(item => item.profit);

    // Get checkbox values
    const showIncome = document.getElementById("showIncome").checked;
    const showExpenses = document.getElementById("showExpenses").checked;
    const showProfit = document.getElementById("showProfit").checked;

    // Build dataset based on selected checkboxes
    const datasets = [];
    if (showIncome) {
        datasets.push({
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        });
    }
    if (showExpenses) {
        datasets.push({
            label: 'Expenses',
            data: expensesData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        });
    }
    if (showProfit) {
        datasets.push({
            label: 'Profit',
            data: profitData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        });
    }

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize table and chart on load
document.addEventListener('DOMContentLoaded', () => {
    updateTable();
    updateChart();
});

function exportToCSV() {
    let csvContent = "Month,Income,Expenses,Profit\n";
    data.forEach(item => {
        csvContent += `${item.month},${item.income},${item.expenses},${item.profit}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "profit_data.csv");
    a.click();
}

function exportToPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("portrait", "pt", "A4");
    

    // PDF Title
    doc.setFontSize(18);
    doc.setTextColor("#357ABD");
    doc.text("Monthly Profit Report", 210, 40, { align: "center" });

    // Table Header Styling
    doc.setFontSize(12);
    doc.setTextColor("#ffffff");
    doc.setFillColor("#0074D9");
    doc.rect(40, 60, 500, 20, "F"); // Header background rectangle
    doc.text("Month", 50, 75);
    doc.text("Income", 180, 75);
    doc.text("Expenses", 310, 75);
    doc.text("Profit", 440, 75);

    // Add table rows and data content
    const rowHeight = 20;
    let yPosition = 95;
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalProfit = 0;
    
    doc.setTextColor("#333333");
    doc.setFont("helvetica", "normal");

    data.forEach((item, index) => {
        // Alternate row color for better readability
        if (index % 2 === 0) {
            doc.setFillColor("#f0f8ff");
            doc.rect(40, yPosition - rowHeight + 5, 500, rowHeight, "F");
        }

        // Add text for each column
        doc.text(item.month, 50, yPosition);
        doc.text(item.income.toFixed(2).toString(), 180, yPosition);
        doc.text(item.expenses.toFixed(2).toString(), 310, yPosition);
        doc.text(item.profit.toFixed(2).toString(), 440, yPosition);

        // Accumulate totals
        totalIncome += item.income;
        totalExpenses += item.expenses;
        totalProfit += item.profit;

        yPosition += rowHeight;
    });

    // Add Total Row
    doc.setFont("helvetica", "bold");
    doc.setFillColor("#0074D9"); // Background color for total row
    doc.setTextColor("#ffffff"); // Text color for total row
    doc.rect(40, yPosition - rowHeight + 5, 500, rowHeight, "F");
    doc.text("Totals", 50, yPosition);
    doc.text(totalIncome.toFixed(2).toString(), 180, yPosition);
    doc.text(totalExpenses.toFixed(2).toString(), 310, yPosition);
    doc.text(totalProfit.toFixed(2).toString(), 440, yPosition);

    // Add Footer Text
    doc.setFontSize(10);
    doc.setTextColor("#666666");
    doc.text("Generated on: " + new Date().toLocaleDateString(), 40, yPosition + 40);
    
    // Save PDF
    doc.save("Monthly_Profit_Report.pdf");
}

function importFromCSV(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            const rows = csv.split("\n").slice(1); // Skip the header row

            rows.forEach(row => {
                const [month, income, expenses, profit] = row.split(",");
                if (month && !isNaN(income) && !isNaN(expenses) && !isNaN(profit)) {
                    const monthData = {
                        month: month.trim(),
                        income: parseFloat(income),
                        expenses: parseFloat(expenses),
                        profit: parseFloat(profit)
                    };
                    data.push(monthData);
                }
            });

            localStorage.setItem('profitData', JSON.stringify(data));
            updateTable();
            updateChart();
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a valid CSV file.");
    }
}
