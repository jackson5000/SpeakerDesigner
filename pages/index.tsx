import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import SpeakerDesign from "../components/SpeakerDesign";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Loudspeaker Database</title>
        <meta name="description" content="Speakers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Loudspeaker Database</h1>
        <h1 className={styles.title}>Low-Frequency SPL Simulator</h1>

        <SpeakerDesign />

      </main>

    </div>
  )
}

export default Home
