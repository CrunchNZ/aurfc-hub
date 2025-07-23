import React, { useState, useEffect } from 'react';
import { getParentDashboard } from '../services/junior';

function ParentDashboard({ juniorId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await getParentDashboard(juniorId);
      setData(dashboardData);
    };
    fetchData();
  }, [juniorId]);

  return (
    <div>
      <h2>Parent Dashboard</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}

export default ParentDashboard; 