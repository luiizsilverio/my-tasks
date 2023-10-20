import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';

import styles from './styles.module.css';
import Textarea from '@/components/textarea';

export default function dashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.formContainer}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form>
              <Textarea placeholder='Digite a sua tarefa...' />
              <div className={styles.checkboxArea}>
                <input type="checkbox" id="public" className={styles.checkbox} />
                <label htmlFor="public">Deixar tarefa pública?</label>
              </div>
              <button type="submit" className={styles.button}>Salvar</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {}
  }
}
