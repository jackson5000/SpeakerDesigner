import {useState} from "react";
import DriverResponses from "./DriverResponses";
import styles from './SpeakerDesign.module.scss';

const SpeakerDesign = () => {

  const [Vb, setVb] = useState('50');
  const [Fb, setFb] = useState('30');
  const [ported, setPorted] = useState(true);
  const [nDrivers, setNDrivers] = useState('1');

  return (
    <div>

      <div className={"sectionTitle"}>INPUT</div>
      <table className={styles.noBorder}>
        <tbody>

        <tr>
          <td className={styles.blueCell} rowSpan={4}><div className={styles.rotateCell}>Box</div></td>
          <td>Enclosure Type</td>
          <td>
            <button className={ported ? styles.selectedButton : styles.unselectedButton} onClick={() => setPorted(true)}>{`Ported`}</button>
            <button className={ported ? styles.unselectedButton : styles.selectedButton} onClick={() => setPorted(false)}>{`Closed box`}</button>
          </td>
          <td/>
        </tr>

        <tr>
          <td>Total Box Volume - Vb</td>
          <td><input value={Vb} onChange={e => setVb(e.target.value)}/></td>
          <td>[L]</td>
        </tr>

        <tr>
          <td>Port/Box Tuning Frequency - Fb</td>
          <td><input disabled={!ported} value={Fb} onChange={e => setFb(e.target.value)}/></td>
          <td>[Hz]</td>
        </tr>

        <tr>
          <td>Number of Drivers</td>
          <td><input value={nDrivers} onChange={e => setNDrivers(e.target.value)}/></td>
          <td>[#]</td>
        </tr>

        </tbody>
      </table>

      <DriverResponses
        Vb={Number(Vb)}
        Fb={Number(Fb)}
        ported={ported}
        nDrivers={Number(nDrivers)}
      />

    </div>
  )
}

export default SpeakerDesign;
