import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PredictiveMaintenance = () => {
  const [status, setStatus] = useState({
    frequency: 'loading',
    temperature: 'loading',
    hydrocarbon: 'loading',
  });
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newStatus = {
        frequency: Math.random() > 0.2 ? 'ok' : 'problem',
        temperature: Math.random() > 0.2 ? 'ok' : 'problem',
        hydrocarbon: Math.random() > 0.2 ? 'ok' : 'problem',
      };
      setStatus(newStatus);

      if (Object.values(newStatus).includes('problem')) {
        setShowGraph(true);
        setGraphData(generateDummyData());
      } else {
        setShowGraph(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const generateDummyData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i + 1,
      value: Math.floor(Math.random() * 100) + 20,
    }));
  };

  const renderStatus = (type) => {
    if (status[type] === 'loading') return <Loader2 className="animate-spin" />;
    if (status[type] === 'ok') return <CheckCircle className="text-green-500" />;
    if (status[type] === 'problem') return <XCircle className="text-red-500" />;
  };

  const renderProblemDetails = (type) => {
    if (status[type] === 'problem') {
      return (
        <div className="text-red-600 mt-2">
          <p>Problem detected in {type}.</p>
          <p>Check components related to {type} management.</p>
        </div>
      );
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Predictive Maintenance</h2>
      <Card className="mb-4">
        <CardContent>
          <label className="flex items-center gap-4 font-bold">
            Checking Frequency {renderStatus('frequency')}
          </label>
          {renderProblemDetails('frequency')}
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardContent>
          <label className="flex items-center gap-4 font-bold">
            Checking Temperature {renderStatus('temperature')}
          </label>
          {renderProblemDetails('temperature')}
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardContent>
          <label className="flex items-center gap-4 font-bold">
            Checking Hydrocarbon Emission {renderStatus('hydrocarbon')}
          </label>
          {renderProblemDetails('hydrocarbon')}
        </CardContent>
      </Card>
      {showGraph && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white">Abnormality Detected - Analysis Graph</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#333", border: "none", color: "#fff" }} />
              <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {!showGraph && (
        <div className="text-[#B1D5BD] font-bold text-center mt-4 text-xl">
          All set - Working in Good Condition
        </div>
      )}
    </div>
  );
};

export default PredictiveMaintenance;
