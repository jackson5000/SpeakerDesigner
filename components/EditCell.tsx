import styles from './EditCell.module.scss';
import {useState} from "react";

const EditCell = ({value, onChanged}: {
  value: string,
  onChanged: (newVal: number) => void,
}) => {

  const [v, setV] = useState(value);

  const update = () => {
    try {
      onChanged(Number(v))
    } catch (e) {}
  }

  return <input className={styles.narrowPlainInput}
                value={v}
                onChange={e => setV(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    update()
                  }
                }}
                onBlur={update}
  />

}

export default EditCell;