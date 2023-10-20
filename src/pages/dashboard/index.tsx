import styles from './styles.module.css';
import Head from 'next/head';

export default function dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>


    </div>
  )
}
