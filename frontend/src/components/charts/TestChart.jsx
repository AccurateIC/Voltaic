// /src/components/charts/LineChart.jsx
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMessageBus } from '../../lib/MessageBus';
import { convertPaletteToComplementDarkTheme, generateBaseColor, generateColorPalette, hslToRgb } from '../../lib/ColorUtil';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: -3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: -2000,
    pv: -9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: -1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: -3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];



const ColorPaletteModal = ({ isOpen, onClose, regenerateCallback, palette }) => {

  const baseRgb1 = hslToRgb(palette.base);
  const lightRgb1 = hslToRgb(palette.light);
  const darkRgb1 = hslToRgb(palette.dark);
  const complementRgb1 = hslToRgb(palette.complement);
  const accentRgb1 = hslToRgb(palette.accent);

  return (
    <dialog className="modal" open={isOpen}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Color Palette</h3>
        <div className="py-4 flex flex-row h-64 gap-2">
          <div>Palette</div>
          <div style={{ backgroundColor: baseRgb1 }} className={`flex-1 rounded`}></div>
          <div style={{ backgroundColor: lightRgb1 }} className={`flex-1 rounded`}></div>
          <div style={{ backgroundColor: darkRgb1 }} className={`flex-1 rounded`}></div>
          <div style={{ backgroundColor: complementRgb1 }} className={`flex-1 rounded`}></div>
          <div style={{ backgroundColor: accentRgb1 }} className={`flex-1 rounded`}></div>
        </div>
        <button className="btn" onClick={regenerateCallback}>Regenerate</button>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  );
};

const CustomTooltip = (props) => {
  console.log(props);
  const active = props.active;
  const payload = props.payload;
  const label = props.label;

  console.log(active)
  console.log(payload)
  console.log(label)

  if (active && payload && label) {
    return (
      <div className='card bg-base-300 shadow-2xl text-base-content bg-opacity-65'>
        <div className="card-body items-center text-center">
          <div>{label}</div>
          <div>pv: {payload[0].payload.pv}</div>
          <div>uv: {payload[0].payload.uv}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>hello</div>
    </>
  );
};

const TestChart = () => {
  const [baseColor, setBaseColor] = useState(generateBaseColor());
  const [palette, setPalette] = useState(() => generateColorPalette(baseColor)); // use this for light theme
  // palette: base, light, dark, complement, accent

  useEffect(() => {
    setPalette(generateColorPalette(baseColor));
  }, [baseColor]);

  console.log("Palette: ", palette);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pvColor, setPvColor] = useState(() => palette.base);
  const [uvColor, setUvColor] = useState(() => palette.complement);
  const [refLineColor, setRefLineColor] = useState({ h: 0, s: 0, l: 0, a: 1 });
  const [cursorBgColor, setCursorBgColor] = useState({ h: 200, s: 0.10, l: 0.82, a: 0.25 });

  useEffect(() => {
    setPvColor(palette.base);
    setUvColor(palette.complement);
  }, [palette]);

  const colors = useMemo(() => ({
    pv: hslToRgb(pvColor),
    uv: hslToRgb(uvColor),
    refLine: hslToRgb(refLineColor),
    cursor: hslToRgb(cursorBgColor),
  }), [pvColor, uvColor, refLineColor, cursorBgColor, palette]);

  useMessageBus('theme-switch', (msg) => {
    console.log(`Message Received: ${JSON.stringify(msg, null, 2)}`);
    const currentTheme = msg.message;
    if (currentTheme === 'business') { // dark theme
      setPvColor(baseColor)
      setUvColor(palette.complement);
      setRefLineColor({ h: 0, s: 0, l: 0, a: 1 });
      setCursorBgColor({ h: 200, s: 0.10, l: 0.82, a: 0.25 });
    } else if (currentTheme === 'corporate') { // light theme
      setPvColor(baseColor)
      setUvColor(palette.complement);
      setRefLineColor({ h: 0, s: 0, l: 0, a: 1 });
      setCursorBgColor({ h: 200, s: 0.10, l: 0.82, a: 0.25 });
    } else {
      console.error(`Unknown theme: ${currentTheme}`);
    }
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const regeneratePalette = () => {
    setBaseColor(generateBaseColor())
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className='m-4'>
        <button className="btn" onClick={handleOpenModal}>Palette</button>
        <button className="btn" onClick={regeneratePalette}>Regenerate</button>
        <ColorPaletteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          palette={palette}
          regenerateCallback={regeneratePalette}
        />
      </div>
      <div className='flex-1'>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip cursor={{ fill: colors.cursor }} content={<CustomTooltip />} animationEasing='ease-in-out' animationDuration={300} />
            <Legend />
            <ReferenceLine y={0} stroke={colors.refLine} />
            <Bar dataKey="pv" fill={colors.pv} />
            <Bar dataKey="uv" fill={colors.uv} activeBar={{ stroke: 'red' }} />
          </BarChart>
        </ResponsiveContainer >
      </div>
    </div>
  );
};

export default TestChart;
