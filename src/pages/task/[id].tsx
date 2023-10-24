import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { doc, collection, query, where, getDoc } from 'firebase/firestore';

import styles from './styles.module.css';
import { db } from '@/services/firebaseConfig';

export default function Task() {

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;

  const docRef = doc(db, "tarefas", id);

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const miliseconds = snapshot.data()?.created_at.seconds * 1000;

  const task = {
    ...snapshot.data(),
    created_at: new Date(miliseconds).toLocaleDateString(),
    id,
  }

  return {
    props: { task }
  }
}
