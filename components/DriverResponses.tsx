import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { getResponse, getImpedance} from "../model/speaker-designer";
import { useState} from "react";
import styles from './SpeakerDesign.module.scss';
import StoredResponsesTable from "./tables/StoredResponsesTable";
import {
  DriverResponseNamed,
  DriverResponseStyleNamed,
  DriverResponse, Driver,
} from './types';
import DriverDatabase from "./tables/DriverDatabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
);


export const colors = [
  'red',
  'green',
  'blue',
  'grey',
  'orange',
  'teal',
  'purple',
  'violet',
  'maroon',
  'magenta',
  'cyan',
  'khaki',
  'thistle',
  'tan',
];

interface DriverResponsesProps {
  Vb: number,
  Fb: number,
  ported: boolean,
  nDrivers: number,
}

const DriverResponses = (props: DriverResponsesProps) => {

  const {Vb, Fb, ported, nDrivers} = props;

  const [hoveredDriver, setHoveredDriver] = useState<string | null>( null);
  const [savedTraces, setSavedTraces] = useState<DriverResponseNamed[]>([]);

  const savedTracesWithColor: Array<DriverResponseStyleNamed> = savedTraces.map((d, j) => ({
    ...d,
    color: colors[j % colors.length],
    style: 'normal'
  }))

  const scatterPlotData = {
    datasets: savedTracesWithColor.map(d => ({...d,
        canHover: !savedTracesWithColor.some(d2 => d2 !== d && d2.name === d.name),
        label: d.name,
    }))
    .map(({ response, color, canHover, label}) => {
      return {
        label,
        data: response.f.map((x, i) => ({x, y: response.SPLTher[i]})),
        borderColor: color,
        backgroundColor: color,
        showLine: true,
        borderWidth: canHover && label === hoveredDriver ? 8 : 2,
      }
    })
  };

  const scatterPlotOptions = {
    responsive: true,
    animation: false as any,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      }
    },
    scales: {
      x: {
        type: 'logarithmic' as const
      },
      y: {
        max: 100,
        min: 70
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        onHover: (event: any, item: {text: string}) => {
          setHoveredDriver(item.text);
        },
        onLeave: (event: any, item: {text: string}) => {
          setHoveredDriver(null);
        },
        labels: {
          generateLabels: ({ctx}: any) => {
            return scatterPlotData.datasets.map((d, i) => ({
              text: d.label,
              datasetIndex: i,
              fillStyle: d.backgroundColor,
              strokeStyle: d.borderColor,
              lineWidth: 4,
            }))
          }
        }
      },
      title: {
        display: false,
        text: 'Driver responses',
      },
    },
  };

  const saveDriver = (driver: Driver) => {
    const dr = {
      driver,
      response: getResponse({
        Fs: driver.Fs,
        Vas: driver.Vas,
        Qts0: driver.Qts,
        Qes: driver.Qes,
        Xmax: driver.Xmax,
        Sdcm2: driver.Sd,

        Vb,
        Fb,
        nDrivers,
        ported,
      }),
      impedance: getImpedance(driver),
    }

    setSavedTraces([
      ...savedTraces,
      {
        ...dr,
        driver: {
          ...dr.driver,
          id: 10000 + Math.round(Math.random() * 10000),
        },
        name: `${dr.driver.Brand} ${dr.driver.model}`,
        editing: false,
        Vb,
        Fb,
        ported,
        nDrivers,
      }
    ])
  }

  const removeTrace = (i: number) => setSavedTraces(savedTraces.filter((_ , j) => i !== j));
  const duplicateTrace = (i: number) => {
    const oldTrace = savedTraces[i];
    const newTrace: DriverResponseNamed = {
      ...oldTrace,
      name: oldTrace.name + ' copy',
      driver: {...oldTrace.driver},
      response: {...oldTrace.response},
    };
    setSavedTraces([...savedTraces, newTrace]);
  }

  const defaultCell = (text: string) => ({text, exportable: true});

  const updateSavedTrace = (i: number, drn: DriverResponseStyleNamed) => {
    setSavedTraces(savedTraces.map((t, j) => {
      return i !== j ? t : drn
    }))
  }

  const recalculate = (i: number | undefined, drsn: DriverResponseStyleNamed) => {
    if (i === undefined) {return}
    const {driver} = drsn;

    //console.log("recalc with ", driver.Sd);
    drsn.response = getResponse({
      Fs: driver.Fs,
      Vas: driver.Vas,
      Qts0: driver.Qts,
      Qes: driver.Qes,
      Xmax: driver.Xmax,
      Sdcm2: driver.Sd,

      Vb: drsn.Vb,
      Fb: drsn.Fb,
      nDrivers: drsn.nDrivers,
      ported: drsn.ported,
    });

    updateSavedTrace(i, drsn);
  }

  return <div className={styles.container}>

    <div style={{display: 'flex', flexDirection: 'row', gap: 24}}>

      <div style={{flex: 1}}>
        <div className={"sectionTitle"}>SPL RESPONSE (1W/1m)</div>
        <div style={{minWidth: 500, maxWidth: 1200, maxHeight: 800, minHeight: 500}}>
          <Scatter options={scatterPlotOptions} data={scatterPlotData} />
        </div>
      </div>

      <div style={{flex: 1}}>
        <div className={"sectionTitle"}>IMPEDANCE</div>
        <div style={{minWidth: 500, maxWidth: 1200, maxHeight: 800, minHeight: 500}}>
          <Scatter
            options={{
              responsive: true,
              animation: false as any,
              maintainAspectRatio: false,
              elements: { point: { radius: 0 } },
              scales: {
                x: { type: 'logarithmic' as const },
                y: { min: 0, }
              },
              plugins: {
                legend: { position: 'top' as const },
                title: { display: false }
              }
            }}
            data={{
              datasets: savedTracesWithColor.map(d => ({
                label: d.name,
                data: d.impedance
                  ? d.impedance.f.map((x: number, i: number) => ({ x, y: d.impedance!.Z[i] }))
                  : [],
                borderColor: d.color,
                backgroundColor: d.color,
                showLine: true,
                borderWidth: 2,
              }))
            }}
          />
        </div>
      </div>

    </div>

    <StoredResponsesTable
      recalculate={recalculate}
      removeTrace={removeTrace}
      duplicateTrace={duplicateTrace}
      updateSavedTrace={updateSavedTrace}
      savedTracesWithColor={savedTracesWithColor}
      setHoveredDriver={setHoveredDriver}
    />

    <DriverDatabase
      saveDriver={saveDriver}
      defaultCell={defaultCell}
      nDrivers={nDrivers}
    />

  </div>;

}

export default DriverResponses;