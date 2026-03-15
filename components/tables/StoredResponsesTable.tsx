import styles from "../SpeakerDesign.module.scss";
import {DriverResponseStyleNamed, DriverTableCell} from "../types";
import {ChangeEvent, useState} from "react";
import {derivedParams} from "../../model/speaker-designer";

type StoredResponsesTableProps = {
  savedTracesWithColor: Array<DriverResponseStyleNamed>,
  updateSavedTrace: (index: number, trace: DriverResponseStyleNamed) => void,
  recalculate: (index: number, dr: DriverResponseStyleNamed) => void,
  removeTrace: (index: number) => void,
  duplicateTrace: (index: number) => void,
  setHoveredDriver: (hovered: string | null) => void;
}

const StoredResponseRow = (props: Pick<StoredResponsesTableProps, 'duplicateTrace' | 'removeTrace' | 'recalculate' | 'setHoveredDriver'> & {
  i: number,
  drsn: DriverResponseStyleNamed
}) => {
  const {i, recalculate, removeTrace, duplicateTrace, setHoveredDriver, drsn} = props;

  const [Vb, setVb] = useState(`${drsn.Vb}`);
  const [Fb, setFb] = useState(`${drsn.Fb}`);
  const [nDrivers, setNDrivers] = useState(`${drsn.nDrivers}`);

  const [Sd  , setSd  ] = useState(drsn.driver.Sd.toFixed(2));
  const [Re  , setRe  ] = useState(drsn.driver.Re.toFixed(2));
  const [Mms , setMms ] = useState((drsn.driver.Mms * 1000).toFixed(2));
  const [BL  , setBL  ] = useState(drsn.driver.BL.toFixed(2));
  const [Cms , setCms ] = useState((drsn.driver.Cms * 1e6).toFixed(1));
  const [Rms , setRms ] = useState(drsn.driver.Rms.toFixed(2));
  const [Xmax, setXmax] = useState((drsn.driver.Xmax ?? 0) > 0 ? drsn.driver.Xmax.toFixed(2) : '');

  const {Fs, Vas, Qts} = derivedParams(drsn.driver);

  const editableCell = (value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void, style?: any) => {
    return {text: '', exportable: true, element: <input className={styles.plainInput}
                                                        style={style}
                                                        value={value}
                                                        onChange={onChange} />};
  }

  const totalDisplacement = drsn.driver.Xmax * drsn.driver.Sd / 1000 * drsn.nDrivers;

  const cells: Array<DriverTableCell> = [
    {text: '', exportable: false, style: {backgroundColor: drsn.color}},
    editableCell(drsn.name, e => recalculate(i, {...drsn, name: e.target.value}), {width: '140px'}),
    {text: '', exportable: false, element: <div onClick={() => recalculate(i, {...drsn, ported: !drsn.ported})}>{drsn.ported ? 'Ported' : 'Closed'}</div>},

    editableCell(Vb, e => {setVb(e.target.value); recalculate(i, {...drsn, Vb: Number(e.target.value)})}),
    editableCell(Fb, e => {setFb(e.target.value); recalculate(i, {...drsn, Fb: Number(e.target.value)})}),
    editableCell(nDrivers, e => {setNDrivers(e.target.value); recalculate(i, {...drsn, nDrivers: Number(e.target.value)})}),

    editableCell(Sd  , e => {setSd  (e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, Sd  : Number(e.target.value)}})}),
    {text: Fs.toFixed(2), exportable: true},
    {text: Qts.toFixed(2), exportable: true},
    {text: Vas.toFixed(2), exportable: true},
    editableCell(Re  , e => {setRe  (e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, Re  : Number(e.target.value)}})}),
    editableCell(Mms , e => {setMms (e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, Mms : Number(e.target.value) / 1000}})}),
    editableCell(BL  , e => {setBL  (e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, BL  : Number(e.target.value)}})}),
    editableCell(Cms , e => {setCms (e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, Cms : Number(e.target.value) / 1e6}})}),
    editableCell(Rms , e => {setRms (e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, Rms : Number(e.target.value)}})}),
    editableCell(Xmax, e => {setXmax(e.target.value); recalculate(i, {...drsn, driver: {...drsn.driver, Xmax: Number(e.target.value)}})}),

    {text: `${(totalDisplacement ?? 0  > 0) ? totalDisplacement.toFixed(3) : ''}`, exportable: true},

    {text: '', exportable: false, element: <button onClick={() => {
        duplicateTrace(i);
      }}>{'Duplicate'}</button>},
    {text: '', exportable: false, element: <button onClick={() => {
        removeTrace(i);
      }}>{'Remove'}</button>},
  ];

  return (
    <tr
      key={i}
      onMouseEnter={() => setHoveredDriver(drsn.name)}
      onMouseLeave={() => setHoveredDriver(null)}
    >
      {cells.map((c, j) => <td
        key={j}
        className={styles.cellSpacing}
        style={c.style}
        onClick={c.onClick}
      >
        {c.element ?? c.text}
      </td>)}
    </tr>
  );
}

const StoredResponsesTable = (props: StoredResponsesTableProps) => {

  const {
    savedTracesWithColor,
    recalculate, setHoveredDriver,
    removeTrace, duplicateTrace,
  } = props;

  const storedTraceHeaders = [
    '',
    'Name',
    'Porting',
    'Vb [L]',
    'Fb [Hz]',
    'Drivers [#]',
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

  return (
    <div className={styles.storedTraces}>
      <div className={"sectionTitle"}>DRIVERS</div>
      <table className={styles.driverTable}>
        <thead>
        <tr>
          <th/>
          <th/>
          <th colSpan={4} className={styles.blueHead}>Box</th>
          <th colSpan={11} className={styles.peachHead}>Driver TS Parameters</th>
        </tr>
        <tr>
          {storedTraceHeaders.map((s, i) => <th key={i} className={styles.theadCell}>{s}</th>)}
        </tr>
        </thead>
        <tbody>
        {savedTracesWithColor.map((drsn, i) => <StoredResponseRow
            key={i}
            recalculate={recalculate}
            duplicateTrace={duplicateTrace}
            removeTrace={removeTrace}
            setHoveredDriver={setHoveredDriver}
            i={i}
            drsn={drsn}
        />)}
        </tbody>
      </table>
    </div>
  );
}

export default StoredResponsesTable;