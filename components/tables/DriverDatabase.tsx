import styles from "../SpeakerDesign.module.scss";
import {DriverTableCell, Driver, DriverTableRow} from "../types";
import { useState} from "react";
import { useDrivers} from "../../model/speaker-designer";

type DriverDatabaseProps = {
  defaultCell: (text: string) => DriverTableCell,
  saveDriver: (driver: Driver) => void,
  nDrivers: number,
}

const DriverDatabase = (props: DriverDatabaseProps) => {

  const {
    defaultCell,
    saveDriver,
    nDrivers,
  } = props;

  const [showTable, setShowTable] = useState(true);
  const [Sd, setSd] = useState('100');
  const [filterDriversPercent, setFilterDriversPercent] = useState('5');

  const drivers = useDrivers({Sd: Number(Sd), filterDriversPercent: Number(filterDriversPercent)});

  const visibleDrivers: Array<Driver> = drivers
    .sort((a, b) => a.Sd - b.Sd)
    .sort((a, b) => a.Brand.localeCompare(b.Brand));

  const allDriversHeaders = [
    'Brand',
    'Model',
    'Sd [cm2]',
    'Fs [Hz]',
    'Qts',
    'Vas [L]',
    'Re [Ω]',
    'Mms [g]',
    'BL [Tm]',
    'Cms [µm/N]',
    'Rms [Ns/m]',
    'Xmax [mm]',
    'Total Displacement [cm3]',
  ];

  const tableData: Array<DriverTableRow> = visibleDrivers
  .map(driver => {

      return {
        driver,
        cells: [
          {text: driver.Brand, exportable: true},
          {text: driver.model, exportable: true},

          defaultCell(`${Math.round(driver.Sd)}`),
          defaultCell(`${Math.round(driver.Fs)}`),
          defaultCell(`${driver.Qts.toFixed(3)}`),
          defaultCell(`${driver.Vas.toFixed(3)}`),
          defaultCell(`${driver.Re}`),
          defaultCell(`${(driver.Mms * 1000).toFixed(1)}`),
          defaultCell(`${driver.BL.toFixed(4)}`),
          defaultCell(`${Math.round(driver.Cms * 1e6)}`),
          defaultCell(`${driver.Rms.toFixed(4)}`),
          defaultCell((driver.Xmax ?? 0) > 0 ? `${driver.Xmax.toFixed(2)}` : ``),
          defaultCell((driver.Xmax ?? 0) > 0 ? `${(driver.Xmax * driver.Sd / 1000 * nDrivers).toFixed(3)}` : ``),

          {text: '', exportable: false, element: <button onClick={() => saveDriver(driver)}>{'Show'}</button>},
        ]
      }
    }
  );

  const exportTable = () => {
    void navigator.clipboard.writeText(
      [
        allDriversHeaders.filter(h => !!h),
        ...tableData
          .map(d => d.cells.filter(c => c.exportable).map(c => c.text))
      ]
        .map(r => r.join('\t'))
        .join('\n')
    )
  }

  return (
    <div>
      <div className={"sectionTitle"}>DRIVER DATABASE</div>

      <table className={styles.noBorder}>
        <tbody>

        <tr>
          <td className={styles.peachCell} rowSpan={2}><div className={styles.rotateCell}>Drivers</div></td>
          <td>Nominal Driver Piston Area - Sd</td>
          <td><input value={Sd} onChange={e => setSd(e.target.value)}/></td>
          <td>[cm2]</td>
        </tr>

        <tr>
          <td>Find all drivers with same Sd, within</td>
          <td><input value={filterDriversPercent} onChange={e => setFilterDriversPercent(e.target.value)}/></td>
          <td>[%]</td>
        </tr>

        </tbody>
      </table>

      <div className={styles.buttonSpacing}>
        <span>
          <button onClick={exportTable}>{`Export table`}</button>
          <button onClick={() => setShowTable(!showTable)}>{showTable ? `Hide table` : `Show table`}</button>
        </span>
      </div>

      {showTable && <table className={styles.driverTable}>
          <thead>
          <tr>
            {allDriversHeaders.map((s, i) => <th key={i} className={styles.theadCell}>{s}</th>)}
          </tr>
          </thead>
          <tbody>
          {tableData
            .map(({driver, cells}) => (<tr
              key={driver.model}
            >
              {cells.map((c, i) => <td
                key={i}
                className={styles.cellSpacing}
                style={c.style}
                onClick={c.onClick}
              >
                {c.element ?? c.text}
              </td>)}
            </tr>))}
          </tbody>
      </table>}
    </div>
  );

}

export default DriverDatabase;