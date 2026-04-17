import React, { useState, useEffect } from "react";
import Table from "./components/Table";
import Pagination from "./components/Pagination";
import Skeleton from "./components/Skeleton";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartPage, setChartPage] = useState(1);
  const [otherPage, setOtherPage] = useState(1);

  // Mock table data
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Role", accessor: "role" },
    { header: "Status", accessor: "status", render: (row) => (
      <span style={{ 
        padding: "4px 8px", 
        borderRadius: "12px", 
        fontSize: "12px",
        background: row.status === "Active" ? "#dcfce7" : "#fee2e2",
        color: row.status === "Active" ? "#166534" : "#991b1b"
      }}>
        {row.status}
      </span>
    )}
  ];

  const data = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    role: i % 2 === 0 ? "Admin" : "User",
    status: i % 3 === 0 ? "Inactive" : "Active"
  }));

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px" }}>Component Library Demo</h1>

      {/* 1. Table with real data AND skeleton state */}
      <section style={{ marginBottom: "50px", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
        <h2>1. Reusable Table Component (Skeleton handled automatically via isLoading prop)</h2>
        <div style={{ marginBottom: "20px" }}>
          <button 
            onClick={() => setIsLoading(!isLoading)}
            style={{ padding: "8px 16px", cursor: "pointer", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}
          >
            Toggle Table Data / Loading State
          </button>
        </div>
        
        <Table 
          columns={columns} 
          data={data} 
          rowsPerPage={5} 
          isLoading={isLoading} 
        />
      </section>

      {/* 2. Standalone Skeleton Components */}
      <section style={{ marginBottom: "50px", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
        <h2>2. Standalone Skeleton Components</h2>
        
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "20px" }}>
          <div style={{ flex: "1 1 400px" }}>
            <h3 style={{ fontSize: "16px", color: "#4b5563" }}>Chart Skeleton</h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Shows a bar chart placeholder animation</p>
            <Skeleton type="chart" />
          </div>

          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ fontSize: "16px", color: "#4b5563" }}>Card Skeleton</h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>Shows a profile or data card placeholder</p>
            <Skeleton type="card" />
          </div>
        </div>
      </section>

      {/* 3. Standalone Pagination Examples */}
      <section style={{ border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
        <h2>3. Standalone Pagination</h2>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>Can be used anywhere. State is controlled by the parent component.</p>
        
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "20px" }}>
          
          {/* Example A: Pagination for 50 records per page */}
          <div style={{ flex: "1 1 400px", padding: "20px", background: "#f9fafb", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "16px", marginTop: 0 }}>Large Chart (50 records per page)</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>Currently fetching page {chartPage}...</p>
            <Pagination 
              currentPage={chartPage} 
              totalPages={20} 
              onPageChange={(page) => setChartPage(page)} 
            />
          </div>

          {/* Example B: Pagination for 20 records per page */}
          <div style={{ flex: "1 1 400px", padding: "20px", background: "#f9fafb", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "16px", marginTop: 0 }}>Other Data List (20 records per page)</h3>
            <p style={{ fontSize: "14px", fontWeight: "bold" }}>Currently fetching page {otherPage}...</p>
            <Pagination 
              currentPage={otherPage} 
              totalPages={8} 
              onPageChange={(page) => setOtherPage(page)} 
            />
          </div>

        </div>
      </section>
      
    </div>
  );
};

export default App;
