/**
 * Agrocart CSV Export Utility
 * 
 * Logic:
 * - Converts an array of objects into a valid CSV string.
 * - Handles escaping commas and quotes.
 * - Triggers a browser download.
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // 1. Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // 2. Build rows
  const rows = data.map(obj => {
    return headers.map(header => {
      const val = obj[header];
      // Escape strings containing commas or quotes
      if (typeof val === "string") {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",");
  });

  // 3. Combine headers and rows
  const csvContent = [headers.join(","), ...rows].join("\n");

  // 4. Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
